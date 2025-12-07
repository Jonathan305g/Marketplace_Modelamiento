import { supabase } from './db.js'; // Importa tu pool de conexión a PG

// --- C R E A T E (Crear Producto) ---
export const createProduct = async (req, res) => {
    // imageUrls se espera como un array de strings (URLs) desde el frontend
    const { name, description, price, category, location, imageUrls, type, state } = req.body;
    const userId = req.userId; // ID obtenido del middleware de autenticación

    if (!userId || !name || !price) {
        return res.status(400).json({ message: 'Faltan campos obligatorios (Usuario, Nombre, Precio).' });
    }

    try {
        await pool.query('BEGIN'); // Iniciar transacción atómica

        // 1. Insertar el producto principal y obtener el nuevo ID
        const productQuery = `
            INSERT INTO products (user_id, name, description, price, category, location, type, state)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id;
        `;
        const productResult = await pool.query(productQuery, [
            userId,
            name,
            description,
            price,
            category,
            location,
            type || 'producto',
            state || 'visible',
        ]);
        const productId = productResult.rows[0].id;

        // 2. Insertar las URLs de las imágenes (usando parámetros para evitar inyección y errores)
        if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
            const trimmed = imageUrls.map(u => (u || '').trim());
            const validUrls = trimmed.filter(url => url !== '');

            // Validar formato de URL: debe comenzar por http:// o https:// para cumplir constraint
            const invalidUrls = validUrls.filter(url => !/^https?:\/\//i.test(url));
            if (invalidUrls.length > 0) {
                await pool.query('ROLLBACK');
                return res.status(400).json({ message: 'Algunas URLs no son válidas. Deben comenzar con http:// o https://', invalidUrls });
            }

            if (validUrls.length > 0) {
                // Construimos un INSERT con placeholders paramétricos:
                // Ej: VALUES ($1, $2), ($1, $3), ... donde $1 es productId
                const placeholders = validUrls.map((_, i) => `($1, $${i + 2})`).join(', ');
                const params = [productId, ...validUrls];
                const imageInsertQuery = `INSERT INTO product_images (product_id, image_url) VALUES ${placeholders};`;
                await pool.query(imageInsertQuery, params);
            }
        }

        await pool.query('COMMIT'); // Confirmar si todo fue bien

        // Recuperar el producto recién creado con sus imágenes para devolverlo al cliente
        const created = await pool.query(
            `SELECT 
                p.id, p.name, p.description, p.price, p.category, p.location, p.type, p.created_at,
                p.user_id,
                COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL), '[]') as images
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.id = $1
            GROUP BY p.id;
            `, [productId]
        );

        res.status(201).json({ message: 'Producto publicado con éxito', product: created.rows[0] });

    } catch (error) {
        await pool.query('ROLLBACK'); // Deshacer si hubo un error
        console.error('Error al crear el producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al crear el producto.', error: error.message });
    }
};

// --- R E A D (Ejemplo de obtener todos los productos visibles) ---
export const getProducts = async (req, res) => {
    const { category, location, min_price, max_price, search } = req.query;

    let query = `
        SELECT 
            p.id, p.name, p.description, p.price, p.category, p.location, p.created_at,
            p.user_id,
            COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL), '[]') as images
        FROM products p
        LEFT JOIN product_images pi ON p.id = pi.product_id
        WHERE p.state = 'visible' 
    `;
    
    const params = [];
    let paramIndex = 1;

    if (category) {
        query += ` AND p.category = $${paramIndex++}`;
        params.push(category);
    }
    if (location) {
        query += ` AND p.location ILIKE $${paramIndex++}`; // ILIKE para case-insensitive
        params.push(`%${location}%`);
    }
    if (min_price) {
        query += ` AND p.price >= $${paramIndex++}`;
        params.push(min_price);
    }
    if (max_price) {
        query += ` AND p.price <= $${paramIndex++}`;
        params.push(max_price);
    }
     if (search) {
        // Búsqueda simple en nombre y descripción
        query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
    }

    query += `
        GROUP BY p.id
        ORDER BY p.created_at DESC;
    `;

    try {
        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error al obtener productos con filtros:", error);
        res.status(500).json({ message: 'Error al obtener productos.' });
    }
};

