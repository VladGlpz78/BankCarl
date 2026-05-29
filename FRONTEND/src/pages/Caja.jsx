import { useState, useEffect } from 'react';
import { Archive, Calendar, MessageSquare, CreditCard, Trash2 } from 'lucide-react';
import '../styles/Caja.css';

const Caja = () => {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);

  const token = localStorage.getItem('auth_token');

  const cargarHistorial = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/pagos/historial', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.éxito && Array.isArray(data.historial)) {
        setHistorial(data.historial);
      }
    } catch (error) {
      console.error('Error al cargar la caja', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [token]);

  // --- 👇 FUNCIÓN NUEVA: BORRAR PRÉSTAMO E HISTORIAL DE CAJA ---
  const handleEliminarPrestamo = async (id, apellido, nombre) => {
    const confirmar = window.confirm(
      `⚠️ ¡ALERTA MÁXIMA! ⚠️\n\n¿Seguro que querés borrar por completo el préstamo de ${apellido}, ${nombre}?\n\nEsto eliminará permanentemente el préstamo, todas sus cuotas y todo su historial de cobros de la caja. Esta acción NO se puede deshacer.`
    );
    
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:3000/api/prestamos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.éxito) {
        alert('Préstamo e historial eliminados correctamente del sistema.');
        // Filtramos el estado local para que la tarjeta desaparezca de la pantalla al instante
        setHistorial(historial.filter(p => p.id !== id));
      } else {
        alert('Error al eliminar: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    }
  };

  const totalCaja = historial.reduce((totalAcumulado, prestamo) => {
    const pagosSeguros = prestamo.pagos || [];
    const pagosDelPrestamo = pagosSeguros.reduce((sumaPagos, pago) => sumaPagos + parseFloat(pago.monto_pagado || 0), 0);
    return totalAcumulado + pagosDelPrestamo;
  }, 0);

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '---';
    return fechaStr.split('-').reverse().join('/');
  };

  return (
    <div className="caja-container">
      <div className="caja-header">
        <h2><Archive size={28} color="#10b981" /> Estado de Préstamos</h2>
        <div className="caja-total">
          <span>Ingresos Totales en Caja:</span>
          <strong>$ {totalCaja.toLocaleString('es-AR')}</strong>
        </div>
      </div>

      {cargando ? (
        <p>Cargando registros...</p>
      ) : historial.length === 0 ? (
        <p>No hay préstamos registrados.</p>
      ) : (
        <div className="historial-lista">
          {historial.map((prestamo) => {
            const cliente = prestamo.clientes || { nombre: 'Cliente', apellido: 'Desconocido' };
            const cuotasSeguras = prestamo.cuotas || [];
            const pagosSeguros = prestamo.pagos || [];
            
            const cuotasOrdenadas = [...cuotasSeguras].sort((a, b) => a.numero_cuota - b.numero_cuota);

            return (
              <div key={prestamo.id} className="prestamo-card">
                
                {/* CABECERA DE LA TARJETA */}
                <div className="prestamo-card-header">
                  <div className="cliente-info">
                    <strong>{cliente.apellido}, {cliente.nombre}</strong>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      <Calendar size={14} /> 
                      Plazo: {formatearFecha(prestamo.fecha_inicio)} al {formatearFecha(prestamo.fecha_fin)}
                    </span>
                  </div>
                  <div className="prestamo-datos-rapidos">
                    {/* Aliné el badge y el tacho en una fila horizontal prolija */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={`badge-estado ${(prestamo.estado || 'activo').toLowerCase()}`}>{prestamo.estado || 'Activo'}</span>
                      
                      {/* 👇 EL TACHO DE BASURA INTELIGENTE */}
                      <button 
                        onClick={() => handleEliminarPrestamo(prestamo.id, cliente.apellido, cliente.nombre)}
                        style={{ 
                          background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', 
                          padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', 
                          justifyContent: 'center', transition: 'all 0.2s' 
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Eliminar este préstamo e historial"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <span className="monto-total" style={{ marginTop: '5px' }}>
                    A devolver: $ {Number(prestamo.monto_total || 0).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>

                {/* GRILLA DE CUOTAS */}
                {cuotasOrdenadas.length > 0 && (
                  <div className="cuotas-seccion">
                    <h4><CreditCard size={16}/> Estado de las Cuotas</h4>
                    <div className="cuotas-grid">
                      {cuotasOrdenadas.map(cuota => {
                        const estadoClase = cuota.estado === 'Pagada' ? 'pagada' : cuota.estado === 'Pendiente' ? 'pendiente' : 'vencida';
                        return (
                          <div key={cuota.id} className={`cuota-item ${estadoClase}`}>
                            <div className="cuota-num">C{cuota.numero_cuota}</div>
                            <div className="cuota-detalles">
                              <span className="c-monto">$ {Number(cuota.monto_cuota).toLocaleString('es-AR')}</span>
                              <span className="c-estado">{cuota.estado}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* HISTORIAL DE PAGOS REALIZADOS */}
                {pagosSeguros.length > 0 && (
                  <div className="pagos-seccion">
                    <h4>Historial de cobros:</h4>
                    <ul className="lista-pagos-chica">
                      {pagosSeguros.map(pago => (
                        <li key={pago.id}>
                          <strong>+ $ {Number(pago.monto_pagado).toLocaleString('es-AR')}</strong>el {new Date(pago.fecha_pago).toLocaleDateString('es-AR')}
                          {pago.observaciones && <span className="nota-pago"><MessageSquare size={12}/> {pago.observaciones}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Caja;