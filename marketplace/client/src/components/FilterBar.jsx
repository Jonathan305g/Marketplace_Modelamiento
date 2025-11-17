import React, { useState } from 'react';
import CATEGORIES from '../constants/categories';

export default function FilterBar({ onApply, onReset, initial = {} }) {
  const [category, setCategory] = useState(initial.category || '');
  const [location, setLocation] = useState(initial.location || '');
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice || '');
  const [order, setOrder] = useState(initial.order || 'relevance');

  const apply = () => {
    const filters = {};
    if (category) filters.category = category;
    if (location) filters.location = location;
    if (maxPrice) filters.max_price = maxPrice;
    if (order) filters.order = order;
    if (onApply) onApply(filters);
  };

  const clear = () => {
    setCategory('');
    setLocation('');
    setMaxPrice('');
    setOrder('relevance');
    if (onReset) onReset();
  };

  return (
    <div className="filterbar card">
      <div className="filterbar__row">
        <div className="field">
          <label>Categoría</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Todas</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Ubicación</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} type="text" placeholder="Ej. Ambato" />
        </div>

        <div className="field">
          <label>Precio (máx.)</label>
          <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" min="0" placeholder="Ej. 300" />
        </div>

        <div className="field">
          <label>Ordenar</label>
          <select value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="relevance">Relevancia</option>
            <option value="newest">Más nuevos</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
          </select>
        </div>

        <div className="filterbar__actions">
          <button type="button" className="btn btn--primary" onClick={apply}>Aplicar</button>
          <button type="button" className="btn btn--ghost" onClick={clear}>Limpiar</button>
        </div>
      </div>
    </div>
  );
}
