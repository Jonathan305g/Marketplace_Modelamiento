import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Login from "./components/login"; // Componente de login
import Home from "./pages/Home";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";
import ProtectedRoute from "./pages/ProtectedRoute";
import ProductPublish from "./components/ProductPublish";
import FavoritesPage from "./pages/FavoritesPage";
import AdminPanel from "./pages/AdminPanel";
import ModerationPanel from "./pages/ModerationPanel";
import { useAuth } from './context/AuthContext';

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // No mostrar NavBar en la página de login (ruta '/'), incluso si está autenticado
  const hideNavOnPaths = ['/', '/login'];

  return (
    <>
      {isAuthenticated && !hideNavOnPaths.includes(location.pathname) && <NavBar />}

      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas: requieren estar autenticado */}
        <Route element={<ProtectedRoute />}>
          <Route path="/publish" element={<ProductPublish />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Route>

        {/* Rutas separadas: Admin solo para 'admin' y Moderation para admin/moderator */}
        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin", "moderator"]} />}>
          <Route path="/moderation" element={<ModerationPanel />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<div>404 - Página no encontrada</div>} />
      </Routes>
      </>
    );
  }

  function App() {
    return (
      <Router>
        <AppRoutes />
      </Router>
    );
  }

  export default App;


