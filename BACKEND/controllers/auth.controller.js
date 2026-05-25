const jwt = require('jsonwebtoken');

const login = (req, res) => {
    const { usuario, password } = req.body;

    if (usuario === process.env.ADMIN_USUARIO && password === process.env.ADMIN_PASSWORD) {
        // Generamos un token real firmado criptográficamente que dura 8 horas
        const token = jwt.sign(
            { id: 1, rol: 'admin' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '8h' }
        );
        
        res.status(200).json({ éxito: true, token });
    } else {
        setTimeout(() => {
            res.status(401).json({ éxito: false, error: 'Usuario o contraseña incorrectos' });
        }, 1000);
    }
};

module.exports = { login };