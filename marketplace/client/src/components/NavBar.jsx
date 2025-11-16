// Eliminamos los imports de FilterBar y ProductGrid que no se usan
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();

  // 1. Si estamos cargando el usuario, mostrar un 'Cargando...'
  if (loading) {
    return (
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">Marketplace</Link>
        </div>
        <div className="navbar-links">
          <span>Cargando...</span>
        </div>
      </nav>
    );
  }

  // 2. Si NO está autenticado (y no está cargando)
  if (!isAuthenticated && !loading) {
    return (
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">Marketplace</Link>
        </div>
        <div className="navbar-links">
          <Link to="/login">Iniciar Sesión</Link>
          <Link to="/register">Registrarse</Link>
        </div>
      </nav>
    );
  }

  // 3. Si ESTÁ autenticado (y no está cargando)
  // Nos aseguramos que 'user' no sea null antes de intentar leerlo
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Marketplace</Link>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            <span>¡Hola, {user.name}!</span>

            {/* Link para Vendedores (rol 'user') */}
            {user.role === 'user' && (
              <Link to="/publish">Publicar Artículo</Link>
            )}

            {/* Link para Admin y Moderador */}
            {(user.role === 'admin' || user.role === 'moderator') && (
              <Link to="/admin">Panel de Admin</Link>
            )}

            <button onClick={logout} className="navbar-button">
              Cerrar Sesión
            </button>
          </>
        ) : (
          // Fallback de seguridad si 'user' es null
          <Link to="/login">Iniciar Sesión</Link>
        )}
      </div>
    </nav>
  );
};

export default NavBar;