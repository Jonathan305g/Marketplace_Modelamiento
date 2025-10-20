import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Helper from "../components/Helper"; // Importamos el componente del robot

const Login = () => {
  const [username, setUsername] = useState(""); // Nombre de usuario
  const [password, setPassword] = useState(""); // Contraseña
  const [robotMessage, setRobotMessage] = useState("¡Hola! Bienvenido 👋"); // Mensaje inicial
  const navigate = useNavigate(); // Para redireccionar

  // Cuando el componente se renderiza, el robot dice "Bienvenido"
  useEffect(() => {
    const timeout = setTimeout(() => {
      setRobotMessage("Ingresa tu nombre de usuario");
    }, 3000); // Mensaje cambia después de 3 segundos

    return () => clearTimeout(timeout); // Limpiar el temporizador si el componente se desmonta
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí agregarías la lógica de autenticación (simulada por ahora)
    if (username && password) {
      console.log("Usuario:", username, "Contraseña:", password);
      navigate("/home"); // Redirige a la página principal después de loguearse
    } else {
      alert("Por favor, ingresa tus datos.");
    }
  };

  return (
    <div className="login-page">
      <Helper message={robotMessage} /> {/* El robot muestra el mensaje */}
      
      <div className="login-container">
        <h2 className="login-title">Iniciar sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Actualiza el estado con el nombre de usuario
              placeholder="Ingresa tu nombre de usuario"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Actualiza el estado con la contraseña
              placeholder="Ingresa tu contraseña"
            />
          </div>
          <button type="submit" className="login-button">Ingresar</button>
        </form>
        <div className="links">
          <a href="/forgot-password" className="forgot-password">¿Olvidaste tu contraseña?</a>
          <a href="/register" className="create-account">Crear cuenta</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
