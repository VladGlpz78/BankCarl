const supabase = require('../config/supabase');

const crearCliente = async (req, res) => {
    try {
        // Sacamos los datos que nos envía el frontend (React)
        const { nombre, apellido, dni, direccion_hogar, direccion_laboral, notas } = req.body;

        // Le decimos a Supabase que inserte estos datos en la tabla 'clientes'
        const { data, error } = await supabase
            .from('clientes')
            .insert([
                { nombre, apellido, dni, direccion_hogar, direccion_laboral, notas }
            ])
            .select(); // .select() hace que Supabase nos devuelva el registro recién creado

        // Si hay un error (ej: DNI duplicado), frenamos todo
        if (error) {
            return res.status(400).json({ éxito: false, error: error.message });
        }

        // Si salió todo bien, respondemos con el cliente creado
        res.status(201).json({ éxito: true, cliente: data[0] });

    } catch (error) {
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }

};

// Función para traer todos los clientes
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

// --- FUNCIÓN 3: ACTUALIZAR UN CLIENTE ---
const actualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, dni, direccion_hogar, direccion_laboral, notas } = req.body;

        const { data, error } = await supabase
            .from('clientes')
            .update({ nombre, apellido, dni, direccion_hogar, direccion_laboral, notas })
            .eq('id', id)
            .select();

        if (error) return res.status(400).json({ éxito: false, error: error.message });

        res.status(200).json({ éxito: true, cliente: data[0] });
    } catch (error) {
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }
};

// --- FUNCIÓN 4: ELIMINAR UN CLIENTE ---
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