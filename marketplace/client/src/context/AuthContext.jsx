import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Crear el Contexto
const AuthContext = createContext();

// 2. Crear un "hook" personalizado para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// 3. Crear el Proveedor del Contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Para chequear el token al inicio

  // Chequear si ya existe un token en localStorage al cargar la app
  useEffect(() => {
    const checkLogin = () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          // Aquí deberías validar el token contra el backend
          // Por simplicidad, confiamos en el user guardado.
          // En una app real, harías una llamada a /api/auth/verify
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error al cargar autenticación:", error);
        localStorage.clear(); // Limpiar almacenamiento corrupto
      }
      setLoading(false);
    };
    checkLogin();
  }, []);

  // Función para guardar datos de login
  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    // Guardar también el id del usuario para usos directos (ej: Home.jsx)
    const userId = userData.id || userData._id || userData.userId || '';
    if (userId) localStorage.setItem('userId', String(userId));
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};