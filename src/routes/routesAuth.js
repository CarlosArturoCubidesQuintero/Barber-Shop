const express = require("express"); // Importa express
const router = express.Router(); // Crea un router de express
const { googleAuth } = require("../controllers/controllersAuth"); // Importa el controlador para autenticación con Google
const validateGoogleAuthInput = require("../middleware/validateGoogleAuthInput"); // Importa el middleware de validación de entrada para autenticación con Google


router.post("/auth/google", validateGoogleAuthInput, googleAuth); // Ruta para autenticación con Google


module.exports = router; // Exporta el router para su uso en otros archivos