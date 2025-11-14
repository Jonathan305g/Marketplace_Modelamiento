import React from 'react';

const ProductDetailModal = ({ product, onClose }) => {
    // Si no hay producto o la prop no fue pasada, no renderizamos
    if (!product) return null;

    const { name, price, location, category, size, material, description, images, created_at } = product;
    const firstImage = (images && images.length > 0) ? images[0] : '';
    const dateString = created_at ? new Date(created_at).toLocaleDateString() : 'Fecha Desconocida';

    return (
        // Fondo oscuro que cubre toda la pantalla (Overlay)
        <div 
            className="modal-overlay" 
            onClick={onClose} // Cierra si se hace clic fuera del contenido
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}
        >
            {/* Contenedor del contenido del modal */}
            <div 
                className="modal-content" 
                onClick={e => e.stopPropagation()} // Evita que el clic interno cierre el modal
                style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
            >
                {/* Botón de cerrar (X) */}
                <button 
                    onClick={onClose} 
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer' }}
                >
                    &times;
                </button>

                <h2 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>{name}</h2>

                <div style={{ display: 'flex', gap: '20px' }}>
                    {/* Sección de Imagen */}
                    <div style={{ flex: '0 0 40%' }}>
                        {firstImage ? (
                            <img src={firstImage} alt={name} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }} />
                        ) : (
                            <div style={{ backgroundColor: '#eee', height: '300px', borderRadius: '8px' }}></div>
                        )}
                    </div>

                    {/* Sección de Detalles */}
                    <div style={{ flex: '1' }}>
                        <p style={{ fontSize: '1.8em', fontWeight: 'bold', color: '#dc3545', marginBottom: '15px' }}>
                            ${price ? price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                        </p>
                        
                        <h3 style={{ marginBottom: '10px' }}>Descripción:</h3>
                        <p style={{ marginBottom: '20px', whiteSpace: 'pre-wrap' }}>{description}</p>
                        
                        <p><strong>Ubicación:</strong> {location}</p>
                        <p><strong>Categoría:</strong> {category}</p>
                        <p><strong>Tamaño:</strong> {size || 'N/A'}</p>
                        <p><strong>Material:</strong> {material || 'N/A'}</p>
                        <p style={{ marginTop: '15px', color: '#6c757d' }}>Publicado el: {dateString}</p>
                        
                        <button className="btn btn-primary" style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
                            Contactar Vendedor
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductDetailModal;