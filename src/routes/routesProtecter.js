const express = require("express"); // Importa express
const router = express.Router(); // Crea un router de express
const { protectedRoute } =  require("../controllers/controllersProtecter"); // Importa el controlador para rutas protegidas
const authMiddleware = require("../middleware/middlewareToken"); // Importa el middleware de autenticación


//Ruta Protegida que requiere autenticación 
router.get("/ruta-protegida", authMiddleware, protectedRoute);


module.exports = router; // Exporta el router para su uso en otros archivos