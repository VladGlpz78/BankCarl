import { useState } from 'react';
import { UserPlus } from 'lucide-react';

const Clientes = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    direccion: ''
  });
  const [cargando, setCargando] = useState(false);

  // Traemos el pase VIP
  const token = localStorage.getItem('auth_token');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const res = await fetch('http://localhost:3000/api/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 👈 Nuestro pase VIP
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.éxito) {
        alert('¡Cliente registrado con éxito!');
        // Limpiamos el formulario
        setFormData({ nombre: '', apellido: '', dni: '', telefono: '', direccion: '' });
      } else {
        alert('Error al guardar: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <UserPlus size={30} color="#007BFF" />
        <h2 style={{ margin: 0 }}>Registrar Nuevo Cliente</h2>
      </div>

      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="form-input" placeholder="Ej: Juan" />
          </div>

          <div className="form-group">
            <label>Apellido</label>
            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required className="form-input" placeholder="Ej: Pérez" />
          </div>

          <div className="form-group">
            <label>DNI</label>
            <input type="number" name="dni" value={formData.dni} onChange={handleChange} required className="form-input" placeholder="Sin puntos" />
          </div>

          <div className="form-group">
            <label>Teléfono (Opcional)</label>
            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="form-input" placeholder="Ej: 381 123 4567" />
          </div>

          <div className="form-group">
            <label>Dirección (Opcional)</label>
            <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} className="form-input" placeholder="Ej: San Martín 123" />
          </div>

          <button type="submit" className="btn-submit" disabled={cargando} style={{ marginTop: '10px' }}>
            {cargando ? 'Guardando...' : 'Guardar Cliente'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Clientes;