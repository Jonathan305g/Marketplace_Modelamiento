import { Router } from 'express';
import { 
    createProduct, 
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    toggleFavorite,
    getFavoriteProducts

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
// Usamos POST para el "toggle" ya que crea/elimina un estado
router.post('/products/:id/favorite', authRequired, toggleFavorite);
// GET para obtener la lista de productos favoritos del usuario logueado
router.get('/favorites', authRequired, getFavoriteProducts);

export default router;