// Carga las variables de entorno desde un archivo .env en process.env
require("dotenv").config();

// Importa la clase Pool desde el módulo 'pg' (node-postgres) para manejar conexiones a PostgreSQL
const { Pool } = require("pg");

// Configuración del Pool de conexión a la base de datos PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER, // Usuario de la base de datos, tomado de las variables de entorno
  host: process.env.DB_HOST, // Dirección del servidor de la base de datos
  database: process.env.DB_NAME, // Nombre de la base de datos a la que se conectará
  password: process.env.DB_PASS, // Contraseña del usuario de la base de datos
  port: process.env.DB_PORT, // Puerto en el que se ejecuta PostgreSQL (generalmente 5432)
  max: 10, // Número máximo de conexiones activas en el pool
  idleTimeoutMillis: 30000, // Tiempo (en milisegundos) antes de cerrar conexiones inactivas
  connectionTimeoutMillis: 2000, // Tiempo máximo (en milisegundos) de espera para establecer una conexión
});
 
// Función asíncrona para probar la conexión a la base de datos
const testDB = async () => {
  try {
    // Intenta obtener una conexión del pool
    const client = await pool.connect();
    console.log("✅ Conectado a PostgreSQL 🚀"); // Mensaje de éxito si la conexión es establecida
    client.release(); // Libera la conexión para que pueda ser reutilizada en el pool
  } catch (error) {
    // Captura cualquier error en la conexión y lo muestra en la consola
    console.error("❌ Error en la conexión a PostgreSQL:", error);
  }
};

// Llama a la función para probar la conexión
testDB();

// Exporta el pool de conexiones para que pueda ser utilizado en otros archivos del proyecto
module.exports = pool;
