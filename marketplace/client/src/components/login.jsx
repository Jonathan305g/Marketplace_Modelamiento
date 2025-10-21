import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";               // Ojo: en tu repo el nombre del CSS es lower-case
import Helper from "../components/Helper";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [robotMessage, setRobotMessage] = useState("¡Hola! Bienvenido 👋");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setRobotMessage("Ingresa tu correo y contraseña"), 3000);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(email).trim().toLowerCase(),
          password
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // NO navega si backend dice 401/400/500
        setErrorMsg(data?.error || "Credenciales inválidas");
        setRobotMessage("Credenciales inválidas. Inténtalo otra vez.");
        setLoading(false);
        return;
      }

      // Login OK: guarda token y user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setRobotMessage(`¡Bienvenido, ${data.user.name}!`);
      navigate("/home");
    } catch (err) {
      setErrorMsg("Error de red. Verifica que la API esté corriendo en :4000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Helper message={robotMessage} />

      <div className="login-container">
        <h2>Iniciar sesión</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {errorMsg && <p style={{ color: "crimson", marginBottom: 12 }}>{errorMsg}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Validando..." : "Ingresar"}
          </button>
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
