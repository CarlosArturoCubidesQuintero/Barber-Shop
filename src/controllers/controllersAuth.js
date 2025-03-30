    const { OAuth2Client } = require("google-auth-library"); // Importa el cliente de autenticación de Google
    const User = require("../models/modelsUsers"); // Importa el modelo de usuarios
    const { generateAccessToken,generateRefreshToken} = require("../utils/jwtUtils"); // Importa funciones de utilidad para JWT
    const TokenModel = require("../models/modelsToken");
    require("dotenv").config(); // Carga variables de entorno


    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);//Configuración del cliente Google 


    // ✅ Autenticación con Google
    const googleAuth = async (req, res) => {
        try {
            //console.log("Iniciando autenticación con Google...");

            const { authorization } = req.headers; // Extrae el token del header
            if (!authorization) {
                return res.status(401).json({ error: "Token no proporcionado" });
            }

            const token = req.body.idToken || authorization.split(" ")[1]; // Extrae el token de Google
            //console.log("Token recibido:", token);

            // ✅ Verificar el token con Google
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID, // Usa la variable de entorno con ID de cliente google
            });

            const payload = ticket.getPayload(); // Extrae la información del usuario
            //console.log("Datos recibidos de Google:", payload);
            const  { email } = payload; // Extrae el email del usuario
            let name = payload.name;
            if(!name){
                name = email.split("@")[0]; // Si no hay nombre, usa el email
            }

            //✅ Verifica si el usuario proporciono un rol antes de registrarlo
            const role = req.body.role;
            if (!role){
                return res.status(400).json({error: "Debe seleccionar un rol antes de continuar"});
            }


        
            // ✅  Buscar si el usuario ya existe en la base de datos
            let user = await User.findByEmail(email);
            //console.log("Usuario encontrado", user);
            if (!user) {
                //console.log("Usuario no encontrado, creando nuevo...");
                const role = req.body.role || "client"; // Si no se proporciona un rol, se asigna "client"  
                user = await User.createUser(name, email,  role,  "google");
                //console.log("Usuarios Creado: ", user);
            }

            // ✅ Generar Access Token y Refresh Token
            const accessToken  = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

        
            // ✅ Guardar el Refresh Token en la base de datos
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7); // Expira en 7 días
            // ✅ Verificar si el usuario ya tiene un refresh token
            const existingToken = await TokenModel.findTokenByUserId(user.id);
            if (existingToken) {
                // Si ya tiene un token, actualizarlo
                await TokenModel.updateToken(user.id, refreshToken, expiresAt.toISOString());
            } else {
                // Si no tiene un token, guardarlo por primera vez
                await TokenModel.saveToken(user.id, refreshToken, expiresAt.toISOString());
            }// Guarda el token en la base de datos
        

            // ✅  Responder con el token y los datos del usuario
            res.json({
                message: "Autenticación exitosa",
                user,
                accessToken,
                refreshToken 
            });
            
        
        } catch (error) {
            res.status(500).json({ error: "Error al autenticar con Google", datails: error.message });
        }
    };

    module.exports = { googleAuth }; // Exporta el controlador para su uso en otros archivos
