const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // Buscamos el token en las cabeceras de la petición
    const tokenHeader = req.headers['authorization'];
    
    if (!tokenHeader) {
        return res.status(403).json({ éxito: false, error: 'Acceso denegado: No se proporcionó un token.' });
    }

    // El formato suele ser "Bearer el_chorizo_de_numeros"
    const token = tokenHeader.split(' ')[1];

    try {
        // Verificamos si el token es válido y no fue falsificado ni venció
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = verificado; // Guardamos los datos del admin en la petición
        next(); // ¡Todo en orden! El guardia lo deja pasar a la ruta solicitada
    } catch (error) {
        return res.status(401).json({ éxito: false, error: 'Token inválido o expirado. Iniciá sesión de nuevo.' });
    }
};

module.exports = verificarToken;