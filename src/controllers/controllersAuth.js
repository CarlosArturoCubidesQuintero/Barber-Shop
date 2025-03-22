const { OAuth2Client } = require("google-auth-library"); // Importa el cliente de autenticación de Google
const jwt = require("jsonwebtoken"); // Importa JWT para generar tokens
const User = require("../models/modelsUsers"); // Importa el modelo de usuarios
require("dotenv").config(); // Carga variables de entorno

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Usa la variable de entorno

// ✅ Función para generar el JWT
const generateToken =(user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role }, // Datos del usuario en el token
        process.env.JWT_SECRET, // Clave secreta  desde la variable de entorno  
        {expiresIn: "5m"}//Expiración en horas
    );
};

const googleAuth = async (req, res) => {
    try {
        //console.log("Iniciando autenticación con Google...");

        const { authorization } = req.headers; // Extrae el token del header
        if (!authorization) {
            return res.status(401).json({ error: "Token no proporcionado" });
        }

        const token = req.body.idToken || (authorization && authorization.split(" ")[1]); // Extrae el token correctamente
        //console.log("Token recibido:", token);

        // ✅ Verificar el token con Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, // Usa la variable de entorno con ID de cliente google
        });

        const payload = ticket.getPayload(); // Extrae la información del usuario
        //console.log("Datos recibidos de Google:", payload);

        const { email, name = "Ususario" } = payload; // Si name es null, se asigna "Usuario"

        // ✅  Buscar si el usuario ya existe en la base de datos
        let user = await User.findByEmail(email);
        if (!user) {
            //console.log("Usuario no encontrado, creando nuevo...");
            const role = req.body.role || "client"; // Si no se proporciona un rol, se asigna "client"  
            user = await User.createUser(name, email, null, role,  "google");
        }

        // ✅ Generar token JWT
        const authToken = generateToken(user);
        
        //✅  Responder con el token y los datos del usuario
        res.json({message: "Autenticación exitosa", user, token: authToken});
    } catch (error) {
        //console.error("Error en autenticación con Google:", error);
        res.status(500).json({ error: "Error al autenticar con Google", details: error.message });
    }
};

module.exports = { googleAuth };
