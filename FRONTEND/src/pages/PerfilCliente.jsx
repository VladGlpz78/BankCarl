import { useState, useEffect } from 'react';
import { User, CreditCard, Calendar, Upload, Camera, FileText } from 'lucide-react';
import supabase from '../config/supabase'; // 👈 Asegurate de que la ruta coincida con la tuya

const PerfilCliente = ({ clienteId = "id-de-prueba" }) => {
  const [cliente, setCliente] = useState(null);
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  // Simulación de carga de datos (después lo conectamos a tu fetch)
  useEffect(() => {
    // Acá harías el fetch a tu backend buscando los datos del cliente y sus préstamos
    setCliente({
      id: clienteId,
      nombre: 'Juan',
      apellido: 'Pérez',
      telefono: '3814556677',
      zona: 'Barrio Norte',
      foto_dni: null // Al principio no hay foto
    });
    setPrestamos([
      { id: 1, monto_total: 50000, estado: 'Activo', fecha_inicio: '2026-05-01' }
    ]);
    setCargando(false);
  }, [clienteId]);

  // FUNCIÓN PARA CAPTURAR Y SUBIR LA IMAGEN REAL
  const handleSeleccionarImagen = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    setSubiendoFoto(true);

    try {
      // 1. Armamos un nombre único para la foto (Ej: id-del-cliente_1701234567_foto.jpg)
      // Esto evita que si dos clientes suben una foto llamada "dni.jpg" se pisen entre sí.
      const nombreArchivo = `${cliente.id}_${Date.now()}_${archivo.name}`;

      // 2. Subimos el archivo directamente al balde
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('clientes-archivos')
        .upload(nombreArchivo, archivo);

      if (uploadError) {
        throw uploadError;
      }

      // 3. Pedimos el Link Público (URL) de la foto que acabamos de subir
      const { data: urlData } = supabase.storage
        .from('clientes-archivos')
        .getPublicUrl(nombreArchivo);

      const urlFoto = urlData.publicUrl;

      // 4. Guardamos ese link en la ficha del cliente en la Base de Datos
      const { error: dbError } = await supabase
        .from('clientes')
        .update({ foto_dni: urlFoto })
        .eq('id', cliente.id);

      if (dbError) {
        throw dbError;
      }

      // 5. Actualizamos la pantalla para que la foto aparezca al instante
      setCliente(prev => ({
        ...prev,
        foto_dni: urlFoto
      }));
      
    } catch (error) {
      console.error("Error subiendo la foto:", error);
      alert('Hubo un problema al subir la imagen. Revisá la consola.');
    } finally {
      setSubiendoFoto(false);
    }
  };
  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* TARJETA SUPERIOR: DATOS GENERALES */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', gap: '25px', flexWrap: 'wrap', marginBottom: '25px' }}>
        
        {/* ESPACIO PARA LA FOTO DEL DNI */}
        <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '20px', backgroundColor: '#f8fafc', minHeight: '180px' }}>
          {cliente.foto_dni ? (
            <div style={{ width: '100%', textAlign: 'center' }}>
              <img src={cliente.foto_dni} alt="DNI Cliente" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }} />
              <label style={{ display: 'block', marginTop: '10px', color: '#3b82f6', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                <Camera size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Cambiar foto
                <input type="file" accept="image/*" onChange={handleSeleccionarImagen} style={{ display: 'none' }} />
              </label>
            </div>
          ) : (
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#64748b' }}>
              <Upload size={32} color="#94a3b8" />
              <span style={{ fontSize: '14px', fontWeight: '5px', textAlign: 'center' }}>
                {subiendoFoto ? 'Subiendo...' : 'Subir o sacar foto del DNI'}
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>(Soporta cámara de celu)</span>
              {/* input oculto para usar nuestro propio diseño de botón */}
              <input 
                type="file" 
                accept="image/*" // Permite solo imágenes
                onChange={handleSeleccionarImagen} 
                style={{ display: 'none' }} 
              />
            </label>
          )}
        </div>

        {/* DATOS PERSONALES */}
        <div style={{ flex: '2 1 350px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h2 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '26px' }}>
            <User size={22} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {cliente.apellido}, {cliente.nombre}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', color: '#475569', fontSize: '15px' }}>
            <div><strong>Teléfono:</strong> {cliente.telefono}</div>
            <div><strong>Zona:</strong> {cliente.zona}</div>
            <div><strong>ID de Sistema:</strong> <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>{cliente.id}</code></div>
          </div>
        </div>

      </div>

      {/* SECCIÓN INFERIOR: HISTORIAL DE PRÉSTAMOS */}
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} color="#10b981" /> Historial de Créditos
        </h3>
        
        {prestamos.map(p => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '10px' }}>
            <div>
              <strong style={{ display: 'block', color: '#334155' }}>Préstamo #{p.id}</strong>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Inició el: {p.fecha_inicio.split('-').reverse().join('/')}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontWeight: 'bold', color: '#0f172a' }}>$ {p.monto_total.toLocaleString('es-AR')}</span>
              <span style={{ fontSize: '12px', backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>{p.estado}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default PerfilCliente;