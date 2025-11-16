import { Router } from 'express';
import { 
    createProduct, 
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,

} from './product.controller.js';
import { authRequired } from './middleware/auth.middleware.js'; 

const router = Router();

// Rutas públicas: cualquiera puede ver los productos
router.get('/products', getProducts); 
// Obtener un producto por ID
router.get('/products/:id', getProductById);

// Rutas protegidas: requiere autenticación para publicar, editar, o eliminar
router.post('/products', authRequired, createProduct);
// Editar un producto (solo el dueño)
router.put('/products/:id', authRequired, updateProduct);
// Ruta protegida para la eliminación
router.delete('/products/:id', authRequired, deleteProduct);

export default router;