const  express = require("express"); // Importa express
const { registerUser } = require("../controllers/controllersUsers"); // Importa el controlador para registrar usuarios
const { check } = require("express-validator"); // Importa express-validator para validar los datos del usuario

const router = express.Router(); // Crea un router de express

router.post(
    "/register", // Ruta para registrar un nuevo usuario
    [
        check("name", "El  nombre es obligatorio").not().isEmpty(), // El nombre no puede estar vacío
        check("email", "Agrega un email válido").isEmail(), // El email debe ser un email válido
        check("password", "La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial")
        .isLength({ min: 8 }) // Mínimo 8 caracteres
        .matches(/[A-Z]/) // Al menos una mayúscula
        .matches(/[\W]/), // Al menos un carácter especial
        check("provider").optional().isIn(["local", "google", "facebook"]), // Las tres maneras de iniciar sesión. Registrandose manual,  o  google o facebook
        check("role").isIn(["client", "barber"]).withMessage("Rol Inválido"), // El rol debe ser cliente o barbero
    ],
    registerUser// Controlador para registrar un nuevo usuario
);

module.exports = router; // Exporta el router para su uso en otros archivos