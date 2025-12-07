import React, { useState, useEffect } from 'react';
import CATEGORIES from '../constants/categories';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
// Importa tus estilos CSS si tienes uno dedicado al formulario (ej: './productPublish.css')

const ProductPublish = ({ onClose, onProductSubmitted, productToEdit: propProductToEdit }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, user, loading } = useAuth();

    // Soportamos pasar productToEdit por props (cuando se usa como componente) o por location.state (cuando se navega a /publish)
    const productToEdit = propProductToEdit || (location.state && location.state.productToEdit) || null;
    const isEditMode = Boolean(productToEdit);
    // 1. ESTADO: Añadimos 'size' y 'category' (reemplazando el antiguo campo 'material')
    const [productData, setProductData] = useState({
        name: '', // Nombre del producto
        size: '', // NUEVO: Tamaño (ej: S, M, L o dimensiones)
        // material removed; use `category` below
        price: '', // Precio
        description: '', // Descripción
        category: '',
        location: '',
        imageUrls: [''], 
        type: 'producto',
    });
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    
    // PROTECCIÓN: Redirigir si no está autenticado
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            setStatusMessage({ type: 'error', text: 'Debes iniciar sesión para publicar un producto.' });
            setTimeout(() => {
                navigate('/login', { state: { from: location.pathname } });
            }, 1500);
        }
    }, [isAuthenticated, loading, navigate, location]);

    useEffect(() => {
        if (isEditMode && productToEdit) {
            setProductData({
                name: productToEdit.name || '',
                size: productToEdit.size || '',
                price: productToEdit.price || '',
                description: productToEdit.description || '',
                category: productToEdit.category || '',
                location: productToEdit.location || '',
                // 'images' viene del backend, 'imageUrls' es lo que usa el form
                imageUrls: productToEdit.images && productToEdit.images.length > 0 ? productToEdit.images : [''],
                type: productToEdit.type || 'producto',
            });
        }
    }, [productToEdit, isEditMode]);

    // Función genérica para manejar cambios en todos los inputs (excepto imágenes)
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        // Si el campo es 'price', nos aseguramos de que solo contenga números y puntos/comas
        if (name === 'price') {
             // Opcional: Permite comas y puntos, pero solo almacena el string
             const cleanValue = value.replace(/[^0-9.,]/g, '');
             setProductData(prev => ({ ...prev, [name]: cleanValue }));
        } else {
             setProductData(prev => ({ ...prev, [name]: value }));
        }
    };

    // Función específica para manejar cambios en las URLs de las imágenes
    const handleImageChange = (index, value) => {
        const newImageUrls = [...productData.imageUrls];
        newImageUrls[index] = value;
        setProductData(prev => ({ ...prev, imageUrls: newImageUrls }));
    };

    // Función para añadir otro campo de URL de imagen
    const addImageField = () => {
        setProductData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage({ type: '', text: '' });

        // PROTECCIÓN: Verificar autenticación nuevamente antes de enviar
        if (!isAuthenticated || !user) {
            setStatusMessage({ type: 'error', text: 'Debes iniciar sesión para publicar un producto.' });
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setStatusMessage({ type: 'error', text: 'Debes iniciar sesión para publicar un producto.' });
            return;
        }

        // Filtra URLs vacías antes de enviar
        const filteredImageUrls = productData.imageUrls.filter(url => url.trim() !== '');
        // Convertimos el precio. Usamos replace para aceptar ',' como separador decimal.
        const priceToNumber = parseFloat(String(productData.price).replace(',', '.'));
        
        if (isNaN(priceToNumber) || priceToNumber <= 0) {
             setStatusMessage({ type: 'error', text: 'El precio debe ser un número válido mayor a cero.' });
             return;
        }

        const dataToSend = {
            ...productData,
            price: priceToNumber, // <-- Precio ya convertido a número
            imageUrls: filteredImageUrls
        };

        try {
            // --- LÓGICA MODIFICADA: O actualiza (PUT) o crea (POST) ---
            if (isEditMode) {
                // MODO EDICIÓN (PUT)
                const productId = productToEdit.id || productToEdit._id;
                if (!productId) throw new Error('ID de producto inválido');

                // En edición enviamos todos los campos (incluyendo imageUrls) para actualizar las imágenes
                const updateData = dataToSend;
                const resp = await api.put(`/products/${productId}`, updateData);
                const updatedProduct = resp.data?.product || resp.data;
                setStatusMessage({ type: 'success', text: `Producto "${updatedProduct?.name || ''}" actualizado con éxito!` });

            } else {
                // MODO CREACIÓN (POST)
                const response = await api.post('/products', dataToSend);
                const created = response.data?.product || response.data;
                setStatusMessage({ type: 'success', text: `Producto "${created?.name || ''}" publicado con éxito!` });
            }
            // --- FIN DE LÓGICA MODIFICADA ---

            // Llamamos a la función de 'Home' para cerrar el modal y refrescar
            setTimeout(() => {
                if (onProductSubmitted) {
                    onProductSubmitted();
                } else {
                    // Si se usó la ruta /publish, navegamos de vuelta al home
                    navigate('/home');
                }
            }, 1200);

            // No limpiamos el formulario aquí, se limpia al cerrar (en Home.jsx)
            
        } catch (err) {
            // Logueo más detallado para depuración
            try {
                console.error('Error creating/updating product (axios):', err.toJSON ? err.toJSON() : err);
            } catch (e) {
                console.error('Error creating/updating product (raw):', err);
            }
            const status = err.response?.status;
            const data = err.response?.data;
            console.error('Response status:', status);
            console.error('Response data:', data);

            // Mensaje para el usuario: preferir mensaje del servidor, si existe
            const serverMsg = data?.message || data?.error || err.message || 'Error de red.';
            setStatusMessage({ type: 'error', text: `(${status || '??'}) ${serverMsg}` });
        }
    };
