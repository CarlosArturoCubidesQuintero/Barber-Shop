const admin = require("firebase-admin");
const dotenv = require("dotenv");

// Cargar variables del archivo .env
dotenv.config();

//La configuracion de las credenciales para conectarme a firebase de hizo por medio de la variable de entorno env
//Tu clave privada brinda acceso a los servicios de Firebase de tu proyecto. Mantenla en confidencialidad y nunca la almacenes en un repositorio público.
//Cadena de conexion de mi base de datos 
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL // Aquí se usa la variable de entorno
});

// Objeto para interactuar con mi coexion
const db = admin.firestore();

console.log("🔥 Conectando a Firebase con la URL:", process.env.FIREBASE_DATABASE_URL); // Agregar para verificar

module.exports = { db };
