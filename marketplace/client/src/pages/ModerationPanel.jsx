import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ModerationPanel = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await api.get('/moderation/items');
        setItems(res.data);
        setError('');
      } catch (err) {
        console.error(err);
        setError('No tienes permiso o hubo un error al cargar items.');
      }
      setLoading(false);
    };
    fetchItems();
  }, []);

  if (loading) return <div style={{padding:20}}>Cargando moderación...</div>;
  if (error) return <div style={{padding:20, color:'crimson'}}>{error}</div>;

  return (
    <div style={{padding:20}}>
      <h2>Panel de Moderación</h2>
      <p>Accediendo como: {user?.name || user?.email}</p>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id || i._id}>
              <td>{i.id || i._id}</td>
              <td>{i.title || i.name}</td>
              <td>
                {/* Ejemplo de acciones: aprobar/rechazar */}
                <button style={{marginRight:8}}>Aprobar</button>
                <button>Rechazar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ModerationPanel;
