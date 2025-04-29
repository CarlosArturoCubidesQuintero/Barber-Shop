// Importamos la función verifyAccessToken desde utils/jwtUtils.js
// Esta función nos permite verificar la validez del Access Token
const { verifyAccessToken } = require("../utils/jwtUtils");

// Definimos el middleware de autenticación
const authMiddleware = (req, res, next) => {

    // Extraemos el encabezado "Authorization" de la solicitud
    const authHeader = req.header("Authorization");

    // Verificamos si el encabezado Authorization está presente y tiene el formato correcto ("Bearer <token>")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Acceso denegado. Token no proporcionado" });
    }

    // Extraemos el token eliminando la palabra "Bearer " y obteniendo solo el valor del token
    const token = authHeader.split(" ")[1];
    //console.log("Authorization Header:", authHeader); // Para depuración, mostramos el token en la consola
    //console.log("Token extraído:", token); // Para depuración, mostramos el token en la consola

    try {
        // Verificamos el token usando la función verifyAccessToken de utils
        // Si el token es válido, obtenemos los datos del usuario
        const decoded = verifyAccessToken(token);

        // Guardamos los datos del usuario en req.user para que estén disponibles en las siguientes funciones
        req.user = decoded;

        // Llamamos a next() para continuar con el siguiente middleware o controlador de la ruta
        next();
    } catch (error) {
        // Si el token es inválido o expirado, enviamos una respuesta de error con código 401 (No autorizado)
        return res.status(401).json({ error: "Token inválido o expirado. Inicie Sesión nuevamente", details: error.message });
    }
};

// Exportamos el middleware para que pueda ser utilizado en otras partes de la aplicación
module.exports = authMiddleware;
