// Requiere el módulo express para crear la aplicación web.
const express = require('express');


//Requiriendo el modulo body-parser
const bodyParser = require('body-parser');

// Cargar variables del archivo .env
require('dotenv').config();


// Crea una instancia de la aplicación express.
const app = express();

// Requiere el módulo 'morgan', que permite registrar en la consola las peticiones HTTP recibidas.
const morgan = require('morgan');


//Importamos la conexion a PostgreSQL  
const pool = require('./src/config/firebaseConfig');


// Configura el middleware para analizar las solicitudes entrantes con formato JSON 
// y hacer que los datos del cuerpo estén disponibles en 'req.body'.
app.use(express.json());


// Requiere el módulo 'helmet' para mejorar la seguridad de la aplicación.
const helmet = require('helmet');

// Requiere el módulo 'cors' para permitir solicitudes de diferentes dominios (solucionando problemas de CORS).
const cors = require('cors'); // Se corrigió el error en la importación de 'cors'


// Usa el middleware 'morgan' en modo 'dev' para registrar las solicitudes HTTP en la consola.
// 'morgan' es un middleware de logging que ayuda a monitorear las peticiones al servidor.
app.use(morgan('dev'));  


//Usa el middleware 'helmet' para agregar cabeceras de seguridad HTTP
app.use(helmet());

//Configura las opciones de 'CORS' Aquí puedes permitir sólo ciertos dominios si es necesario.
const corsOptions = {
    origin: '*',  // Reemplaza con el dominio de tu app Flutter o '*' para permitir cualquier origen
    methods: ['GET', 'POST'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
}

// Usa el middleware 'cors' para permitir solicitudes desde otros dominios.
app.use(cors(corsOptions));


// Importa y usa las rutas definidas en 'users.js', permitiendo gestionar las rutas relacionadas con usuarios.
app.use(require('./src/routes/userRoutes'));


// Importar la configuración de Firebase desde 'firebaseConfig.js', obteniendo las instancias de 'admin' y 'db'.
// 'admin' se usa para la autenticación y administración de Firebase, mientras que 'db' representa la base de datos Firestore.
const { admin, db } = require('./src/config/firebaseConfig');



// Esto permite que los archivos dentro de la carpeta 'public' sean accesibles a través de la URL del servidor.
app.use(express.static(__dirname + "/public"));

// Exporta la aplicación para que pueda ser utilizada en otros módulos o archivos.
module.exports = app;
 