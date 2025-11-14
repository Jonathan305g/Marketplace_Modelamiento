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
                `(${productId}, '${url}')`
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
    try {
        const result = await pool.query(`
            SELECT 
                p.id, p.name, p.description, p.price, p.category, p.location,
                COALESCE(json_agg(pi.image_url) FILTER (WHERE pi.image_url IS NOT NULL), '[]') as images
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.state = 'visible'
            GROUP BY p.id
            ORDER BY p.created_at DESC;
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos.' });
    }
};
