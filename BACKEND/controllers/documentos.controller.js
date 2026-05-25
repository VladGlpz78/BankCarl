const supabase = require('../config/supabase');

const subirDocumento = async (req, res) => {
    try {
        const { cliente_id, tipo_documento } = req.body;
        const archivo = req.file; // multer nos deja el archivo acá

        if (!archivo) {
            return res.status(400).json({ éxito: false, error: 'No se adjuntó ninguna imagen' });
        }

        // 1. Armamos un nombre único para que no se pisen si suben dos fotos que se llamen "dni.jpg"
        const nombreArchivo = `${Date.now()}_${archivo.originalname}`;

        // 2. Subimos la foto al bucket 'documentos' en Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('documentos')
            .upload(nombreArchivo, archivo.buffer, {
                contentType: archivo.mimetype // Avisa si es jpg, png, pdf, etc.
            });

        if (uploadError) return res.status(400).json({ éxito: false, error: uploadError.message });

        // 3. Obtenemos el link público para poder ver la foto
        const { data: publicUrlData } = supabase.storage
            .from('documentos')
            .getPublicUrl(nombreArchivo);
            
        const url_archivo = publicUrlData.publicUrl;

        // 4. Guardamos ese link en nuestra base de datos relacional
        const { data: dbData, error: dbError } = await supabase
            .from('documentos_cliente')
            .insert([{ 
                cliente_id, 
                tipo_documento, 
                url_archivo 
            }])
            .select();

        if (dbError) return res.status(400).json({ éxito: false, error: dbError.message });

        res.status(201).json({
            éxito: true,
            mensaje: 'Documento subido correctamente',
            documento: dbData[0]
        });

    } catch (error) {
        console.error('Error al subir documento:', error);
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }
};
// --- FUNCIÓN 2: TRAER DOCUMENTOS CON SEGURIDAD (URL FIRMADA) ---
const obtenerDocumentosPorCliente = async (req, res) => {
    try {
        const { cliente_id } = req.params;

        // 1. Buscamos los registros en la base de datos
        const { data, error } = await supabase
            .from('documentos_cliente')
            .select('*')
            .eq('cliente_id', cliente_id);

        if (error) return res.status(400).json({ éxito: false, error: error.message });

        // 2. MAGIA DE SEGURIDAD: Generamos URLs temporales que duran 60 segundos
        const documentosSeguros = await Promise.all(data.map(async (doc) => {
            // Extraemos solo el nombre del archivo del link viejo que teníamos guardado
            const nombreArchivo = doc.url_archivo.split('/documentos/')[1];

            // Le pedimos a Supabase una URL firmada (VIP) de 60 segundos (60s)
            const { data: urlData, error: errUrl } = await supabase.storage
                .from('documentos')
                .createSignedUrl(nombreArchivo, 60);

            return {
                ...doc,
                // Reemplazamos la URL pública por nuestra nueva URL segura
                url_archivo: urlData ? urlData.signedUrl : doc.url_archivo
            };
        }));

        res.status(200).json({ éxito: true, documentos: documentosSeguros });
    } catch (error) {
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }
};
module.exports = { subirDocumento, obtenerDocumentosPorCliente };