import React, { useState } from 'react';
// Importa tus estilos CSS si tienes uno dedicado al formulario (ej: './productPublish.css')

const ProductPublish = ({ onClose }) => {
    // 1. ESTADO: Añadimos 'size' y 'material'
    const [productData, setProductData] = useState({
        name: '', // Nombre del producto
        size: '', // NUEVO: Tamaño (ej: S, M, L o dimensiones)
        material: '', // NUEVO: Material (ej: Algodón, Cuero, Madera)
        price: '', // Precio
        description: '', // Descripción
        category: '',
        location: '',
        imageUrls: [''], // Array de URLs de imágenes
        type: 'producto',
    });
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    
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

        const token = localStorage.getItem('token'); 
        if (!token) {
            setStatusMessage({ type: 'error', text: 'Debes iniciar sesión para publicar un producto.' });
            return;
        }

        // Filtra URLs vacías antes de enviar
        const filteredImageUrls = productData.imageUrls.filter(url => url.trim() !== '');
        // Convertimos el precio. Usamos replace para aceptar ',' como separador decimal.
        const priceToNumber = parseFloat(productData.price.replace(',', '.'));
        
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
            const response = await fetch('http://localhost:4000/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
                body: JSON.stringify({ ...productData, imageUrls: filteredImageUrls }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatusMessage({ type: 'success', text: `Producto "${data.name}" publicado con éxito!` });
                setTimeout(() => {
                    if (onClose) onClose(); 
                }, 1500); 
                // Limpiar el estado al publicar con éxito
                setProductData({
                    name: '', size: '', material: '', price: 0, description: '', 
                    category: '', location: '', imageUrls: [''], type: 'producto',
                });
            } else {
                setStatusMessage({ type: 'error', text: data.message || 'Error desconocido' });
            }
        } catch (err) {
            setStatusMessage({ type: 'error', text: 'Error de red. Verifica que el servidor esté activo.' });
        }
    };
//
    return (
        <div className="product-publish-form-container" style={{padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '30px auto', position: 'relative'}}>
            <h2>Crear Nueva Publicación</h2>
            
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

                {/* 2. Tamaño y Material (en línea) */}
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
                        <label htmlFor="material" style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>Material:</label>
                        <input
                            type="text"
                            id="material"
                            name="material"
                            value={productData.material}
                            onChange={handleChange}
                            style={{width: '100%', padding: '10px', boxSizing: 'border-box'}}
                        />
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
                    Publicar Producto
                </button>
            </form>
        </div>
    );
};

export default ProductPublish;