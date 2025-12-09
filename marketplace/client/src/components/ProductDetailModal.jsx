import React, { useState } from 'react';
import './ProductDetailModal.css';
import ChatBox from "./ChatBox";

const ProductDetailModal = ({
    product,
    onClose,
    onDelete,
    currentUserId,
    onContactSeller
}) => {
    if (!product) return null;

    const {
        id,          // productId para el chat
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

    const [showChat, setShowChat] = useState(false);

    const isOwner =
        currentUserId && currentUserId.toString() === user_id?.toString();

    const firstImage = images?.length > 0 ? images[0] : null;
    const dateString = created_at
        ? new Date(created_at).toLocaleDateString()
        : "N/A";
    const priceDisplay = price
        ? price.toLocaleString(undefined, { minimumFractionDigits: 2 })
        : "0.00";

    const handleDeleteClick = () => {
        if (onDelete) onDelete(id);
    };

    const handleContactClick = () => {
        // si tienes función personalizada
        if (onContactSeller) return onContactSeller(product);

        // fallback si NO usas chatbox
        if (contact_info && contact_info.includes("@")) {
            window.location.href = `mailto:${contact_info}`;
        } else if (contact_info && contact_info.replace(/\D/g, "").length >= 8) {
            const phone = contact_info.replace(/\D/g, "");
            window.open(`https://wa.me/${phone}`, "_blank");
        } else {
            alert("Contacto del vendedor: " + (contact_info || "No proporcionado"));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button
                    className="modal-close"
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    &times;
                </button>

                <div className="modal-main">
                    <div className="modal-body">
                        {/* Título */}
                        <h2 className="modal-title">{name}</h2>

                        {/* Precio */}
                        <div className="modal-price">${priceDisplay}</div>

                        {/* Detalles */}
                        <div className="modal-details">
                            <div className="detail-item">
                                <div className="detail-label">Categoría</div>
                                <div className="detail-value">{category || "N/A"}</div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-label">Ubicación</div>
                                <div className="detail-value">{location || "N/A"}</div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-label">Tamaño</div>
                                <div className="detail-value">{size || "N/A"}</div>
                            </div>
                            <div className="detail-item">
                                <div className="detail-label">Material</div>
                                <div className="detail-value">{material || "N/A"}</div>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="modal-description">
                            <div className="detail-label">Publicado</div>
                            <div className="detail-value" style={{ marginBottom: '10px' }}>
                                {dateString}
                            </div>

                            {!isOwner && (
                                <div className="detail-value" style={{ marginBottom: "10px" }}>
                                    <strong>Contacto del vendedor:</strong>{" "}
                                    {contact_info || "No proporcionado"}
                                </div>
                            )}

                            <div
                                className="detail-label"
                                style={{ marginTop: "6px" }}
                            >
                                Descripción
                            </div>
                            <p style={{ margin: 0 }}>{description || "Sin descripción"}</p>
                        </div>

                        {/* Botones */}
                        <div className="modal-footer">
                            {isOwner && (
                                <button
                                    className="modal-btn modal-btn-danger"
                                    onClick={handleDeleteClick}
                                >
                                    Eliminar Producto
                                </button>
                            )}

                        </div>

                        {/* Imagen */}
                        <div className="modal-image-wrapper">
                            <img
                                src={
                                    firstImage ||
                                    "https://placehold.co/500x400?text=Sin+Imagen"
                                }
                                alt={name}
                                className="modal-image"
                            />
                        </div>
                        {!isOwner && (
                            <>
                                <button
                                    className="btn btn-primary"
                                    style={{
                                        padding: "10px 20px",
                                        backgroundColor: "#007bff",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "5px",
                                    }}
                                    onClick={() => setShowChat(true)}
                                >
                                    Contactar Vendedor 💬
                                </button>
                                {/* Chat debajo */}
                                {showChat && (
                                    <div style={{ marginTop: "16px" }}>
                                        <ChatBox
                                            userId={currentUserId}  // comprador
                                            otherUserId={user_id}   // vendedor
                                            otherUserName={name}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
