import { useState } from 'react';
import { Calculator, Send } from 'lucide-react';

const Simulador = () => {
  const [formData, setFormData] = useState({
    monto: '',
    frecuencia: 'Semanal', 
    plazo: '4' 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'frecuencia') {
      setFormData({ ...formData, frecuencia: value, plazo: value === 'Semanal' ? '4' : '1' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const montoNum = parseFloat(formData.monto) || 0;
  const plazoNum = parseInt(formData.plazo) || 1;
  
  const porcentajeInteres = formData.frecuencia === 'Semanal' ? plazoNum * 4 : plazoNum * 16;
  const montoInteres = montoNum * (porcentajeInteres / 100);
  const totalTeorico = montoNum + montoInteres;
  
  const cuotaRedondeada = Math.ceil((totalTeorico / plazoNum) / 100) * 100;
  const totalReal = cuotaRedondeada * plazoNum; 

  const mensajeWhatsApp = `Hola! Estuve usando el simulador. Me interesa solicitar un préstamo de $${montoNum.toLocaleString('es-AR')} en un plan de ${plazoNum} cuotas ${formData.frecuencia === 'Semanal' ? 'semanales' : 'mensuales'}. ¿Me pasás los requisitos?`;

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1e293b', margin: '0 0 10px 0' }}>Simulador de Préstamos</h1>
        <p style={{ color: '#64748b', margin: 0 }}>Cotizá tu plan de pagos a medida, sin compromiso.</p>
      </div>

      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#334155' }}>¿Cuánta plata necesitás?</label>
          <input 
            type="number" 
            name="monto" 
            value={formData.monto} 
            onChange={handleChange} 
            min="1"
            className="form-input" 
            placeholder="Ej: 100000" 
            style={{ width: '100%', padding: '12px', fontSize: '18px', border: '2px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#334155' }}>Modalidad</label>
            <select 
              name="frecuencia" 
              value={formData.frecuencia} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white' }}
            >
              <option value="Semanal">Semanal</option>
              <option value="Mensual">Mensual</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#334155' }}>
              Cant. {formData.frecuencia === 'Semanal' ? 'Semanas' : 'Meses'}
            </label>
            {/* 👇 ACÁ EL CAMPO LIBRE PARA EL CLIENTE */}
            <input 
              type="number" 
              name="plazo" 
              value={formData.plazo} 
              onChange={handleChange} 
              min="1"
              style={{ width: '100%', padding: '12px', fontSize: '16px', border: '2px solid #e2e8f0', borderRadius: '8px', backgroundColor: 'white', boxSizing: 'border-box' }}
              placeholder={`Ej: ${formData.frecuencia === 'Semanal' ? '4' : '1'}`}
            />
          </div>
        </div>

        {montoNum > 0 && formData.plazo ? (
          <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '25px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontSize: '20px' }}>
              <Calculator size={24} /> Tu Plan a Medida
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
              <span style={{ color: '#94a3b8' }}>Efectivo a recibir:</span>
              <strong style={{ fontSize: '18px' }}>$ {montoNum.toLocaleString('es-AR')}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px' }}>
              <span style={{ color: '#94a3b8' }}>Total a devolver:</span>
              <strong style={{ fontSize: '18px', color: '#10b981' }}>$ {totalReal.toLocaleString('es-AR')}</strong>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '2px solid #38bdf8' }}>
              <span style={{ fontSize: '14px', color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '5px' }}>
                Tu cuota {formData.frecuencia === 'Semanal' ? 'Semanal' : 'Mensual'}
              </span>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                {plazoNum} x $ {cuotaRedondeada.toLocaleString('es-AR')}
              </div>
            </div>

            <a 
              href={`https://wa.me/?text=${encodeURIComponent(mensajeWhatsApp)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                backgroundColor: '#25D366', color: 'white', padding: '15px', borderRadius: '8px', 
                textDecoration: 'none', fontWeight: 'bold', fontSize: '16px', marginTop: '10px',
                transition: 'background-color 0.2s'
              }}
            >
              <Send size={20} /> Solicitar este préstamo ahora
            </a>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f8fafc', borderRadius: '8px', color: '#94a3b8', border: '2px dashed #cbd5e1' }}>
            Ingresá el monto y el plazo arriba para ver tus opciones de pago.
          </div>
        )}

      </div>
    </div>
  );
};

export default Simulador;