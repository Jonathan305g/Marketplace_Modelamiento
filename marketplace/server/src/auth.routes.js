import { Router } from "express";
import { supabase } from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

// firmar token simple
function signToken(user) {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,     
      status: user.status,   
    },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );
}

/**
 * POST /api/auth/register
 * body: { name, email, password }
 */
router.post("/register", async (req, res) => {
  try {
    const { name, password } = req.body || {};
    // --- CORRECCIÓN: Limpiamos el email al recibirlo ---
    const email = String(req.body.email || '').trim().toLowerCase(); 

    console.log("\n[DEBUG] /register: Recibido", { name, email, password: '***' });

    if (!name || !email || !password) {
      console.log("[DEBUG] /register: Faltan campos");
      return res.status(400).json({ error: "Faltan campos" });
    }

    // valida email repetido
    const { data: exists, error: existsError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email);
    
    if (existsError) throw existsError;
    if (exists && exists.length > 0) {
      console.log("[DEBUG] /register: El email ya existe");
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    const hash = await bcrypt.hash(password, 10);
    console.log("[DEBUG] /register: Hash de contraseña creado");

    const { data: inserted, error: insertError } = await supabase
      .from('users')
      .insert([{ name, email, password_hash: hash }])
      .select('id, name, email, created_at, role, status');

    if (insertError) throw insertError;
    
    const user = inserted[0];
    const token = signToken(user);

    console.log("[DEBUG] /register: Usuario registrado con éxito. ID:", user.id);
    const { password_hash, ...userResponse } = user;
    res.json({ token, user: userResponse });

  } catch (err) {
    console.error("[DEBUG] /register: Error 500", err);
    res.status(500).json({ error: "Error en el registro" });
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { password } = req.body || {};
    // --- CORRECCIÓN: Limpiamos el email también al buscar ---
    const email = String(req.body.email || '').trim().toLowerCase();

    console.log("\n[DEBUG] /login: Intento de inicio de sesión con:", { email, password: '***' });

    if (!email || !password) {
      console.log("[DEBUG] /login: Faltan credenciales");
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    const { data: found, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (findError) throw findError;
    if (!found || found.length === 0) {
      console.log("[DEBUG] /login: Email no encontrado en la BD");
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = found[0];
    console.log("[DEBUG] /login: Usuario encontrado. ID:", user.id);
    console.log("[DEBUG] /login: Hash en BD:", user.password_hash);
    
    const ok = await bcrypt.compare(password, user.password_hash);
    
    // --- ¡ESTA ES LA LÍNEA MÁS IMPORTANTE! ---
    console.log("[DEBUG] /login: ¿La contraseña es correcta?:", ok);
    // ------------------------------------------

    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });
    
    if (user.status !== 'active') {
      console.log("[DEBUG] /login: La cuenta está suspendida");
      return res.status(403).json({ error: 'La cuenta está suspendida.' });
    }

    const token = signToken(user);
    const { password_hash, ...userResponse } = user;
    
    console.log("[DEBUG] /login: Login exitoso. Enviando token.");
    res.json({ token, user: userResponse });
    
  } catch (err) {
    console.error("[DEBUG] /login: Error 500", err);
    res.status(500).json({ error: "Error en el login" });
  }
});

// (La ruta duplicada /publish fue eliminada)

export default router;