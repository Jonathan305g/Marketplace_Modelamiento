import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import Helper from "../components/Helper"; // Importamos el componente del robot

const Register = () => {
  const [step, setStep] = useState(1); // Para manejar el paso actual del formulario
  const [username, setUsername] = useState(""); // Nombre de usuario
  const [password, setPassword] = useState(""); // Contraseña
  const [confirmPassword, setConfirmPassword] = useState(""); // Confirmar contraseña
  const [passwordVisible, setPasswordVisible] = useState(false); // Para mostrar/ocultar la contraseña
  const navigate = useNavigate(); // Para redireccionar

  // Función para manejar el paso de ingresar nombre de usuario
  const handleNextStep = () => {
    if (step === 1) {
      if (username) {
        setStep(2); // Pasar al paso 2 (ingresar contraseña)
      } else {
        alert("Por favor, ingresa tu nombre de usuario.");
      }
    } else if (step === 2) {
      // Expresión regular para validar la contraseña
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (passwordRegex.test(password) && password === confirmPassword) {
        // Si la contraseña es válida, proceder al siguiente paso
        console.log("Usuario:", username, "Contraseña:", password);
        navigate("/home"); // Redirige a la página de inicio
      } else {
        alert("La contraseña debe tener al menos una mayúscula, un número, un carácter especial y ambas contraseñas deben coincidir.");
      }
    }
  };

  // Mensaje dependiendo del paso
  const robotMessage = step === 1 ? "Ingresa tu nombre de usuario" : "Ingresa tu contraseña (con mayúscula, número y carácter especial)";

  // Función para mostrar/ocultar la contraseña
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="register-container">
      <Helper message={robotMessage} /> {/* Pasamos el mensaje dinámico al robot */}

      <h2 className="register-title">Crear cuenta</h2>
      
      {/* Paso 1: Nombre de usuario */}
      {step === 1 && (
        <>
          <div className="input-group">
            <label htmlFor="username">Ingresa tu nombre de usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de usuario"
            />
          </div>
          <button className="next-button" onClick={handleNextStep}>Siguiente</button>
        </>
      )}

      {/* Paso 2: Contraseña */}
      {step === 2 && (
        <>
          <div className="input-group">
            <label htmlFor="password">Ingresa tu contraseña</label>
            <div className="password-container">
              <input
                type={passwordVisible ? "text" : "password"} // Cambiar tipo de input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
              />
              <span className="eye-icon" onClick={togglePasswordVisibility}>
                👁️ {/* Icono de ojo */}
              </span>
            </div>
          </div>
          
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
            />
          </div>

          <button className="next-button" onClick={handleNextStep}>Registrar</button>
        </>
      )}
    </div>
  );
};

export default Register;
