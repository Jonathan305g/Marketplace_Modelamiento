import React from 'react';
import { useAuth } from '../context/AuthContext'; // <-- IMPORTAR
import api from '../services/api';
// Aceptamos la nueva prop: onClick
export default function ProductCard({ product, onClick, refreshProducts, onEditProduct }) { 
  const { user, isAuthenticated } = useAuth();
  const { 
    name, 
    price, 
    location, 
    category, 
    size, 
    material, 
    images, 
    created_at,
    user_id // <-- ¡IMPORTANTE!
  } = product || {};

  const firstImage = (images && images.length > 0) ? images[0] : null;
  const dateString = created_at ? new Date(created_at).toLocaleDateString() : 'N/A';
  const priceDisplay = price ? price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00';

  // --- Handlers Corregidos ---
  const handleEdit = (e) => {
    e.stopPropagation(); 
    // Llama a la función que Home.jsx nos pasó
    if (onEditProduct) {
      onEditProduct(product);
    } else {
      // Fallback por si no se pasa la prop
      alert(`EDITAR: ${product.name} (ID: ${product.id})`);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`¿Seguro que quieres eliminar "${product.name}"?`)) {
      try {
        await api.delete(`/products/${product.id}`);

        alert('Producto eliminado');
        if (refreshProducts) refreshProducts();
      } catch (err) {
        alert('Error al eliminar: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleModerate = async (e, newState) => {
    e.stopPropagation();
    if (window.confirm(`¿Cambiar estado de "${product.name}" a "${newState}"?`)) {
      try {
        await api.put(`/admin/products/${product.id}/state`, { status: newState });

        alert('Estado del producto actualizado');
        if (refreshProducts) refreshProducts(); 
      } catch (err) {
        alert('Error al moderar: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation(); // Evita que se abra el modal
    try {
      // Usamos el helper 'api' de Axios, que ya incluye el token
      // Alternativa con tu fetch:
      // await fetch(`http://localhost:4000/api/products/${product.id}/favorite`, {
      //   method: 'POST',
      //   headers: getAuthHeaders()
      // });
      
      await api.post(`/products/${product.id}/favorite`);
      
      // Opcional: Feedback visual inmediato
      // (Aquí podrías cambiar el color del botón, pero es más complejo)
      alert('¡Favorito actualizado!');
      
      // Si estamos en la página de Favoritos, refrescarla
      if (refreshProducts) refreshProducts(); 

    } catch (err) {
      alert('Error al guardar favorito: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    // Tu JSX está perfecto, no se necesita cambiar nada aquí
    <article 
        className="card product" 
        onClick={onClick} 
        style={{ cursor: 'pointer', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', transition: 'box-shadow 0.3s' }}
        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'}
        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div className="product__image">
        <img 
          src={firstImage || 'https://via.placeholder.com/180?text=Sin+Imagen'} 
          alt={`Imagen de ${name || 'Producto'}`} 
          loading="lazy" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src="https://via.placeholder.com/180?text=Error+Carga"; 
          }}
        />
        <button 
          className="product__fav" 
          title="Agregar a favoritos" 
          onClick={handleToggleFavorite}
          style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          >
          ❤️
        </button>
      </div>

      <div className="product__body" style={{ padding: '15px' }}>
        <h3 className="product__title" title={name} style={{ margin: '0 0 5px 0', fontSize: '1.2em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</h3>

        <div className="product__details" style={{ fontSize: '0.9em', color: '#555', marginBottom: '8px' }}>
          {size && <span style={{ marginRight: '10px' }}>Talla: <strong>{size}</strong></span>}
          {material && <span>Material: <strong>{material}</strong></span>}
        </div>
        
        <div className="product__footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <span className="price" style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#28a745' }}>${priceDisplay}</span>
          <button className="btn btn--sm btn--ghost" style={{ border: '1px solid #17a2b8', color: '#17a2b8', padding: '5px 10px', borderRadius: '4px', background: 'white' }}>Ver Detalle</button>
        </div>

        
        {/* --- Botones de Acción (Tu JSX está bien) --- */}
        {isAuthenticated && (
          <div className="product-actions" style={{ marginTop: '10px', display: 'flex', gap: '5px', justifyContent: 'space-between' }}>
            
            {/* 1. Botones de VENDEDOR (Dueño) */}
            {user.id === user_id && (
              <div className="seller-actions" style={{ display: 'flex', gap: '5px' }}>
                <button onClick={handleEdit} className="btn-edit" style={{ background: '#ffc107', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                <button onClick={handleDelete} className="btn-delete" style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
              </div>
            )}

            {/* 2. Botones de MODERADOR/ADMIN */}
            {(user.role === 'admin' || user.role === 'moderator') && user.id !== user_id && (
              <div className="moderator-actions" style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
                <button onClick={(e) => handleModerate(e, 'oculto')} className="btn-hide" style={{ background: '#6c757d', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}>Ocultar</button>
                <button onClick={(e) => handleModerate(e, 'suspendido')} className="btn-suspend" style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}>Suspender</button>
              </div>
            )}
          </div>
        )}
        {/* --- FIN DE LOS BOTONES DE ACCIÓN --- */}


        <div className="product__meta" style={{ fontSize: '0.8em', color: '#888', marginTop: '10px' }}>
          <span className="badge" style={{ backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '3px', marginRight: '5px' }}>{category || 'General'}</span>
          <span className="muted">{location}</span>
          <span className="dot" style={{ margin: '0 5px' }}>•</span>
          <span className="muted">Pub.: {dateString}</span>
        </div>
      </div>
    </article>
  );
}