// --- R E A D (Obtener UN Producto por ID - Comprador/Público) ---
// --- NUEVA FUNCIÓN ---
export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                p.id, p.name, p.description, p.price, p.category, p.location, p.type, p.created_at,
                p.user_id, -- Opcional: para mostrar "Vendido por"
                u.name as seller_name, -- Opcional: nombre del vendedor
                COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL), '[]') as images
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            LEFT JOIN users u ON p.user_id = u.id -- Opcional: unir con usuarios
            WHERE p.id = $1 AND p.state = 'visible'
            GROUP BY p.id, u.name;
        `, [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Producto no encontrado o no está visible.' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
         console.error("Error al obtener producto por ID:", error);
        res.status(500).json({ message: 'Error al obtener el producto.' });
    }
};


// --- U P D A T E (Actualizar Producto - Vendedor) ---
// --- NUEVA FUNCIÓN ---
export const updateProduct = async (req, res) => {
    const { id } = req.params; // ID del producto
    const userId = req.userId; // ID del vendedor (autenticado)
    
    // Campos que el vendedor puede editar
    const { name, description, price, category, location, availability, type, state } = req.body;

    // (Aquí iría una validación más robusta de los campos entrantes)
    if (!name || !price) {
         return res.status(400).json({ message: 'Nombre y Precio son obligatorios.' });
    }

    try {
        await pool.query('BEGIN');

        // La consulta verifica que el ID del producto ($1) y el ID del usuario ($2) coincidan
        const productQuery = `
            UPDATE products SET 
                name = $3,
                description = $4,
                price = $5,
                category = $6,
                location = $7,
                availability = $8,
                type = $9,
                state = $10
            WHERE id = $1 AND user_id = $2
            RETURNING *; 
        `;
        
        const result = await pool.query(productQuery, [
            id, 
            userId,
            name,
            description,
            price,
            category,
            location,
            availability,
            type,
            state || 'visible' // El vendedor puede ocultarlo (ej: 'oculto')
        ]);

        if (result.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Producto no encontrado o no autorizado para editar.' });
        }

        // Manejar actualización de imágenes si vienen en el body como imageUrls
        const { imageUrls } = req.body;
        if (imageUrls && Array.isArray(imageUrls)) {
            const validUrls = imageUrls.filter(url => url && url.trim() !== '');
            // Borrar imágenes existentes
            await pool.query('DELETE FROM product_images WHERE product_id = $1', [id]);
            if (validUrls.length > 0) {
                const placeholders = validUrls.map((_, i) => `($1, $${i + 2})`).join(', ');
                const params = [id, ...validUrls];
                const imageInsertQuery = `INSERT INTO product_images (product_id, image_url) VALUES ${placeholders};`;
                await pool.query(imageInsertQuery, params);
            }
        }

        await pool.query('COMMIT');

        // Recuperar producto actualizado con sus imágenes
        const updated = await pool.query(
            `SELECT 
                p.id, p.name, p.description, p.price, p.category, p.location, p.type, p.created_at,
                p.user_id,
                COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL), '[]') as images
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.id = $1
            GROUP BY p.id;
            `, [id]
        );

        res.status(200).json(updated.rows[0]);

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar el producto.', error: error.message });
    }
};
// --- D E L E T E (Eliminar Producto) ---
export const deleteProduct = async (req, res) => {
    const { id } = req.params; // ID del producto a eliminar
    const userId = req.userId; // ID del usuario autenticado (del token)

    if (!id) {
        return res.status(400).json({ message: 'Se requiere el ID del producto.' });
    }

    try {
        // La consulta verifica que el producto exista Y que pertenezca al usuario autenticado.
        // La eliminación en 'product_images' se maneja automáticamente por ON DELETE CASCADE.
        const productQuery = `
            DELETE FROM products
            WHERE id = $1 AND user_id = $2
            RETURNING id;
        `;
        const result = await pool.query(productQuery, [id, userId]);

        if (result.rowCount === 0) {
            // Si rowCount es 0, el producto no existe o no pertenece a este usuario.
            return res.status(404).json({ message: 'Producto no encontrado o no autorizado para eliminar.' });
        }

        res.status(200).json({ message: `Producto con ID ${id} eliminado con éxito.` });

    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar el producto.', error: error.message });
    }
};

/// Controlador para 'Toggle' (Añadir/Quitar) Favorito ---
export const toggleFavorite = async (req, res) => {
  const { id } = req.params;   // ID del producto
  const userId = req.userId; // ID del usuario (del token)

  try {
    // 1. Intentar insertar el favorito
    const insertResult = await pool.query(
      `INSERT INTO favorites (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING id;`,
      [userId, id]
    );

    // 2. Si la inserción devolvió un ID, significa que se añadió
    if (insertResult.rowCount > 0) {
      return res.status(201).json({ message: 'Producto añadido a favoritos.' });
    }

    // 3. Si no insertó nada (porque ya existía), lo eliminamos
    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2',
      [userId, id]
    );
    
    res.status(200).json({ message: 'Producto eliminado de favoritos.' });

  } catch (error) {
    console.error('Error en toggleFavorite:', error);
    // Error común: el producto no existe (falla la Foreign Key)
    if (error.code === '23503') {
       return res.status(404).json({ message: 'El producto no existe.' });
    }
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

//Controlador para Obtener Productos Favoritos ---
export const getFavoriteProducts = async (req, res) => {
  const userId = req.userId; // ID del usuario (del token)

  try {
    // Consulta que une products y favorites, similar a tu getProducts
        const query = `
            SELECT 
                    p.id, p.name, p.description, p.price, p.category, p.location, p.created_at,
                    p.user_id,
                    COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL), '[]') as images,
                    MAX(f.created_at) as favorited_at
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            JOIN favorites f ON p.id = f.product_id  -- La unión clave
            WHERE f.user_id = $1 AND p.state = 'visible' -- Solo los del usuario y visibles
            GROUP BY p.id
            ORDER BY favorited_at DESC;
        `;
    
    const result = await pool.query(query, [userId]);
    res.status(200).json(result.rows);
    
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    res.status(500).json({ message: 'Error al obtener favoritos.' });
  }
};