// Importa la función 'Router' del módulo 'express' para crear un enrutador.+
const { Router } = require  ('express');
//Importando el controlador
const { rutaProtegida } =  require ('../controllers/rutaProteControllers');

// Importamos el middleware
const authMiddleware = require('../middleware/authMiddleware');  

//Crear una instancia de 'Router', que permitirá definir rutas de la aplicación.
const route = Router();


route.get('/api/rutaProtegida', authMiddleware, rutaProtegida);


//Exporta el enrutador para que pueda ser utilizado en otros archivos
module.exports = route ;// ✅ Exportación correcta