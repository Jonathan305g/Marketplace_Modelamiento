import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login"; // El componente de login
import Home from "./pages/Home"; // El componente que muestras después del login (Explora productos y servicios)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> {/* Ruta para el Login */}
        <Route path="/home" element={<Home />} /> {/* Ruta para el Home */}
      </Routes>
    </Router>
  );
}

export default App;
