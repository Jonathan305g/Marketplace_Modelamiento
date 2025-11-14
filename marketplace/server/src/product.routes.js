import { Router } from 'express';
import { 
    createProduct, 
    getProducts,
    // updateProduct, // Asume que estas funciones están implementadas en el controller
    // deleteProduct
} from './product.controller.js';
import { authRequired } from './middleware/auth.middleware.js'; 

const router = Router();

// Rutas públicas: cualquiera puede ver los productos
router.get('/products', getProducts); 
// router.get('/products/:id', getProductById); 

// Rutas protegidas: requiere autenticación para publicar, editar, o eliminar
router.post('/products', authRequired, createProduct);
// router.put('/products/:id', authRequired, updateProduct);
// router.delete('/products/:id', authRequired, deleteProduct);

export default router;