import { Router } from "express";
import { supabase } from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

const isValidEmail = (email = "") => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

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
    // limpiamos el email al recibirlo
    const email = String(req.body.email || "").trim().toLowerCase();

    console.log("\n[DEBUG] /register: Recibido", {
      name,
      email,
      password: "***",
    });

    if (!name || !email || !password) {
      console.log("[DEBUG] /register: Faltan campos");
      return res.status(400).json({ error: "Faltan campos" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Correo electrónico no válido." });
    }

    // 1) validar email repetido con Supabase
    const { data: existingUser, error: existsError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existsError) {
      console.error("[DEBUG] /register: Error al verificar email:", existsError);
      return res.status(500).json({ error: "Error en el registro" });
    }

    if (existingUser) {
      console.log("[DEBUG] /register: El email ya existe");
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    // 2) hashear contraseña
    const hash = await bcrypt.hash(password, 10);
    console.log("[DEBUG] /register: Hash de contraseña creado");

    // 3) insertar usuario en Supabase
    const { data: insertData, error: insertError } = await supabase
      .from("users")
      .insert({
        name,
        email,
        password_hash: hash,
        // opcional: si quieres que arranque como 'pending'
        // status: 'pending'
      })
      .select("id, name, email, created_at, role, status")
      .single();

    if (insertError) {
      console.error(
        "[DEBUG] /register: Error al insertar usuario:",
        insertError
      );
      // si tienes constraint UNIQUE en email, podrías revisar insertError.code === '23505'
      if (insertError.code === "23505") {
        return res
          .status(400)
          .json({ message: "El correo ya está registrado." });
      }
      return res.status(500).json({ error: "Error en el registro" });
    }

    const user = insertData;
    const token = signToken(user);

    console.log(
      "[DEBUG] /register: Usuario registrado con éxito. ID:",
      user.id
    );
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
    const email = String(req.body.email || "").trim().toLowerCase();

    console.log("\n[DEBUG] /login: Intento de inicio de sesión con:", {
      email,
      password: "***",
    });

    if (!email || !password) {
      console.log("[DEBUG] /login: Faltan credenciales");
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    // 1) buscar usuario por email en Supabase
    const { data: user, error: foundError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (foundError) {
      console.error("[DEBUG] /login: Error al buscar usuario:", foundError);
      return res.status(500).json({ error: "Error en el login" });
    }

    if (!user) {
      console.log("[DEBUG] /login: Email no encontrado en la BD");
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    console.log("[DEBUG] /login: Usuario encontrado. ID:", user.id);
    console.log("[DEBUG] /login: Hash en BD:", user.password_hash);

    // 2) comparar contraseña
    const ok = await bcrypt.compare(password, user.password_hash);
    console.log("[DEBUG] /login: ¿La contraseña es correcta?:", ok);

    if (!ok) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // 3) verificar estado de la cuenta
    if (user.status !== "active") {
      console.log("[DEBUG] /login: La cuenta no está activa:", user.status);
      return res
        .status(403)
        .json({ error: "Debes confirmar tu correo para usar la app." });
      // o "La cuenta está suspendida.", según tu lógica
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

export default router;
