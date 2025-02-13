// Importa la función 'Router' del módulo 'express' para crear un enrutador.
const { Router } = require('express');
//Importando el controlador
const { registerUser } = require('../controllers/userControllers')
// Crea una instancia de 'Router', que permitirá definir rutas de la aplicación.
const router = Router();

//Mi ruta del registro de usuarios
router.post('/api/users', registerUser);



// Exporta el enrutador para que pueda ser utilizado en otros archivos del proyecto.
module.exports = router;
