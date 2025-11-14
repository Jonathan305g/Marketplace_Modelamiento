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

  const firstImage = (images && images.length > 0) ? images[0] : '';
  const dateString = created_at ? new Date(created_at).toLocaleDateString() : 'Fecha Desconocida';
  const altText = `Imagen de ${name || 'Producto'}`; 

  return (
    // CAMBIO CLAVE: Hacemos todo el <article> clickeable.
    <article 
        className="card product" 
        onClick={onClick} 
        style={{ cursor: 'pointer', border: '1px solid #ccc' }} // Añadimos cursor para UX
    >
      <div className="product__image">
        {/* ... Lógica y tag <img> existentes ... */}
        <img 
          src={firstImage} 
          alt={altText} 
          loading="lazy" 
          style={!firstImage ? { objectFit: 'contain', backgroundColor: '#eee' } : {}}
        />
        <button className="product__fav" title="Agregar a favoritos (UI)">
          ♥
        </button>
      </div>

      <div className="product__body">
        {/* ... Resto del contenido (Título, Meta, Footer, etc.) ... */}
        {/* ... */}
      </div>
    </article>
  );
}