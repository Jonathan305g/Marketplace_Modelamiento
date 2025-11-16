import { pool } from './db.js'; // Importa tu pool de conexión a PG

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

        // 2. Insertar las URLs de las imágenes
        if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
            const validUrls = imageUrls.filter(url => url && url.trim() !== '');
            
            const imageValues = validUrls.map(url => 
                `(${productId}, ${pool.escapeLiteral(url)})`
            ).join(', ');
            
            if (imageValues) {
                const imageInsertQuery = `
                    INSERT INTO product_images (product_id, image_url)
                    VALUES ${imageValues};
                `;
                await pool.query(imageInsertQuery);
            }
        }

        await pool.query('COMMIT'); // Confirmar si todo fue bien

        res.status(201).json({ 
            message: 'Producto publicado con éxito', 
            productId,
            name,
        });

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
            return res.status(404).json({ message: 'Producto no encontrado o no autorizado para editar.' });
        }
        
        // (Opcional: aquí podrías manejar la actualización de imágenes, 
        // borrando las anteriores e insertando nuevas)

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al actualizar el producto.' });
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