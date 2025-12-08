import React from 'react';
import './ProductDetailModal.css';

// Acepta las nuevas props: onDelete, currentUserId y onContactSeller (chat)
const ProductDetailModal = ({ product, onClose, onDelete, currentUserId, onContactSeller }) => {
    if (!product) return null;

    const {
        id,
        name,
        price,
        location,
        category,
        size,
        material,
        description,
        images,
        created_at,
        user_id,
        contact_info
    } = product;

    const isOwner = currentUserId && (currentUserId.toString() === user_id?.toString());
    const firstImage = (images && images.length > 0) ? images[0] : null;
    const dateString = created_at ? new Date(created_at).toLocaleDateString() : 'N/A';
    const priceDisplay = price ? price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00';

    const handleDeleteClick = () => {
        if (onDelete) onDelete(id);
    };

    const handleContactClick = () => {
        if (onContactSeller) {
            onContactSeller(product);
            return;
        }

        // Fallback simple: si hay email abre mailto, si es número abre WhatsApp, si no alerta.
        if (contact_info && contact_info.includes('@')) {
            window.location.href = `mailto:${contact_info}`;
        } else if (contact_info && contact_info.replace(/\D/g, '').length >= 8) {
            const phone = contact_info.replace(/\D/g, '');
            window.open(`https://wa.me/${phone}`, '_blank');
        } else {
            alert('Contacto del vendedor: ' + (contact_info || 'No proporcionado'));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Cerrar">&times;</button>

                <div className="modal-main">
                    <div className="modal-body">
                        <h2 className="modal-title">{name}</h2>
                        <div className="modal-price">${priceDisplay}</div>

                        <div className="modal-details">
                            <div className="detail-item">
                                <div className="detail-label">Categoría</div>
                                <div className="detail-value">{category || 'N/A'}</div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-label">Ubicación</div>
                                <div className="detail-value">{location || 'N/A'}</div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-label">Tamaño</div>
                                <div className="detail-value">{size || 'N/A'}</div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-label">Material</div>
                                <div className="detail-value">{material || 'N/A'}</div>
                            </div>
                        </div>

                        <div className="modal-description">
                            <div className="detail-label">Publicado</div>
                            <div className="detail-value" style={{ marginBottom: '10px' }}>{dateString}</div>
                            {!isOwner && (
                                <div className="detail-value" style={{ marginBottom: '10px' }}>
                                    <strong>Contacto del vendedor:</strong> {contact_info || 'No proporcionado'}
                                </div>
                            )}
                            <div className="detail-label" style={{ marginTop: '6px' }}>Descripción</div>
                            <p style={{ margin: 0 }}>{description || 'Sin descripción'}</p>
                        </div>

                        <div className="modal-footer">
                            {isOwner && (
                                <button className="modal-btn modal-btn-danger" onClick={handleDeleteClick}>
                                    Eliminar Producto
                                </button>
                            )}

                            {!isOwner && (
                                <button className="modal-btn modal-btn-primary" onClick={handleContactClick}>
                                    Contactar Vendedor
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="modal-image-wrapper">
                        <img
                            src={firstImage || 'https://placehold.co/500x400?text=Sin+Imagen'}
                            alt={name}
                            className="modal-image"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;