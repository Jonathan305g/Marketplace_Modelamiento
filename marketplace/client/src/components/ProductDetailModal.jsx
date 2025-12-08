import React, { useState } from 'react';
import ChatBox from "./ChatBox";

const ProductDetailModal = ({ product, onClose, onDelete, currentUserId }) => {
    // Hook SIEMPRE se llama en todas las renderizaciones
    const [showChat, setShowChat] = useState(false);

    // Si no hay producto, no renderizamos nada
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
        user_id
    } = product;

    const isOwner =
      currentUserId && currentUserId.toString() === user_id.toString();

    const firstImage = images && images.length > 0 ? images[0] : null;
    const dateString = created_at
      ? new Date(created_at).toLocaleDateString()
      : "N/A";
    const priceDisplay = price
      ? price.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : "0.00";

    const handleDeleteClick = () => {
      if (onDelete) onDelete(id);
    };

    return (
      <div
        className="modal-overlay"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "#252835ff",
            padding: "30px",
            borderRadius: "10px",
            maxWidth: "800px",
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "15px",
              right: "15px",
              background: "none",
              border: "none",
              fontSize: "1.5em",
              cursor: "pointer",
            }}
          >
            &times;
          </button>

          <h2
            style={{
              borderBottom: "2px solid #ccc",
              paddingBottom: "10px",
              marginBottom: "15px",
            }}
          >
            {name}
          </h2>
          <p
            style={{
              fontSize: "2em",
              fontWeight: "900",
              color: "#dc3545",
              marginBottom: "20px",
            }}
          >
            ${priceDisplay}
          </p>

          <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
            {/* imagen */}
            <div style={{ flex: "0 0 45%", minWidth: "300px" }}>
              <img
                src={
                  firstImage ||
                  "https://via.placeholder.com/400?text=Sin+Imagen"
                }
                alt={name}
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: "350px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                }}
              />
            </div>

            {/* detalles + acciones */}
            <div style={{ flex: "1" }}>
              <h3 style={{ marginBottom: "10px", fontSize: "1.4em" }}>
                Detalles del Producto
              </h3>
              <ul
                style={{
                  listStyleType: "none",
                  padding: 0,
                  lineHeight: "1.8",
                }}
              >
                <li>
                  <strong>Categoría:</strong> {category}
                </li>
                <li>
                  <strong>Ubicación:</strong> {location}
                </li>
                <li>
                  <strong>Tamaño:</strong> {size || "N/A"}
                </li>
                <li>
                  <strong>Material:</strong> {material || "N/A"}
                </li>
                <li style={{ color: "#6c757d", marginTop: "10px" }}>
                  Publicado: {dateString}
                </li>
              </ul>

              <h3
                style={{
                  marginTop: "20px",
                  borderTop: "1px dashed #eee",
                  paddingTop: "15px",
                  marginBottom: "10px",
                }}
              >
                Descripción
              </h3>
              <p style={{ marginBottom: "20px", whiteSpace: "pre-wrap" }}>
                {description}
              </p>

              <div
                style={{ display: "flex", gap: "10px", marginTop: "20px" }}
              >
                {isOwner && (
                  <button
                    onClick={handleDeleteClick}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Eliminar Producto ❌
                  </button>
                )}

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
              </div>

              {/* Chat debajo de los botones */}
              {showChat && (
                <div style={{ marginTop: "16px" }}>
                  <ChatBox
                    userId={currentUserId}
                    otherUserId={user_id}
                    otherUserName={name}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
};

export default ProductDetailModal;