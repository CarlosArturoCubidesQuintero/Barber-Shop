 //Importa el módelo   jsonwebtoken  para la verificación de tokens
 const jwt = require('jsonwebtoken');

 /**
 * Middleware de autenticación JWT.
 * Verifica la presencia y validez del token en la cabecera Authorization.
 * Si es válido, añade la información del usuario a req.user y continúa con la siguiente función.
 * Si es inválido o no está presente, responde con un código de estado correspondiente.
 */

 const autMiddleware = (req, res, next) => {
    //Obtiene el token desde el encabezado Authorization
    const  authHeader  = req.header('Authorization');

    if (!authHeader){
        return res.status(401).json({ message: "Acceso denegado. Token no proporcionado."});

    }

    try {
          // Extrae el token eliminando el prefijo 'Bearer ' si está presente
          const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

          // Verifica el token usando la clave secreta almacenada en las variables de entorno
          const decoded = jwt.verify(token, process.env.JWT_SECRET);

          //Guarda los datos del usuario autenticado en req.user para su uso en rutas protegidas
          req.user = decoded;

           // Continúa con la siguiente función en la cadena de middleware
        next();
    } catch (error) {
        //Responde con error si el token es invalido o ha expirado
        res.status(403).json({ message: "Token Inválido o expirado."});
    }
 };

 //Exporta el middleware para su uso en otras partes de la aplicación
 module.exports =  autMiddleware ;