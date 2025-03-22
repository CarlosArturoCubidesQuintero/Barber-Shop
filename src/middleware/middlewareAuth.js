const jwt = require("jsonwebtoken"); // Importa JWT para la verificación de tokens
require("dotenv").config(); // Carga variables de entorno

// ✅ Middleware para autenticar usuarios
const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization"); // Extrae el token del header


    if (!token){
        return res.status(401).json({error: "Acceso denegado. Token no proporcionado"});

    }

    try {
        //Verificar el token  (Extraemos la parte después de Bearer)
        const decoded =  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = decoded; //Guardamos la info del usuario en req.user
        next(); //Continuar con la siguiente función
    } catch (error) {
        res.status(401).json({error: "Token inválido", details: error.message});
    }
};

module.exports = authMiddleware; // Exporta el middleware para su uso en otros archivos
