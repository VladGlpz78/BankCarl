const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase'); // Importamos la conexión a la base

const login = async (req, res) => {
    const { usuario, password } = req.body;

    try {
        // 1. Vamos a buscar al usuario a la tabla nueva de Supabase
        const { data: user, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('username', usuario)
            .eq('password', password)
            .single();

        // 2. Si Supabase nos devuelve un usuario, significa que los datos coinciden
        if (user) {
            // Generamos el pase VIP guardando el ID real de quién entró
            const token = jwt.sign(
                { id: user.id, username: user.username, rol: user.rol }, 
                process.env.JWT_SECRET, 
                { expiresIn: '8h' }
            );
            
            res.status(200).json({ éxito: true, token, usuario: user.username });
        } else {
            // Si user es null, le pifió a la clave o al nombre
            setTimeout(() => {
                res.status(401).json({ éxito: false, error: 'Usuario o contraseña incorrectos' });
            }, 1000);
        }
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ éxito: false, error: 'Error interno del servidor' });
    }
};

module.exports = { login };