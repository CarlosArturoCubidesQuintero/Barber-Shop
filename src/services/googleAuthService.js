// Importa el cliente de autenticación de Google para verificar tokens de Google.
const { OAuth2Client } = require("google-auth-library");

// Importa el modelo de usuarios de tu aplicación, para interactuar con la base de datos de usuarios.
const User = require("../models/modelsUsers");

// Importa el modelo de tokens de tu aplicación, para manejar los tokens de actualización (refresh tokens).
const TokenModel = require("../models/modelsToken");

// Importa funciones que generan tokens JWT (access token y refresh token).
const { generateAccessToken, generateRefreshToken } = require("../utils/jwtUtils");

// Crea una instancia del cliente de Google OAuth2, usando la variable de entorno GOOGLE_CLIENT_ID.
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Función principal que maneja la autenticación con Google.
async function authenticateWithGoogle(idToken, role) {

    // Verifica la validez del idToken recibido desde el cliente.
    const ticket = await client.verifyIdToken({
        idToken, // El token enviado por el usuario.
        audience: process.env.GOOGLE_CLIENT_ID, // El ID de cliente de tu aplicación, para asegurar que el token sea para ti.
    });

    // Extrae la información del usuario contenida en el token verificado.
    const payload = ticket.getPayload();

    // Si no se pudo extraer el email, lanza un error (ya que es necesario para identificar al usuario).
    if (!payload?.email) throw new Error("No se obtuvo el email desde Google");

    // Busca en la base de datos si ya existe un usuario registrado con ese email.
    let user = await User.findByEmail(payload.email);

    // Si el usuario no existe, crea uno nuevo en la base de datos.
    if (!user) {
        user = await User.createUser(
            payload.name || payload.email.split("@")[0], // Usa el nombre de Google o el nombre basado en el email si no hay nombre.
            payload.email, // Email extraído del token.
            role,          // Rol proporcionado desde el frontend (por ejemplo, "client", "admin", "barber").
            "google"       // Método de registro (en este caso, "google").
        );
    }

    // Genera un token de acceso JWT para el usuario (válido por un corto periodo, por ejemplo, 15 minutos).
    const accessToken = generateAccessToken(user);

    // Genera un token de actualización JWT (para obtener nuevos access tokens cuando expiren).
    const refreshToken = generateRefreshToken(user);

    // Define la fecha de expiración del refresh token: 7 días a partir de ahora.
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Busca si ya existe un refresh token para este usuario en la base de datos.
    const existingToken = await TokenModel.findTokenByUserId(user.id);

    // Si ya existe un token, actualízalo con el nuevo refresh token y su nueva expiración.
    if (existingToken) {
        await TokenModel.updateToken(user.id, refreshToken, expiresAt.toISOString());
    } else {
        // Si no existe, guarda un nuevo token en la base de datos.
        await TokenModel.saveToken(user.id, refreshToken, expiresAt.toISOString());
    }

    // Retorna el usuario junto con su access token y refresh token al frontend.
    return { user, accessToken, refreshToken };
}

// Exporta la función para que pueda ser usada en otras partes de la aplicación, como en un controlador de rutas.
module.exports = { authenticateWithGoogle };
