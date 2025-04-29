const pool = require("../config/postgreSqlConfig");// Importa la configuración de PostgreSQL


// Normalización igual a la del controller para evitar duplicados
const normalizeText = (text) => {
    return text
        .normalize('NFD') // Normaliza el texto para separar caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Elimina los acentos
        .trim()// Elimina espacios en blanco al inicio y al final
        .toLowerCase()// Convierte a minúsculas
        .replace(/\s+/g, ' ')// Reemplaza múltiples espacios por uno solo
        .split(' ')// Divide el texto en palabras
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))// Capitaliza la primera letra de cada palabra
        .join(' ');// Une las palabras nuevamente con un espacio
};

class locationServices {
    // Método estático que obtiene una ubicación si ya existe, o la crea si no existe.
    static async getOrCreateLocation(city, locality) {
        // Se establece una conexión con la base de datos utilizando el pool de conexiones.
        const client = await pool.connect();

        try {

            // Buscamos si existe la ciudad y localidad
            let query = `SELECT id FROM locations WHERE city = $1 AND locality = $2`;

            // Se normalizan los valores de 'city' y 'locality' para asegurar que se comparen correctamente.
            let result = await client.query(query, [city, locality]);

            // Se obtiene el ID de la ubicación, si existe. Si no, se asigna 'undefined'.
            let location_id = result.rows[0]?.id;


            // se procede a crear una nueva entrada en la base de datos.
            if (!location_id) {
                // Se prepara la consulta SQL para insertar la nueva ubicación.
                query = `INSERT INTO locations (city, locality) VALUES ($1, $2) RETURNING id`;

                // Se ejecuta la consulta para insertar la nueva ubicación y se obtiene el ID generado.
                result = await client.query(query, [city, locality]);

                // Se asigna el ID recién creado a la variable 'location_id'.
                location_id = result.rows[0].id;
            }

            // Se devuelve el ID de la ubicación (ya sea existente o recién creada).
            return location_id;
        } catch (error) {
            // Si ocurre un error durante el proceso, se captura y se muestra en la consola.
            console.error("Error al obtener o crear la ubicación:", error);
            // Se lanza un error personalizado para que el código que llama este método pueda manejarlo.
            throw new Error("Error al obtener o crear la ubicación");
        } finally {
            // Independientemente de que ocurra un error o no, se libera el cliente de la conexión.
            if (client) {
                client.release();
            }
        }
    }
}

module.exports = {
    normalizeText,
    locationServices
};
