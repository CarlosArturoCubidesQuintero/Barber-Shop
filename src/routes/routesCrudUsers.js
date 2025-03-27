const  express = require("express"); // Importa express
const { getUserId, updateUser, deleteUser } = require("../controllers/controllersCrudUsers"); // Importa el controlador para registrar usuarios
const  authMiddleware = require("../middleware/middlewareToken");//Importando el middleware para proteger las rutas

const router = express.Router(); // Crea un router de express

router.get("/Id/usuarioid/:id", authMiddleware,  getUserId);
router.put("/Up/actualizar/:id",authMiddleware,  updateUser);
router.delete('/Eli/eliminar/:id',authMiddleware, deleteUser);

module.exports = router; // Exporta el router para su uso en otros archivos