const express = require("express"); // Importa express
const router = express.Router(); // Crea un router de express
const { googleAuth } = require("../controllers/controllersAuth"); // Importa el controlador para autenticación con Google


router.post("/auth/google", googleAuth); // Ruta para autenticación con Google


module.exports = router; // Exporta el router para su uso en otros archivos