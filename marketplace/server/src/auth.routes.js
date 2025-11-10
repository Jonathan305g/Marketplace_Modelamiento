import { Router } from "express";
import { pool } from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

// firmar token simple
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
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
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Faltan campos" });
    }

    // valida email repetido
    const exists = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    const hash = await bcrypt.hash(password, 10);
    const insert = await pool.query(
      "INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,created_at",
      [name, email, hash]
    );
    const user = insert.rows[0];
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el registro" });
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Faltan credenciales" });
    }

    const found = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (found.rowCount === 0) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const user = found.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el login" });
  }
});

router.post("/publish", async (req, res) => {
  try {
    const { product, description, price, image } = req.body || {};
    if (!product || !description || !price || !image) {
      return res.status(400).json({ error: "Faltan campos" });
    }
    const insert = await pool.query(
      "INSERT INTO products(product,description,price,image) VALUES($1,$2,$3,$4)",
      [product, description, price,image]
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al publicar producto" });
  }
});

export default router;
