const supabase = require('../config/supabase');

const crearCliente = async (req, res) => {
    try {
        const { nombre, apellido, dni, telefono, direccion, direccion_hogar, direccion_laboral, notas } = req.body;

        const dniFinal = dni ? dni : null;
        
        const direccionFinal = direccion || direccion_hogar || null;

        const { data, error } = await supabase
            .from('clientes')
            .insert([
                { 
                    nombre, 
                    apellido, 
                    dni: dniFinal, 
                    telefono, 
                    direccion_hogar: direccionFinal, 
                    direccion_laboral, 
                    notas 
                }
            ])
            .select();

        if (error) {
            return res.status(400).json({ éxito: false, error: error.message });
        }

        // Si salió todo bien, respondemos con el cliente creado
        res.status(201).json({ éxito: true, cliente: data[0] });

    } catch (error) {
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }
};

const obtenerClientes = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('apellido', { ascending: true }); // Los ordenamos alfabéticamente

        if (error) {
            return res.status(400).json({ éxito: false, error: error.message });
        }

        res.status(200).json({ éxito: true, clientes: data });
    } catch (error) {
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }
};

const actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, dni, telefono, direccion_hogar, direccion_laboral, notas } = req.body;

        const dniFinal = dni ? dni : null;

        const { data, error } = await supabase
            .from('clientes')
            .update({ nombre, apellido, dni: dniFinal, telefono, direccion_hogar, direccion_laboral, notas })
            .eq('id', id)
            .select();

        if (error) return res.status(400).json({ éxito: false, error: error.message });

        res.status(200).json({ éxito: true, cliente: data[0] });
    } catch (error) {
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }
};

const eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id', id);

        if (error) return res.status(400).json({ éxito: false, error: error.message });

        res.status(200).json({ éxito: true, mensaje: 'Cliente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }
};

module.exports = { crearCliente, obtenerClientes, actualizarCliente, eliminarCliente };