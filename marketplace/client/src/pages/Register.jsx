import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import Helper from "../components/Helper";

const Register = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");         // nombre
  const [email, setEmail] = useState("");       // email
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");   // ✅ mensaje de éxito
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setPasswordVisible((v) => !v);

  const handleNextStep = async () => {
    setError("");
    setSuccess("");

    if (step === 1) {
      if (!name || !email) {
        setError("Ingresa nombre y correo");
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!password || !confirmPassword) {
        setError("Ingresa y confirma tu contraseña");
        return;
      }
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }

      try {
        setLoading(true);

        // normaliza email en el cliente (el backend también lo hace)
        const payload = {
          name: name.trim(),
          email: String(email).trim().toLowerCase(),
          password,
        };

        const res = await fetch("http://localhost:4000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data?.error || "Error al registrarse");
          setLoading(false);
          return;
        }

        // ✅ Registro OK: NO autologear, NO guardar token. Redirigir a /login.
        setError("");
        setSuccess("Cuenta creada. Ahora inicia sesión…");
        setTimeout(() => navigate("/login", { replace: true }), 1200);
      } catch (err) {
        console.error(err);
        setError("No se pudo conectar al servidor");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="register-container">
      <Helper message={step === 1 ? "Ingresa tu nombre y correo" : "Crea tu contraseña"} />
      <div className="register-box">
        <h2>Crear cuenta</h2>

        {step === 1 && (
          <>
            <div className="input-group">
              <label htmlFor="name">Nombre</label>
              <input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="email">Correo</label>
              <input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <p style={{ color: "#ef4444" }}>{error}</p>}
            {success && <p style={{ color: "#6ee7b7" }}>{success}</p>}

            <button className="next-button" onClick={handleNextStep} disabled={loading}>
              {loading ? "Procesando..." : "Siguiente"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="input-group">
              <label htmlFor="password">Contraseña</label>
              <div className="password-container">
                <input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="eye-icon" onClick={togglePasswordVisibility}>👁️</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p style={{ color: "#ef4444" }}>{error}</p>}
            {success && <p style={{ color: "#6ee7b7" }}>{success}</p>}

            <button className="next-button" onClick={handleNextStep} disabled={loading}>
              {loading ? "Registrando..." : "Registrar"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
