const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // 1. Buscamos el token en la cabecera de la petición (llega como "Bearer <token>")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // 2. Si no hay token, bloqueamos la puerta
    if (!token) {
        return res.status(401).json({ éxito: false, error: 'Acceso denegado. No hay token de seguridad.' });
    }

    try {
        // 3. Verificamos que el token sea auténtico usando la clave secreta de tu .env
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Si todo está bien, guardamos los datos del usuario y lo dejamos pasar al controlador
        req.usuario = verificado;
        next(); 
    } catch (error) {
        return res.status(403).json({ éxito: false, error: 'Token inválido o expirado.' });
    }
};

module.exports = { verificarToken };