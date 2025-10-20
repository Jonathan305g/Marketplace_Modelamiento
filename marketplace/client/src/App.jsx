import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Importamos el Router
import Login from "./components/Login"; // Componente de login
import Home from "./pages/Home"; // Componente que muestra después del login
import ForgotPassword from "./pages/ForgotPassword"; // Componente de recuperación de contraseña
import Register from "./pages/Register"; // Componente de registro de usuario

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> {/* Página de Login */}
        <Route path="/home" element={<Home />} /> {/* Página de inicio después de loguearse */}
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Página de Olvidaste tu contraseña */}
        <Route path="/register" element={<Register />} /> {/* Página de Crear cuenta */}
      </Routes>
    </Router>
  );
}

export default App;


