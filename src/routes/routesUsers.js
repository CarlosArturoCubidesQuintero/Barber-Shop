const  express = require("express"); // Importa express
const { findUserById, updateUserById, deleteUserById } = require("../controllers/controllersUsers"); // Importa el controlador para registrar usuarios
const  authMiddleware = require("../middleware/middlewareToken");//Importando el middleware para proteger las rutas



const router = express.Router(); // Crea un router de express

router.get("/Id/usuarioid/:id", findUserById );
router.put("/Up/actualizar/:id", updateUserById );
router.delete('/Eli/eliminar/:id', deleteUserById  );

module.exports = router; // Exporta el router para su uso en otros archivos