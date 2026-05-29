import { useState, useEffect } from 'react';
import { UploadCloud, FileText, Eye, Trash2 } from 'lucide-react'; // 👈 Sumamos Trash2
import supabase from '../config/supabase';
import '../styles/Documentos.css';

const Documentos = () => {
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('DNI');
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [documentosGuardados, setDocumentosGuardados] = useState([]);

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const res = await fetch('https://bankcarl.onrender.com/api/clientes', {
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

  const buscarDocumentosCliente = async (id) => {
    if (!id) {
      setDocumentosGuardados([]);
      return;
    }
    try {
      const res = await fetch(`https://bankcarl.onrender.com/api/documentos/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.éxito) setDocumentosGuardados(data.documentos);
    } catch (error) {
      console.error('Error al traer documentos:', error);
    }
  };

  const handleClienteChange = (e) => {
    const id = e.target.value;
    setClienteId(id);
    buscarDocumentosCliente(id);
  };

  const handleFileChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clienteId) return alert('Por favor, seleccioná un cliente.');
    if (!archivo) return alert('Por favor, seleccioná un archivo para subir.');

    setSubiendo(true);

    try {
      const nombreArchivo = `${clienteId}_${Date.now()}_${archivo.name}`;

      const { error: uploadError } = await supabase.storage
        .from('clientes-archivos')
        .upload(nombreArchivo, archivo);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('clientes-archivos')
        .getPublicUrl(nombreArchivo);

      const urlFoto = urlData.publicUrl;

      const res = await fetch('https://bankcarl.onrender.com/api/documentos', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          cliente_id: clienteId,
          tipo_documento: tipoDocumento,
          url_archivo: urlFoto
        }),
      });

      const data = await res.json();

      if (data.éxito) {
        alert('¡Documento subido y guardado con éxito!');
        setArchivo(null);
        document.getElementById('file-input').value = '';
        buscarDocumentosCliente(clienteId);
      } else {
        alert('Hubo un problema en la base de datos: ' + data.error);
      }
    } catch (error) {
      console.error("Error en el proceso:", error);
      alert('Error al subir el archivo. Revisá la consola.');
    } finally {
      setSubiendo(false);
    }
  };

  // 🚨 NUEVA FUNCIÓN: BORRAR DOCUMENTO DE STORAGE Y BASE DE DATOS
  const handleEliminarDocumento = async (doc) => {
    const confirmar = window.confirm(`¿Estás seguro que querés eliminar este documento (${doc.tipo_documento})? Esta acción no se puede deshacer.`);
    if (!confirmar) return;

    try {
      // 1. Extraemos el nombre puro del archivo desde la URL de Supabase
      // Ejemplo: "https://.../clientes-archivos/id_123_dni.jpg" -> nos quedamos con "id_123_dni.jpg"
      const nombreArchivo = doc.url_archivo.split('/').pop();

      // 2. Lo borramos del Storage de Supabase
      const { error: storageError } = await supabase.storage
        .from('clientes-archivos')
        .remove([nombreArchivo]);

      if (storageError) {
        console.error("Error al borrar del Storage:", storageError);
        // Continuamos de todos modos para no dejar el registro huérfano en la BD
      }

      // 3. Lo borramos de la base de datos llamando a tu API Backend
      const res = await fetch(`https://bankcarl.onrender.com/api/documentos/${doc.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (data.éxito) {
        alert('Documento eliminado correctamente.');
        buscarDocumentosCliente(clienteId); // Recargamos la lista en pantalla
      } else {
        alert('Error al eliminar de la base de datos: ' + data.error);
      }
    } catch (error) {
      console.error("Error al intentar eliminar:", error);
      alert('Error de conexión al intentar borrar el archivo.');
    }
  };

  return (
    <div className="documentos-container">
      <h2>Bóveda de Documentos</h2>
      <p>Subí y gestioná los archivos y garantías de tus clientes.</p>

      <form className="documentos-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Seleccionar Cliente:</label>
          <select value={clienteId} onChange={handleClienteChange} required className="form-input">
            <option value="">-- Elegí un cliente --</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.apellido}, {cliente.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Tipo de Documento:</label>
          <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)} className="form-input">
            <option value="DNI">DNI</option>
            <option value="Pagaré">Pagaré Firmado</option>
            <option value="Recibo de Sueldo">Recibo de Sueldo</option>
            <option value="Servicio">Factura de Servicio</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div className="form-group file-upload-wrapper">
          <label className="file-upload-label" htmlFor="file-input">
            <UploadCloud size={40} color="#007BFF" />
            <span>{archivo ? archivo.name : 'Hacé clic acá para elegir una foto o PDF'}</span>
          </label>
          <input id="file-input" type="file" accept="image/*,.pdf" onChange={handleFileChange} className="file-input-hidden" />
        </div>

        <button type="submit" className="btn-submit" disabled={subiendo}>
          {subiendo ? 'Subiendo a la nube...' : 'Guardar Documento'}
        </button>
      </form>

      {clienteId && (
        <div className="galeria-seccion">
          <h3>Archivos guardados de este cliente</h3>
          {documentosGuardados.length === 0 ? (
            <p className="no-docs">Este cliente todavía no tiene ningún documento registrado.</p>
          ) : (
            <div className="lista-documentos-links">
              {documentosGuardados.map((doc) => (
                <div key={doc.id} className="documento-item-card">
                  <div className="doc-item-info">
                    <FileText size={20} color="#666" />
                    <span>{doc.tipo_documento}</span>
                  </div>
                  
                  {/* CONTENEDOR DE ACCIONES (VER Y ELIMINAR) */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <a href={doc.url_archivo} target="_blank" rel="noopener noreferrer" className="btn-ver-archivo">
                      <Eye size={16} /> Ver
                    </a>
                    
                    {/* Botón de borrado estilizado rápido */}
                    <button 
                      onClick={() => handleEliminarDocumento(doc)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        backgroundColor: '#fee2e2',
                        color: '#ef4444',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fca5a5'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#fee2e2'}
                    >
                      <Trash2 size={16} /> Borrar
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Documentos;