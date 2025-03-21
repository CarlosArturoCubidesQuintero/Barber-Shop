// Requiere el módulo Express para crear la aplicación web.
const express = require('express');

// Requiere el módulo fs (File System) de Node.js para leer archivos en el sistema.
const fs = require('fs');

// Requiere el módulo path para manejar y resolver rutas de archivos y directorios.
const path = require('path');

// Requiere el módulo body-parser para analizar el cuerpo de las solicitudes HTTP.
const bodyParser = require('body-parser');

// Carga las variables de entorno desde un archivo .env.
require('dotenv').config();

// Crea una instancia de la aplicación Express.
const app = express();

// Requiere el módulo 'morgan', que permite registrar en la consola las peticiones HTTP recibidas.
const morgan = require('morgan');

// Importa la conexión a (MongoDB si es el caso).
const pool = require('./src/config/firebaseConfig');

// Configura el middleware para analizar las solicitudes entrantes con formato JSON 
// y hacer que los datos del cuerpo estén disponibles en 'req.body'.
app.use(express.json());

// Requiere el módulo 'helmet' para mejorar la seguridad de la aplicación, agregando encabezados HTTP seguros.
const helmet = require('helmet');

// Requiere el módulo 'cors' para permitir solicitudes desde diferentes dominios, solucionando problemas de CORS.
const cors = require('cors'); // Se corrigió el error en la importación de 'cors'

// Usa el middleware 'morgan' en modo 'dev' para registrar las solicitudes HTTP en la consola.
// 'morgan' ayuda a monitorear las peticiones y depurar el servidor.
app.use(morgan('dev'));

// Usa el middleware 'helmet' para agregar cabeceras de seguridad HTTP y proteger contra ataques comunes.
app.use(helmet());

// Configura las opciones de CORS para definir qué dominios pueden acceder a la API.
const corsOptions = {
    origin: '*',  // Permite solicitudes desde cualquier origen (cambiar si se necesita restringir).
    methods: ['GET', 'POST'], // Métodos HTTP permitidos.
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos en las solicitudes.
};

// Usa el middleware 'cors' con las opciones configuradas para permitir solicitudes desde otros dominios.
app.use(cors(corsOptions));


// 📂 Cargar automáticamente todas las rutas dentro de la carpeta 'src/routes'.
const routesPath = path.join(__dirname, './src/routes');

// Lee todos los archivos dentro de la carpeta 'routes' y los carga automáticamente.
fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith('.js')) { // Verifica que el archivo tenga extensión .js.
        try {
            const route = require(path.join(routesPath, file)); // Importa la ruta.
            app.use(route); // Registra la ruta en Express.
            console.log(`✔ Ruta cargada: ${file}`); // Muestra en consola qué ruta fue cargada.
        } catch (error) {
            console.error(`❌ Error al cargar la ruta ${file}:`, error); // Muestra errores en caso de fallo.
        }
    }
});


// 📂 Sirve archivos estáticos desde la carpeta 'public', haciéndolos accesibles a través de la URL del servidor.
//app.use(express.static(path.join(__dirname, 'public')));

// Exporta la aplicación para que pueda ser utilizada en otros módulos o archivos.
module.exports = app;
