import { pool } from './db.js';

// --- (ADMIN) Obtener todos los usuarios ---
export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, role, status, created_at FROM users ORDER BY id ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno al obtener usuarios.' });
    }
};

// --- (ADMIN) Cambiar el ROL de un usuario ---
export const updateUserRole = async (req, res) => {
    const { id } = req.params; // ID del usuario a modificar
    const { role } = req.body; // Nuevo rol (ej: 'moderator' o 'user')
    const adminId = req.userId; // ID del admin que hace la solicitud

    if (!role || (role !== 'user' && role !== 'moderator')) {
        return res.status(400).json({ message: "Rol no válido. Solo se puede asignar 'user' o 'moderator'." });
    }
    
    if (Number(id) === Number(adminId)) {
        return res.status(403).json({ message: 'Un administrador no puede cambiar su propio rol.' });
    }

    try {
        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 AND role != $3 RETURNING id, name, email, role, status',
            [role, id, 'admin'] // Impide cambiar a otros admins
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado o es otro administrador.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al cambiar rol:', error);
        res.status(500).json({ message: 'Error interno al cambiar rol.' });
    }
};

// --- (MODERATOR + ADMIN) Cambiar el ESTADO de un usuario ---
export const updateUserStatus = async (req, res) => {
    const { id } = req.params; // ID del usuario a modificar
    const { status } = req.body; // Nuevo status (ej: 'active' o 'suspended')

    if (!status || (status !== 'active' && status !== 'suspended')) {
        return res.status(400).json({ message: "Estado no válido. Solo se puede asignar 'active' o 'suspended'." });
    }

    try {
        const result = await pool.query(
            'UPDATE users SET status = $1 WHERE id = $2 AND role != $3 RETURNING id, name, email, role, status',
            [status, id, 'admin']
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado o intentas modificar un Administrador.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al cambiar status:', error);
        res.status(500).json({ message: 'Error interno al cambiar status.' });
    }
};

// --- (MODERATOR + ADMIN) Ocultar/Suspender un producto ---
export const moderateProductState = async (req, res) => {
    const { id } = req.params; // ID del producto
    const { state } = req.body; // 'visible', 'oculto', 'suspendido'

     if (!state || (state !== 'visible' && state !== 'oculto' && state !== 'suspendido')) {
        return res.status(400).json({ message: "Estado no válido. ('visible', 'oculto', 'suspendido')." });
    }
    
    try {
        const result = await pool.query(
            'UPDATE products SET state = $1 WHERE id = $2 RETURNING id, name, state',
            [state, id]
        );
         if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error al moderar producto:', error);
        res.status(500).json({ message: 'Error interno al moderar producto.' });
    }
};