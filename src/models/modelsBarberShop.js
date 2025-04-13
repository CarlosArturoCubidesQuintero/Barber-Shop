const pool = require("../config/postgreSqlConfig");

const BarberShopModels = {
    /**
     * Crea una nueva barbería con su ubicación y la asocia a un barbero.
     * @param {string} name - Nombre de la barbería.
     * @param {string} direccion - Dirección de la barbería.
     * @param {string} photo_url - URL de la foto de la barbería.
     * @param {string} city - Ciudad donde se encuentra la barbería.
     * @param {string} locality - Localidad donde se encuentra la barbería.
     * @param {number} user_id - ID del usuario (barbero) que se asociará a esta barbería.
     * @returns {Promise<object>} - Retorna un objeto con los datos de la barbería creada.

     * Verifica si el usuario tiene el rol adecuado.
     * @param {number} user_id - ID del usuario
     * @returns {boolean} - true si el usuario tiene el rol adecuado, false en caso contrario
     */
    async hasProperRole(user_id) {
        const query = `SELECT role FROM users WHERE id = $1;`;// Consulta para obtener el rol del usuario
        const result = await pool.query(query, [user_id]);// Ejecutar la consulta
        
        
        // Si el rol es "barber", devolvemos true; si no, devolvemos false
         return result.rows.length > 0 ? result.rows[0].role : null;
    },


    /**
     * Verifica si el usuario ya tiene una barbería registrada.
     * @param {number} user_id - ID del usuario
     * @returns {boolean} - true si ya tiene una barbería registrada, false en caso contrario
     */
    async hasBarberShop(user_id) {
        const query = `SELECT 1 FROM barbers WHERE user_id = $1 LIMIT 1;`;// Consulta para verificar si el usuario ya tiene una barbería registrada
        const result = await pool.query(query, [user_id]);// Ejecutar la consulta
        return result.rows.length > 0;// Si hay filas, significa que el usuario ya tiene una barbería registrada
    },


    /**
     * Crea una nueva barbería y la asocia a un usuario en la base de datos.
     */
    async createBarberShop(name, direccion, photo_url, city, locality, user_id) {
        const client = await pool.connect();// Obtener un cliente de la conexión a la base de datos
        try {

            // 1️⃣ Verificar si la ciudad y localidad ya existen en la tabla locations
            let query = `SELECT id FROM locations WHERE city = $1 AND locality = $2`;
            let result = await client.query(query, [city, locality]);
            let location_id = result.rows.length > 0 ? result.rows[0].id : null;

            // 2️⃣ Si no existe la ubicación, la creamos
            if (!location_id) {
                query = `INSERT INTO locations (city, locality) VALUES ($1, $2) RETURNING id`;
                result = await client.query(query, [city, locality]);
                location_id = result.rows[0].id;
            }

            // 3️⃣ Insertamos la nueva barbería con su nombre, dirección, foto y la ubicación
            query = `INSERT INTO barber_shops (name, direccion, photo_url, location_id) VALUES ($1, $2, $3, $4) RETURNING id`;
            result = await client.query(query, [name, direccion, photo_url, location_id]);
            const barberShopId = result.rows[0].id;

            // 4️⃣ Asociamos al usuario como barbero de esta barbería
            query = `INSERT INTO barbers (user_id, barber_shop_id) VALUES ($1, $2)`;
            await client.query(query, [user_id, barberShopId]);

            await client.query("COMMIT"); // Confirmamos la transacción
            return { id: barberShopId, name, direccion, photo_url, location_id };
        } catch (error) {
            await client.query("ROLLBACK"); // Revertimos cambios si hubo un error
            throw error;
        } finally {
            client.release(); // Liberamos la conexión
        }
    },


     

    /**
     * Obtiene todas las barberías con su información de ubicación.
     * @returns {Promise<Array>} - Retorna una lista de barberías.
     */
    async getAllBarberShop() {
        const query = `
        SELECT bs.*, l.city, l.locality
        FROM barber_shops bs
        JOIN locations l ON bs.location_id = l.id;`;
        const result = await pool.query(query);
        return result.rows;
    },

    /**
     * Obtiene una barbería por su ID, incluyendo su ubicación y barberos asociados.
     * @param {number} id - ID de la barbería.
     * @returns {Promise<object|null>} - Retorna un objeto con los datos de la barbería o null si no existe.
     */
    async getBarberShopById(id) {
        const query = `
        SELECT bs.*, l.city, l.locality,
               json_agg(json_build_object('id', b.id, 'user_id', b.user_id)) AS barbers
        FROM barber_shops bs
        JOIN locations l ON bs.location_id = l.id
        LEFT JOIN barbers b ON bs.id = b.barber_shop_id
        WHERE bs.id = $1
        GROUP BY bs.id, l.city, l.locality;`;
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    },

    /**
     * Actualiza los campos de una barbería según los datos proporcionados.
     * @param {number} id - ID de la barbería a actualizar.
     * @param {object} updates - Objeto con los campos a actualizar (name, direccion, photo_url...).
     * @returns {Promise<object|null>} - Retorna la barbería actualizada o null si no se encuentra.
     */
    async updateBarberShop(id, updates) {
        const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`);
        const values = Object.values(updates);
        values.push(id);

        const query = `UPDATE barber_shops SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *;`;
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    },

    /**
     * Elimina una barbería por su ID.
     * @param {number} id - ID de la barbería a eliminar.
     * @returns {Promise<boolean>} - Retorna true si se eliminó correctamente.
     */
    async deleteBarberShop(id) {
        const query = `DELETE FROM barber_shops WHERE id = $1;`;
        await pool.query(query, [id]);
        return true;
    }
};

module.exports = BarberShopModels;
