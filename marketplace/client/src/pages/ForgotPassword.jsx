import React, { useState } from "react";

// Versión mínima y funcional del flujo de "Olvidé mi contraseña".
// Solo valida el correo y muestra un mensaje de confirmación.
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    const normalized = String(email || "").trim().toLowerCase();
    if (!normalized) {
      setStatus({ type: "error", message: "Por favor, ingresa tu correo." });
      return;
    }

    // Aquí podrías llamar a tu backend /api/password-reset/request
    // Dejamos una simulación para no romper el flujo mientras el backend responde.
    try {
      setSubmitting(true);
      setTimeout(() => {
        setStatus({ type: "success", message: `Si el correo ${normalized} existe, enviaremos un código de recuperación.` });
        setSubmitting(false);
      }, 600);
    } catch (err) {
      setStatus({ type: "error", message: "No se pudo procesar la solicitud." });
      setSubmitting(false);
    }
  };

  return (
    <div className="forgot-password-container" style={{ maxWidth: 420, margin: "40px auto", padding: 20 }}>
      <h2>Recuperar contraseña</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group" style={{ marginBottom: 12 }}>
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
          />
        </div>

        {status.message && (
          <p style={{ color: status.type === "error" ? "#ef4444" : "#22c55e", marginBottom: 12 }}>
            {status.message}
          </p>
        )}

        <button type="submit" className="login-button" disabled={submitting}>
          {submitting ? "Enviando..." : "Enviar enlace"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
