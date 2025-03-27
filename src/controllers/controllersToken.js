const User  = require("../models/modelsUsers"); // Importa el modelo de usuarios
const { 
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require("../utils/jwtUtils"); // Importa funciones de utilidad para JWT

const TokenModel = require("../models/modelsToken");

// ✅ Endpoint para renovar Access Token usando Refresh Token
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body; // Extrae el Refresh Token del cuerpo
        if (!refreshToken){
            return res.status(401).json({ error: "Refresh Tooken requerido"});
        }

         // ✅ Verificar si el token aún existe en la base de datos
         const existingToken = await TokenModel.findToken(refreshToken);
         if (!existingToken){
            return res.status(403).json({error: "Refresh Token Inválido o no autorizado"})
         }

        // ✅ Verificar el Refresh Token con JWT
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (error) {
            return res.status(401).json({ error: "Refresh Token Expirado. Debe iniciar sesión nuevamente" });
        }

        // ✅ Buscar al usuario en la base de datos
        const user = await User.findUserById(decoded.id);
        if (!user){
            return res.status(401).json({ error: "Usuario  no encontrado"});
        }

        // ✅ Generar nuevo Access Token y  refres Token
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        

        // ✅ Actualizar el Refresh Token en la base de datos
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días

        await TokenModel.updateToken(user.id, newRefreshToken, expiresAt.toISOString());

        // ✅ Responder con los nuevos tokens
       res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
       });

    } catch (error) {
        res.status(500).json({ error: "Error al renovar Access Token", details: error.message });
    }
}

const  logout  = async (req, res) => {
    try {
        const  { refreshToken } = req.body;//Obtener el refreshToken desde el cuerpo de la solicitud 
        
        if (!refreshToken){
            return  res.status(401).json({ error: "Refresh Token Requqerido"});
        }

        // ✅ Verificar si el token existe en la base de datos
        const existingToken = await TokenModel.findToken(refreshToken);
        if(!existingToken){
            return res.json({error: "Refresh Token no encontrado"});

        }

         // ✅ Eliminar el refreshToken de la base de datos
         await TokenModel.deleteToken(refreshToken);

         return res.status(200).json({ message: "Sesión cerrada exitosamente"});

    } catch (error) {
        console.error("Error al cerrar sesión", error);
        return res.status(500).json({ error: "Error interno del servidor"});
    }
}

module.exports = { refreshToken, logout }; // Exporta el controlador para su uso en otros archivos