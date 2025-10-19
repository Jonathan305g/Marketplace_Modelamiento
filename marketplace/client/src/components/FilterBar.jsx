export default function FilterBar() {
  return (
    <div className="filterbar card">
      {/* Controles puramente visuales (sin manejar estado aún) */}
      <div className="filterbar__row">
        <div className="field">
          <label>Categoría</label>
          <select>
            <option value="">Todas</option>
            <option>Electrónica</option>
            <option>Hogar</option>
            <option>Deportes</option>
            <option>Música</option>
          </select>
        </div>

        <div className="field">
          <label>Ubicación</label>
          <input type="text" placeholder="Ej. Ambato" />
        </div>

        <div className="field">
          <label>Precio (máx.)</label>
          <input type="number" min="0" placeholder="Ej. 300" />
        </div>

        <div className="field">
          <label>Ordenar</label>
          <select>
            <option>Relevancia</option>
            <option>Más nuevos</option>
            <option>Menor precio</option>
            <option>Mayor precio</option>
          </select>
        </div>

        <div className="filterbar__actions">
          <button className="btn btn--primary">Aplicar</button>
          <button className="btn btn--ghost">Limpiar</button>
        </div>
      </div>
    </div>
  );
}
