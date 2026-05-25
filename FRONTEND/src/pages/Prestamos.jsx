import { useState, useEffect } from 'react';
import { DollarSign, Calculator } from 'lucide-react';

const Prestamos = () => {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    cliente_id: '',
    monto: '',
    frecuencia: 'Semanal', 
    plazo: '4', // Valor inicial
    fecha_inicio: new Date().toISOString().split('T')[0]
  });
  const [cargando, setCargando] = useState(false);

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/clientes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.éxito) setClientes(data.clientes);
      } catch (error) {}
    };
    cargarClientes();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'frecuencia') {
      // Le ponemos un valor sugerido lógico si cambia la modalidad (4 semanas o 1 mes)
      setFormData({ ...formData, frecuencia: value, plazo: value === 'Semanal' ? '4' : '1' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // --- LÓGICA DE LA TABLA (100% Sin Límites) ---
  const montoNum = parseFloat(formData.monto) || 0;
  // Si el usuario borra el número, calculamos sobre 1 para que no se rompa la matemática
  const plazoNum = parseInt(formData.plazo) || 1; 
  
  const porcentajeInteres = formData.frecuencia === 'Semanal' ? plazoNum * 4 : plazoNum * 16;
  const montoInteres = montoNum * (porcentajeInteres / 100);
  const totalTeorico = montoNum + montoInteres;
  
  const cuotaRedondeada = Math.ceil((totalTeorico / plazoNum) / 100) * 100;
  const totalReal = cuotaRedondeada * plazoNum; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (montoNum <= 0) return alert('Ingresá un monto válido');
    if (plazoNum <= 0) return alert('El plazo debe ser mayor a 0');
    setCargando(true);

    try {
      const res = await fetch('http://localhost:3000/api/prestamos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cliente_id: formData.cliente_id,
          monto: montoNum,
          tasa_interes: porcentajeInteres,
          cuotas: plazoNum,
          frecuencia: formData.frecuencia, 
          fecha_inicio: formData.fecha_inicio
        })
      });

      const data = await res.json();
      if (data.éxito) {
        const palabraPlazo = formData.frecuencia === 'Semanal' ? 'semanas' : 'meses';
        alert(`¡Préstamo generado! ${plazoNum} ${palabraPlazo} de $${cuotaRedondeada}`);
        setFormData({ ...formData, monto: '', plazo: formData.frecuencia === 'Semanal' ? '4' : '1' });
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <DollarSign size={30} color="#28a745" />
        <h2 style={{ margin: 0 }}>Otorgar Nuevo Préstamo</h2>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        <div style={{ flex: '1 1 350px', backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Seleccionar Cliente</label>
              <select name="cliente_id" value={formData.cliente_id} onChange={handleChange} required className="form-input">
                <option value="">-- Elegí un cliente --</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.apellido}, {cliente.nombre} - DNI: {cliente.dni}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Monto Principal ($)</label>
              <input type="number" name="monto" value={formData.monto} onChange={handleChange} required min="1" className="form-input" placeholder="Ej: 100000" />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Modalidad</label>
                <select name="frecuencia" value={formData.frecuencia} onChange={handleChange} className="form-input">
                  <option value="Semanal">Semanal</option>
                  <option value="Mensual">Mensual</option>
                </select>
              </div>

              {/* 👇 ACÁ ESTÁ LA MAGIA: Ahora es un input libre */}
              <div className="form-group" style={{ flex: 1 }}>
                <label>Cant. de {formData.frecuencia === 'Semanal' ? 'Semanas' : 'Meses'}</label>
                <input 
                  type="number" 
                  name="plazo" 
                  value={formData.plazo} 
                  onChange={handleChange} 
                  required 
                  min="1"
                  className="form-input" 
                  placeholder={`Ej: ${formData.frecuencia === 'Semanal' ? '4' : '1'}`}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Fecha de Entrega del Efectivo</label>
              <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required className="form-input" />
            </div>

            <button type="submit" className="btn-submit" disabled={cargando} style={{ marginTop: '15px', backgroundColor: '#28a745' }}>
              {cargando ? 'Generando...' : 'Aprobar Préstamo'}
            </button>
          </form>
        </div>

        {/* Tarjeta de Resumen */}
        {montoNum > 0 && formData.plazo && (
          <div style={{ flex: '1 1 250px', backgroundColor: '#0f172a', color: 'white', padding: '25px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24' }}>
              <Calculator size={20} /> Resumen del Plan
            </h3>
            
            <div style={{ borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Efectivo Entregado:</span>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>$ {montoNum.toLocaleString('es-AR')}</div>
            </div>

            <div style={{ borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Interés Total ({porcentajeInteres}%):</span>
              <div style={{ fontSize: '18px' }}>+ $ {(totalReal - montoNum).toLocaleString('es-AR')}</div>
            </div>

            <div style={{ paddingBottom: '10px' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>El cliente devuelve en total:</span>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>$ {totalReal.toLocaleString('es-AR')}</div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '15px', borderRadius: '6px', textAlign: 'center', border: '1px solid #38bdf8' }}>
              <span style={{ fontSize: '13px', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px' }}>Cuota {formData.frecuencia === 'Semanal' ? 'Semanal' : 'Mensual'}</span>
              <div style={{ fontSize: '26px', fontWeight: 'bold', marginTop: '5px' }}>
                {plazoNum} x $ {cuotaRedondeada.toLocaleString('es-AR')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prestamos;