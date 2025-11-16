import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login"; // El componente de login
import Home from "./pages/Home"; // El componente que muestras después del login (Explora productos y servicios)
import AdminPanel from './AdminPanel'; // <-- IMPORTAR NUEVA PÁGINA
import ProtectedRoute from './ProtectedRoute'
import ProductPublish from '../components/ProductPublish';
import FavoritesPage from './FavoritesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas Protegidas (Requieren estar logueado) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/publish" element={<ProductPublish />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          {/* Aquí irían otras rutas de usuario, ej: /my-products, /profile */}
        </Route>

        {/* Rutas de Admin/Moderador */}
        <Route element={<ProtectedRoute roles={['admin', 'moderator']} />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        {/* Ruta para 404 */}
        <Route path="*" element={<div>404 - Página no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
