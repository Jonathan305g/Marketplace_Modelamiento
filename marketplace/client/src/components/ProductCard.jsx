import React from 'react';

// Aceptamos la nueva prop: onClick
export default function ProductCard({ product, onClick }) { 
  const { 
    name, 
    price, 
    location, 
    category, 
    size, 
    material, 
    images, 
    created_at,
  } = product || {};

  const firstImage = (images && images.length > 0) ? images[0] : null;
  const dateString = created_at ? new Date(created_at).toLocaleDateString() : 'N/A';
  const priceDisplay = price ? price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00';

  return (
    // CAMBIO CLAVE: Hacemos todo el <article> clickeable.
    <article 
        className="card product" 
        onClick={onClick} 
        style={{ cursor: 'pointer', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', transition: 'box-shadow 0.3s' }}
        onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'}
        onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div className="product__image">
        {/* ... Lógica y tag <img> existentes ... */}
        <img 
          src={firstImage || 'https://via.placeholder.com/180?text=Sin+Imagen'} 
          alt={`Imagen de ${name || 'Producto'}`} 
          loading="lazy" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} // <--- CLAVE PARA QUE SE VEA BIEN
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src="https://via.placeholder.com/180?text=Error+Carga"; 
          }}
        />
        <button className="product__fav" title="Agregar a favoritos (UI)" style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          ❤️
        </button>
      </div>

      <div className="product__body" style={{ padding: '15px' }}>
        <h3 className="product__title" title={name} style={{ margin: '0 0 5px 0', fontSize: '1.2em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</h3>

        {/* Información clave visible */}
        <div className="product__details" style={{ fontSize: '0.9em', color: '#555', marginBottom: '8px' }}>
          {size && <span style={{ marginRight: '10px' }}>Talla: <strong>{size}</strong></span>}
          {material && <span>Material: <strong>{material}</strong></span>}
        </div>
        
        {/* Precio y botón de acción */}
        <div className="product__footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <span className="price" style={{ fontSize: '1.4em', fontWeight: 'bold', color: '#28a745' }}>${priceDisplay}</span>
          <button className="btn btn--sm btn--ghost" style={{ border: '1px solid #17a2b8', color: '#17a2b8', padding: '5px 10px', borderRadius: '4px', background: 'white' }}>Ver Detalle</button>
        </div>

        {/* Meta información */}
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