// Eliminamos los imports de FilterBar y ProductGrid que no se usan
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import './NavBar.css';

const NavBar = () => {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (loading) return null; // no mostramos nada hasta cargar
  if (!isAuthenticated) return null; // mostrar navbar solo si está autenticado

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/home">Marketplace</Link>
      </div>
      <div className="navbar-links">
        <Link to="/home">Inicio</Link>
        {/* Mostrar 'Publicar' solo para roles con permiso (admin, seller, vendedor o buyer) */}
        {user && (user.role === 'admin' || user.role === 'seller' || user.role === 'vendedor' || user.role === 'buyer') && (
          <Link to="/publish">Publicar</Link>
        )}

        {/* Mostrar 'Admin' solo para ADMIN (no para moderador) */}
        {user && user.role === 'admin' && (
          <Link to="/admin">Admin</Link>
        )}

        {/* Mostrar 'Moderación' para admin y moderador */}
        {user && (user.role === 'admin' || user.role === 'moderator') && (
          <Link to="/moderation">Moderación</Link>
        )}

        {/* Centro de Notificaciones */}
        <NotificationCenter />

        {/* Botón de usuario que despliega el menú */}
        <div className="user-menu">
          <button className="user-button" onClick={() => setOpen(!open)}>
            {user ? (user.name || user.email || 'Usuario') : 'Usuario'} ▾
          </button>
          {open && (
            <div className="user-dropdown">
              <Link to="/favorites" onClick={() => setOpen(false)}>Mis Favoritos</Link>
              <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;