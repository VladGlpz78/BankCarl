import { useState, useEffect } from 'react';
import { Archive, Star, MessageSquare } from 'lucide-react';
import '../styles/Caja.css';

const Caja = () => {
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/pagos/historial', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.éxito) setHistorial(data.historial);
      } catch (error) {
        console.error('Error al cargar la caja', error);
      } finally {
        setCargando(false);
      }
    };
    cargarHistorial();
  }, [token]);

  // Función para dibujar las estrellitas amarillas según la calificación
  const renderEstrellas = (calificacion) => {
    return [...Array(5)].map((_, index) => (
      <Star 
        key={index} 
        size={16} 
        fill={index < calificacion ? "#fbbf24" : "none"} 
        color={index < calificacion ? "#fbbf24" : "#cbd5e1"} 
      />
    ));
  };

  // Sumamos toda la plata que entró para tener el total de la caja
  const totalCaja = historial.reduce((total, pago) => total + parseFloat(pago.monto_pagado), 0);

  return (
    <div className="caja-container">
      <div className="caja-header">
        <h2><Archive size={28} color="#10b981" /> Historial de Caja</h2>
        <div className="caja-total">
          <span>Ingresos Totales:</span>
          <strong>$ {totalCaja.toLocaleString('es-AR')}</strong>
        </div>
      </div>

      {cargando ? (
        <p>Cargando movimientos...</p>
      ) : historial.length === 0 ? (
        <p>Todavía no hay cobros registrados.</p>
      ) : (
        <div className="historial-lista">
          {historial.map((pago) => {
            // Extraemos los datos del cliente que nos trajo el JOIN de Supabase
            const cliente = pago.prestamos?.clientes;

            return (
              <div key={pago.id} className="pago-card">
                <div className="pago-principal">
                  <div className="pago-cliente-info">
                    <strong>{cliente?.apellido}, {cliente?.nombre}</strong>
                    <div className="estrellas-container">
                      {renderEstrellas(cliente?.calificacion || 5)}
                    </div>
                  </div>
                  <div className="pago-monto">
                    + $ {pago.monto_pagado}
                  </div>
                </div>

                <div className="pago-detalles">
                  <span className="pago-fecha">
                    🗓️ {new Date(pago.fecha_pago).toLocaleDateString('es-AR', { hour: '2-digit', minute:'2-digit' })}
                  </span>
                  
                  {pago.observaciones && (
                    <div className="pago-observacion">
                      <MessageSquare size={14} />
                      <i>{pago.observaciones}</i>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Caja;