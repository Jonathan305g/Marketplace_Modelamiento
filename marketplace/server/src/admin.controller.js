import { supabase } from './db.js';

// --- (ADMIN) Obtener todos los usuarios ---
export const getAllUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, email, role, status, created_at')
            .order('id', { ascending: true });

        if (error) {
            throw error;
        }

        res.status(200).json(users);
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
        const { data: users, error } = await supabase
            .from('users')
            .update({ role })
            .eq('id', id)
            .neq('role', 'admin')
            .select('id, name, email, role, status');

        if (error) {
            throw error;
        }

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado o es otro administrador.' });
        }
        res.status(200).json(users[0]);
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
        const { data: users, error } = await supabase
            .from('users')
            .update({ status })
            .eq('id', id)
            .neq('role', 'admin')
            .select('id, name, email, role, status');

        if (error) {
            throw error;
        }

        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado o intentas modificar un Administrador.' });
        }
        res.status(200).json(users[0]);
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
        const { data: products, error } = await supabase
            .from('products')
            .update({ state })
            .eq('id', id)
            .select('id, name, state');

        if (error) {
            throw error;
        }

        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }
        res.status(200).json(products[0]);
    } catch (error) {
        console.error('Error al moderar producto:', error);
        res.status(500).json({ message: 'Error interno al moderar producto.' });
    }
};