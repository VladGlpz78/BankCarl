import { useState, useEffect } from 'react';
import { UploadCloud, FileText, Eye } from 'lucide-react';
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

  const buscarDocumentosCliente = async (id) => {
    if (!id) {
      setDocumentosGuardados([]);
      return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/documentos/${id}`, {
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

    const formData = new FormData();
    formData.append('cliente_id', clienteId);
    formData.append('tipo_documento', tipoDocumento);
    formData.append('foto', archivo);

    try {
      const res = await fetch('http://localhost:3000/api/documentos', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // 👈 Pasaporte para subir archivos
        body: formData,
      });

      const data = await res.json();

      if (data.éxito) {
        alert('¡Documento subido con éxito!');
        setArchivo(null);
        document.getElementById('file-input').value = '';
        buscarDocumentosCliente(clienteId);
      } else {
        alert('Hubo un problema: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    } finally {
      setSubiendo(false);
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
                  <a href={doc.url_archivo} target="_blank" rel="noopener noreferrer" className="btn-ver-archivo">
                    <Eye size={16} /> Ver Archivo
                  </a>
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