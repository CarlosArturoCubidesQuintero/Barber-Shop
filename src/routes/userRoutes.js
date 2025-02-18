// Importa la función 'Router' del módulo 'express' para crear un enrutador.
const { Router } = require('express');
//Importando el controlador
const { registerUser } = require('../controllers/authControllers')
//Importando el cntrolador de loginUser
const { loginUser } = require('../controllers/loginControllers');
// Crea una instancia de 'Router', que permitirá definir rutas de la aplicación.
const router = Router();

//Mi ruta del registro de usuarios
router.post('/api/users', registerUser);

//Ruta para el Inicio de Sesion
router.post('/api/login', loginUser);



// Exporta el enrutador para que pueda ser utilizado en otros archivos del proyecto.
module.exports = router;