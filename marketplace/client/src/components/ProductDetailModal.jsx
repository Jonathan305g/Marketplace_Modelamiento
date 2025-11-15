import React from 'react';

// Acepta las nuevas props: onDelete y currentUserId
const ProductDetailModal = ({ product, onClose, onDelete, currentUserId }) => {
    // Si no hay producto o la prop no fue pasada, no renderizamos
    if (!product) return null;

    const { 
        id, // Incluimos el ID del producto
        name, 
        price, 
        location, 
        category, 
        size, 
        material, 
        description, 
        images, 
        created_at,
        user_id // ID del dueño del producto (viene del backend)
    } = product;
    
    // Convertimos ambos IDs a string para asegurar una comparación correcta
    const isOwner = currentUserId && (currentUserId.toString() === user_id.toString());
    
    const firstImage = (images && images.length > 0) ? images[0] : null;
    const dateString = created_at ? new Date(created_at).toLocaleDateString() : 'N/A';
    const priceDisplay = price ? price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00';

    const handleDeleteClick = () => {
        // Llamamos a la función de eliminación, que está definida en Home.jsx
        if (onDelete) {
            onDelete(id); 
        }
    };

    return (
        // Fondo oscuro que cubre toda la pantalla (Overlay)
        <div 
            className="modal-overlay" 
            onClick={onClose} 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}
        >
            <div 
                className="modal-content" 
                onClick={e => e.stopPropagation()} 
                style={{ backgroundColor: '#252835ff', padding: '30px', borderRadius: '10px', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
            >
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer' }}>
                    &times;
                </button>

                {/* TÍTULO Y PRECIO (Mejora Estética) */}
                <h2 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '15px' }}>{name}</h2>
                <p style={{ fontSize: '2em', fontWeight: '900', color: '#dc3545', marginBottom: '20px' }}>
                    ${priceDisplay}
                </p>

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    {/* Sección de Imagen */}
                    <div style={{ flex: '0 0 45%', minWidth: '300px' }}>
                        <img 
                            src={firstImage || 'https://via.placeholder.com/400?text=Sin+Imagen'} 
                            alt={name} 
                            style={{ width: '100%', height: 'auto', maxHeight: '350px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)' }} 
                        />
                        {/* Se pueden añadir más imágenes aquí si el array 'images' tiene más elementos */}
                    </div>

                    {/* Sección de Detalles */}
                    <div style={{ flex: '1' }}>
                        
                        <h3 style={{ marginBottom: '10px', fontSize: '1.4em' }}>Detalles del Producto</h3>
                        <ul style={{ listStyleType: 'none', padding: 0, lineHeight: '1.8' }}>
                            <li><strong>Categoría:</strong> {category}</li>
                            <li><strong>Ubicación:</strong> {location}</li>
                            <li><strong>Tamaño:</strong> {size || 'N/A'}</li>
                            <li><strong>Material:</strong> {material || 'N/A'}</li>
                            <li style={{ color: '#6c757d', marginTop: '10px' }}>Publicado: {dateString}</li>
                        </ul>
                        
                        <h3 style={{ marginTop: '20px', borderTop: '1px dashed #eee', paddingTop: '15px', marginBottom: '10px' }}>Descripción</h3>
                        <p style={{ marginBottom: '20px', whiteSpace: 'pre-wrap' }}>{description}</p>
                        
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                            {/* BOTÓN DE ELIMINAR (Solo visible para el dueño) */}
                            {isOwner && (
                                <button 
                                    onClick={handleDeleteClick}
                                    style={{ 
                                        padding: '10px 20px', 
                                        backgroundColor: '#dc3545', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Eliminar Producto ❌
                                </button>
                            )}

                            <button className="btn btn-primary" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
                                Contactar Vendedor
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductDetailModal;