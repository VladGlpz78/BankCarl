import { useState, useEffect } from 'react';
import { DollarSign, Users, AlertCircle, Trash2, Edit3, Check, X, Link as LinkIcon, Copy, ExternalLink, Phone } from 'lucide-react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({ plata_en_la_calle: 0, clientes_activos: 0, cuotas_vencidas: 0 });
  const [clientes, setClientes] = useState([]);
  
  // 👇 NUEVOS ESTADOS PARA LOS MOROSOS
  const [morosos, setMorosos] = useState([]);
  const [mostrarModalMorosos, setMostrarModalMorosos] = useState(false);
  
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [editFormData, setEditFormData] = useState({ nombre: '', apellido: '', dni: '' });

  const token = localStorage.getItem('auth_token');

  const cargarDatos = async () => {
    try {
      const resStats = await fetch('http://localhost:3000/api/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataStats = await resStats.json();
      if (dataStats.éxito) {
        setStats(dataStats.stats);
        setMorosos(dataStats.morosos); // 👈 Guardamos la lista de morosos
      }

      const resClientes = await fetch('http://localhost:3000/api/clientes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataClientes = await resClientes.json();
      if (dataClientes.éxito) setClientes(dataClientes.clientes);

    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleActivarEditar = (cliente) => {
    setEditandoId(cliente.id);
    setEditFormData({ nombre: cliente.nombre, apellido: cliente.apellido, dni: cliente.dni });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleGuardarCambios = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/api/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editFormData)
      });
      const data = await res.json();
      if (data.éxito) { alert('Cliente actualizado'); setEditandoId(null); cargarDatos(); } 
      else { alert('Error: ' + data.error); }
    } catch (error) { console.error(error); }
  };

  const handleEliminarCliente = async (id, nombre, apellido) => {
    const confirmar = window.confirm(`¿Seguro que querés eliminar a ${apellido}, ${nombre}?`);
    if (!confirmar) return;
    try {
      const res = await fetch(`http://localhost:3000/api/clientes/${id}`, { 
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } 
      });
      const data = await res.json();
      if (data.éxito) { alert('Cliente eliminado'); cargarDatos(); } 
      else { alert('No se pudo eliminar: ' + data.error); }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="dashboard-container">
      <h1>Panel de Control</h1>
      <p>Resumen de tu actividad en tiempo real:</p>

      {cargando ? (
        <p>Cargando datos del sistema...</p>
      ) : (
        <>
          <div className="dashboard-cards">
            <div className="card">
              <DollarSign size={24} color="green" />
              <h3>$ {stats.plata_en_la_calle.toLocaleString('es-AR')}</h3>
              <p>Plata en la calle</p>
            </div>

            <div className="card">
              <Users size={24} color="blue" />
              <h3>{stats.clientes_activos}</h3>
              <p>Clientes Registrados</p>
            </div>

            {/* 👇 TARJETA DE MOROSOS CLIQUEABLE */}
            <div 
              className={`card ${stats.cuotas_vencidas > 0 ? 'alerta-morosos card-cliqueable' : ''}`}
              onClick={() => stats.cuotas_vencidas > 0 && setMostrarModalMorosos(true)}
              title={stats.cuotas_vencidas > 0 ? "Hacé clic para ver quién debe" : ""}
            >
              <AlertCircle size={24} color={stats.cuotas_vencidas > 0 ? "red" : "gray"} />
              <h3 style={{ color: stats.cuotas_vencidas > 0 ? 'red' : 'inherit' }}>{stats.cuotas_vencidas}</h3>
              <p>Cuotas Vencidas</p>
              {stats.cuotas_vencidas > 0 && <small className="click-hint">Ver lista 👆</small>}
            </div>
          </div>

          {/* 👇 EL MODAL (VENTANITA) DE MOROSOS */}
          {mostrarModalMorosos && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>🚨 Clientes con cuotas atrasadas</h3>
                  <button className="btn-cerrar-modal" onClick={() => setMostrarModalMorosos(false)}><X size={20}/></button>
                </div>
                <div className="lista-morosos">
                  {morosos.map((moroso) => {
                    const cliente = moroso.prestamos.clientes;
                    return (
                      <div key={moroso.id} className="moroso-item">
                        <div className="moroso-info">
                          <strong>{cliente.apellido}, {cliente.nombre}</strong>
                          <span className="moroso-detalle">Cuota {moroso.numero_cuota} - Venció el {moroso.fecha_vencimiento.split('-').reverse().join('/')}</span>
                        </div>
                        <div className="moroso-accion">
                          <span className="moroso-monto">${moroso.monto_cuota}</span>
                          {cliente.telefono && (
                            <a href={`https://wa.me/${cliente.telefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" title="Mandar WhatsApp">
                              <Phone size={16} />
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="link-simulador-section">
            <h3><LinkIcon size={22} /> Compartir Simulador Público</h3>
            <p>Pasale este link a tus clientes para que coticen sus préstamos ellos mismos:</p>
            <div className="link-box">
              <input type="text" readOnly value={`${window.location.origin}/simulador`} className="form-input" />
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/simulador`); alert('¡Link copiado!'); }} className="btn-accion guardar"><Copy size={20} /></button>
              <a href="/simulador" target="_blank" rel="noopener noreferrer" className="btn-accion editar"><ExternalLink size={20} /></a>
            </div>
          </div>

          <div className="crud-section">
            <h2>Administración de Clientes</h2>
            <div className="table-responsive">
              <table className="crud-table">
                <thead>
                  <tr>
                    <th>Apellido</th>
                    <th>Nombre</th>
                    <th>DNI</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.id}>
                      {editandoId === cliente.id ? (
                        <>
                          <td><input type="text" name="apellido" value={editFormData.apellido} onChange={handleEditChange} className="inline-input" /></td>
                          <td><input type="text" name="nombre" value={editFormData.nombre} onChange={handleEditChange} className="inline-input" /></td>
                          <td><input type="text" name="dni" value={editFormData.dni} onChange={handleEditChange} className="inline-input" /></td>
                          <td className="acciones-cell">
                            <button className="btn-accion guardar" onClick={() => handleGuardarCambios(cliente.id)} title="Guardar"><Check size={18} /></button>
                            <button className="btn-accion cancelar" onClick={() => setEditandoId(null)} title="Cancelar"><X size={18} /></button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td data-label="Apellido">{cliente.apellido}</td>
                          <td data-label="Nombre">{cliente.nombre}</td>
                          <td data-label="DNI">{cliente.dni}</td>
                          <td className="acciones-cell">
                            <button className="btn-accion editar" onClick={() => handleActivarEditar(cliente)} title="Editar"><Edit3 size={18} /></button>
                            <button className="btn-accion eliminar" onClick={() => handleEliminarCliente(cliente.id, cliente.nombre, cliente.apellido)} title="Eliminar"><Trash2 size={18} /></button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;