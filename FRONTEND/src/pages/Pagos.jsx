import { useState, useEffect } from 'react';
import '../styles/Pagos.css';

const Pagos = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [cuotas, setCuotas] = useState([]);

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/clientes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.éxito) setClientes(data.clientes);
      } catch (error) {
        console.error('Error al cargar clientes', error);
      }
    };
    cargarClientes();
  }, []);

  const handleClienteChange = async (e) => {
    const id = e.target.value;
    setClienteSeleccionado(id);
    
    if (!id) {
      setCuotas([]);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/api/pagos/pendientes/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.éxito) {
        setCuotas(data.cuotas);
      } else {
        alert('Error al buscar cuotas');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePagar = async (cuota) => {
  const confirmar = window.confirm(`¿Confirmás el pago de $${Number(cuota.monto_cuota).toLocaleString('es-AR')} de la cuota ${cuota.numero_cuota}?`);
    if (!confirmar) return;

    // Pedimos la observación con un cartelito (si le da a cancelar o lo deja vacío, se guarda como null)
    const nota = window.prompt("¿Querés dejar alguna observación para este cobro? (Opcional)", "");

    try {
      const res = await fetch('http://localhost:3000/api/pagos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cuota_id: cuota.id,
          prestamo_id: cuota.prestamo_id,
          monto_pagado: cuota.monto_cuota,
          observaciones: nota // 👈 Mandamos la nota al backend
        })
      });

      const data = await res.json();

      if (data.éxito) {
        alert('¡Pago registrado con éxito!');
        handleClienteChange({ target: { value: clienteSeleccionado } });
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    }
  };
  return (
    <div className="pagos-container">
      <h2>Registrar Cobros</h2>

      <div className="form-group" style={{ marginBottom: '20px' }}>
        <label>Seleccionar Cliente:</label>
        <select value={clienteSeleccionado} onChange={handleClienteChange} className="form-input">
          <option value="">-- Elegí un cliente para ver sus deudas --</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.apellido}, {cliente.nombre} - DNI: {cliente.dni}
            </option>
          ))}
        </select>
      </div>

      {clienteSeleccionado && cuotas.length === 0 && (
        <p className="mensaje-limpio">Este cliente no tiene cuotas pendientes. ¡Está al día!</p>
      )}

      {cuotas.length > 0 && (
        <div className="cuotas-lista">
          <h3>Cuotas Pendientes</h3>
          {cuotas.map((cuota) => {
            const hoyStr = new Date().toISOString().split('T')[0];
            const estaVencida = cuota.fecha_vencimiento < hoyStr;

            return (
              <div key={cuota.id} className={`cuota-card ${estaVencida ? 'vencida' : ''}`}>
                <div className="cuota-info">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <strong>Cuota {cuota.numero_cuota}</strong>
                    {estaVencida && <span className="badge-vencida">¡ATRASADA!</span>}
                  </div>
                  <span className="cuota-monto">$ {Number(cuota.monto_cuota).toLocaleString('es-AR')}</span>
                  <span className={`cuota-vencimiento ${estaVencida ? 'texto-rojo' : ''}`}>
                    Vence: {cuota.fecha_vencimiento.split('-').reverse().join('/')}
                  </span>
                </div>
                <button className={`btn-pagar ${estaVencida ? 'btn-rojo' : ''}`} onClick={() => handlePagar(cuota)}>
                  Cobrar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Pagos;