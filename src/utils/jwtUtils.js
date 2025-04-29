const jwt = require("jsonwebtoken"); // Importa JWT para la verificación de tokens
require('dotenv').config(); // Carga variables de entorno

const generateAccessToken = (user) => {// ✅ Función para generar el Access Token
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role }, // Datos del usuario en el token
        process.env.JWT_SECRET, // Clave secreta desde la variable de entorno
        { expiresIn: "1m" }  // 🔥 Access Token expira en 1 min
    );

};


const generateRefreshToken = (user) => {// ✅ Función para generar el Refresh Token
    return jwt.sign(
        { id: user.id }, // Datos del usuario en el token
        process.env.REFRESH_SECRET, // Clave secreta desde la variable de entorno
        { expiresIn: "5m" } // 🔥 Refresh Token expira en 5 min
    );
};

const verifyAccessToken = (token) => {// ✅ Función para verificar el Access Token
    return jwt.verify(token, process.env.JWT_SECRET);

};

const verifyRefreshToken = (token) => {// ✅ Función para verificar el Refresh Token
    return jwt.verify(token, process.env.REFRESH_SECRET);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
}