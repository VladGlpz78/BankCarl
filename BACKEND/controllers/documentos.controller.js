const supabase = require('../config/supabase');

// --- FUNCIÓN 1: GUARDAR REFERENCIA EN BD ---
// React ya subió la foto al balde. Acá solo guardamos el texto (link) en PostgreSQL.
const subirDocumento = async (req, res) => {
    try {
        const { cliente_id, tipo_documento, url_archivo } = req.body;

        if (!cliente_id || !url_archivo) {
            return res.status(400).json({ éxito: false, error: 'Faltan datos para guardar el documento' });
        }

        const { data, error } = await supabase
            .from('documentos_cliente') // Asegurate de que tu tabla se llame así en Supabase
            .insert([{ cliente_id, tipo_documento, url_archivo }])
            .select();

        if (error) return res.status(400).json({ éxito: false, error: error.message });

        res.status(201).json({ éxito: true, documento: data[0] });
    } catch (error) {
        console.error('Error al guardar documento:', error);
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }
};

// --- FUNCIÓN 2: TRAER DOCUMENTOS ---
const obtenerDocumentosPorCliente = async (req, res) => {
    try {
        const { cliente_id } = req.params;

        const { data, error } = await supabase
            .from('documentos_cliente')
            .select('*')
            .eq('cliente_id', cliente_id);

        if (error) return res.status(400).json({ éxito: false, error: error.message });

        res.status(200).json({ éxito: true, documentos: data });
    } catch (error) {
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }
};

// --- FUNCIÓN 3: BORRAR DOCUMENTO (¡Para tu nuevo botón rojo!) ---
const eliminarDocumento = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('documentos_cliente')
            .delete()
            .eq('id', id);

        if (error) return res.status(400).json({ éxito: false, error: error.message });

        res.status(200).json({ éxito: true, mensaje: 'Documento borrado de la base de datos' });
    } catch (error) {
        console.error('Error al borrar documento:', error);
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }
};

module.exports = { subirDocumento, obtenerDocumentosPorCliente, eliminarDocumento };