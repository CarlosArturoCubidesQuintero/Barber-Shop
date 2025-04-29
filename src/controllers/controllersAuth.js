const { authenticateWithGoogle } = require("../services/googleAuthService"); // Importa la función de autenticación de Google

const googleAuth = async (req, res) => {
    try {
        const { idToken, role } = req.body; // Desestructura el idToken y el rol del cuerpo de la solicitud
        const { user, accessToken, refreshToken } = await authenticateWithGoogle(idToken, role); // Llama a la función de autenticación de Google
        res.json({ message: "Autenticación exitosa", user, accessToken, refreshToken }); // Responde con un mensaje de éxito y los datos del usuario
    } catch (error) {
        res.status(500).json({ menssage: "Error en la autenticación con google", details: error.message }); // Maneja errores y responde con un mensaje de error
    }
}

module.exports = { googleAuth }; // Exporta la función googleAuth para su uso en otros archivos