import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // El helper de API
import './AdminPanel.css'; // Crea un CSS básico para la tabla

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: adminUser } = useAuth(); // El usuario admin/mod logueado

  // Cargar usuarios al montar el componente
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/users');
        setUsers(res.data);
        setError('');
      } catch (err) {
        setError('No tienes permiso para ver esta página.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  // Handler para cambiar el ROL
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      // Actualizar la lista de usuarios localmente
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: res.data.role } : u))
      );
    } catch (err) {
      alert('Error al cambiar el rol: ' + (err.response?.data?.message || 'Error'));
    }
  };

  // Handler para cambiar el ESTADO
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const res = await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, status: res.data.status } : u))
      );
    } catch (err) {
      alert('Error al cambiar el estado: ' + (err.response?.data?.message || 'Error'));
    }
  };

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-panel">
      <h2>Panel de Administración de Usuarios</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones (Rol)</th>
            <th>Acciones (Estado)</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
              <td>
                {/* Solo el ADMIN puede cambiar roles */}
                {adminUser.role === 'admin' && user.role !== 'admin' && (
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="user">user</option>
                    <option value="moderator">moderator</option>
                  </select>
                )}
              </td>
              <td>
                {/* Admin/Mod puede cambiar estado (pero no de otros admins) */}
                {user.role !== 'admin' && (
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusChange(user.id, e.target.value)}
                  >
                    <option value="active">active</option>
                    <option value="suspended">suspended</option>
                  </select>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;