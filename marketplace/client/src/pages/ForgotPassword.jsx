// src/pages/ForgotPassword.jsx
import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState(""); // Estado para almacenar el correo

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Se ha enviado un enlace de recuperación a ${email}`);
      // Aquí se puede agregar la lógica real para enviar el enlace
    } else {
      alert("Por favor, ingresa tu correo electrónico.");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Recuperar contraseña</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Actualiza el estado con el correo
            placeholder="Ingresa tu correo"
          />
        </div>
        <button type="submit" className="login-button">Enviar enlace</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
