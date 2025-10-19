export default function ProductCard({ product }) {
  const { name, price, location, category, thumbnail, publishedAt } = product || {};

  return (
    <article className="card product">
      <div className="product__image">
        <img src={thumbnail} alt={name} loading="lazy" />
        <button className="product__fav" title="Agregar a favoritos (UI)">
          ♥
        </button>
      </div>

      <div className="product__body">
        <h3 className="product__title" title={name}>{name}</h3>

        <div className="product__meta">
          <span className="badge">{category}</span>
          <span className="dot">•</span>
          <span className="muted">{location}</span>
        </div>

        <div className="product__footer">
          <span className="price">${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          <button className="btn btn--sm btn--ghost">Me interesa</button>
        </div>

        <div className="product__date">
          Publicado: {new Date(publishedAt).toLocaleDateString()}
        </div>
      </div>
    </article>
  );
}
