// marketplace/client/src/pages/FavoritesPage.jsx (NUEVO)
import React from 'react';

const FavoritesPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Mis Productos Favoritos</h2>
      <p>Aquí aparecerá la lista de tus productos guardados.</p>
      {/* En el futuro, aquí harías un fetch a /api/favorites */}
    </div>
  );
};

export default FavoritesPage;