//
    return (
        <div className="product-publish-form-container" style={{padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '30px auto', position: 'relative'}}>
            {/* PROTECCIÓN: Mostrar estado de carga */}
            {loading && (
                <div style={{textAlign: 'center', padding: '20px', fontSize: '1.1em', color: '#666'}}>
                    Cargando...
                </div>
            )}

            {/* PROTECCIÓN: Mostrar si no está autenticado */}
            {!loading && !isAuthenticated && (
                <div style={{textAlign: 'center', padding: '20px', fontSize: '1.1em', color: '#d9534f', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '4px'}}>
                    <p>Debes iniciar sesión para publicar un producto.</p>
                    <button 
                        onClick={() => navigate('/login')}
                        style={{marginTop: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                    >
                        Ir al Login
                    </button>
                </div>
            )}

            {/* Mostrar formulario solo si está autenticado */}
            {!loading && isAuthenticated && (
            <>
            <h2>{isEditMode ? 'Editar Publicación' : 'Crear Nueva Publicación'}</h2>
            
            {/* Botón de cerrar */}
            {onClose && (
                <button 
                    onClick={onClose} 
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer' }}
                >
                    &times;
                </button>
            )}

            <form onSubmit={handleSubmit}>
                
                {/* 1. Nombre del Producto */}
                <div style={{marginBottom: '15px'}}>
                    <label htmlFor="name" style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Nombre del Producto:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={productData.name}
                        onChange={handleChange}
                        required
                        style={{width: '100%', padding: '10px', boxSizing: 'border-box'}}
                    />
                </div>

                <div style={{display: 'flex', gap: '20px', marginBottom: '15px'}}>
                                <div style={{flex: 1}}>
                                    <label htmlFor="size" style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Tamaño:</label>
                                    <input
                                        type="text"
                                        id="size"
                                        name="size"
                                        value={productData.size}
                                        onChange={handleChange}
                                        style={{width: '100%', padding: '10px', boxSizing: 'border-box'}}
                                    />
                                </div>
                                <div style={{flex: 1}}>
                                    <label htmlFor="category" style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Categoría:</label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={productData.category}
                                        onChange={handleChange}
                                        style={{width: '100%', padding: '10px', boxSizing: 'border-box'}}
                                    >
                                        <option value="">Selecciona categoría</option>
                                        {CATEGORIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                {/* 3. Precio */}
                <div style={{marginBottom: '15px'}}>
                    <label htmlFor="price" style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Precio ($):</label>
                    <input
                        type="text"
                        id="price"
                        name="price"
                        value={productData.price}
                        onChange={handleChange}
                        step="0.01"
                        required
                        min="0.01"
                        style={{width: '100%', padding: '10px', boxSizing: 'border-box'}}
                    />
                </div>

                {/* 4. Descripción */}
                <div style={{marginBottom: '15px'}}>
                    <label htmlFor="description" style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Descripción:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={productData.description}
                        onChange={handleChange}
                        rows="4"
                        style={{width: '100%', padding: '10px', boxSizing: 'border-box'}}
                    ></textarea>
                </div>
                
                {/* 5. URLs de Imágenes */}
                <h3 style={{marginTop: '25px', marginBottom: '10px'}}>Imágenes (URLs de Referencia)</h3>
                {productData.imageUrls.map((url, index) => (
                    <div key={index} style={{marginBottom: '10px'}}>
                        <input
                            type="text"
                            placeholder={`URL Imagen ${index + 1}`}
                            value={url}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            style={{width: '100%', padding: '10px', boxSizing: 'border-box'}}
                        />
                    </div>
                ))}
                <button 
                    type="button" 
                    onClick={addImageField}
                    style={{padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px'}}
                >
                    Añadir otra URL de Imagen
                </button>
                
                {/* Mensajes de feedback */}
                {statusMessage.text && (
                    <p style={{ color: statusMessage.type === 'error' ? 'red' : 'green', marginTop: '15px', padding: '10px', border: `1px solid ${statusMessage.type === 'error' ? 'red' : 'green'}` }}>
                        {statusMessage.text}
                    </p>
                )}

                {/* Botón de envío */}
                <button 
                    type="submit"
                    style={{ padding: '12px 25px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', marginTop: '20px', fontSize: '1.1em' }}
                >
                    {isEditMode ? 'Actualizar Publicación' : 'Publicar Producto'}
                </button>
            </form>
            </>
            )}
        </div>
    );
};

export default ProductPublish;