const express = require("express"); // Importa express
const router = express.Router(); // Crea un router de express
const { refreshToken, logout} = require("../controllers/controllersToken"); // Importa el controlador para autenticación con Google

router.post("/Token/refresh-token", refreshToken); // Ruta para refrescar el token
router.post("/Token/logout", logout); // Ruta para cerrar sesión
module.exports = router; // Exporta el router para su uso en otros archivos