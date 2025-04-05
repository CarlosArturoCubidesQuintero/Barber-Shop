const pool = require("../config/postgreSqlConfig");


const BarberShopModels = {
    /**
     * Verifica si el usuario tiene el rol adecuado.
     * @param {number} user_id - ID del usuario
     * @returns {boolean} - true si el usuario tiene el rol adecuado, false en caso contrario
     */
    async hasProperRole(user_id) {
        const query = `SELECT role FROM users WHERE id = $1;`;
        const result = await pool.query(query, [user_id]);

        // Si el usuario existe, devolvemos el rol; si no, devolvemos null
        return result.rows.length > 0 ? result.rows[0].role : null;
    },

    /**
     * Verifica si el usuario ya tiene una barbería registrada.
     * @param {number} user_id - ID del usuario
     * @returns {boolean} - true si ya tiene una barbería registrada, false en caso contrario
     */
    async hasBarberShop(user_id) {
        const query = `SELECT 1 FROM barbers WHERE user_id = $1 LIMIT 1;`;
        const result = await pool.query(query, [user_id]);
        return result.rows.length > 0;
    },

    /**
     * Crea una nueva barbería y la asocia a un usuario en la base de datos.
     */
    async createBarberShop(name, direccion, photo_url, city, locality, user_id) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // Verificar si el usuario tiene el rol adecuado
            if (!(await this.hasProperRole(user_id))) {
                throw new Error("El usuario no tiene el rol adecuado para registrar una barbería.");
            }

            // Verificar si el usuario ya tiene una barbería registrada
            if (await this.hasBarberShop(user_id)) {
                throw new Error("El usuario ya tiene una barbería registrada.");
            }

            let query = `SELECT id FROM locations WHERE city = $1 AND locality = $2`;
            let result = await client.query(query, [city, locality]);

            let location_id = result.rows.length > 0 ? result.rows[0].id : null;

            if (!location_id) {
                query = `INSERT INTO locations (city, locality) VALUES ($1, $2) RETURNING id`;
                result = await client.query(query, [city, locality]);
                location_id = result.rows[0].id;
            }

            query = `INSERT INTO barber_shops (name, direccion, photo_url, location_id) 
                     VALUES ($1, $2, $3, $4) RETURNING id`;
            result = await client.query(query, [name, direccion, photo_url, location_id]);
            const barberShopId = result.rows[0].id;

            query = `INSERT INTO barbers (user_id, barber_shop_id) VALUES ($1, $2)`;
            await client.query(query, [user_id, barberShopId]);

            await client.query("COMMIT");
            return { id: barberShopId, name, direccion, photo_url, location_id };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    },
    /**
     * Obtiene todas las barberías registradas en la base de datos junto con su ciudad y localidad.
     * 
     * @returns {Array} - Lista de barberías
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
     * Obtiene una barbería específica por su ID, incluyendo información sobre sus barberos asociados.
     * 
     * @param {number} id - ID de la barbería
     * @returns {Object|null} - Datos de la barbería o null si no existe
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
     * Actualiza la información de una barbería en la base de datos.
     * 
     * @param {number} id - ID de la barbería a actualizar
     * @param {Object} updates - Campos a actualizar
     * @returns {Object|null} - Barbería actualizada o null si no existe
     */
    async updateBarberShop(id, updates) {
        // Convertir el ID a un número entero
        const barberShopId = Number(id);
        if (!Number.isInteger(barberShopId) || barberShopId <= 0) {
            throw new Error("ID inválido");
        }
    
        // Extraer city y locality del objeto de actualización
        const { city, locality, ...barberShopUpdates } = updates;
        let updatedBarberShop = null;
    
        // 1️⃣ Actualizar `barber_shops` si hay datos para actualizar
        if (Object.keys(barberShopUpdates).length > 0) {
            const fields = Object.keys(barberShopUpdates).map((key, index) => `${key} = $${index + 1}`);
            const values = Object.values(barberShopUpdates);
            values.push(barberShopId);
    
            const query = `UPDATE barber_shops SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *;`;
            const result = await pool.query(query, values);
            updatedBarberShop = result.rows[0] || null;
        }
    
        // 2️⃣ Actualizar `locations` si hay city/locality
        if (city || locality) {
            const locationFields = [];
            const locationValues = [];
    
            if (city) {
                locationFields.push("city = $1");
                locationValues.push(city);
            }
            if (locality) {
                locationFields.push(`locality = $${locationValues.length + 1}`);
                locationValues.push(locality);
            }
            locationValues.push(barberShopId);
    
            const locationQuery = `
                UPDATE locations 
                SET ${locationFields.join(', ')}, updated_at = NOW()
                WHERE id = (SELECT location_id FROM barber_shops WHERE id = $${locationValues.length})
                RETURNING *;
            `;
    
            await pool.query(locationQuery, locationValues);
        }
    
        return updatedBarberShop;
    },
    

    /**
     * Elimina una barbería de la base de datos por su ID.
     * 
     * @param {number} id - ID de la barbería a eliminar
     * @returns {boolean} - true si la barbería fue eliminada correctamente
     */
    async deleteBarberShop(id) {
        const query = `DELETE FROM barber_shops WHERE id = $1;`;
        await pool.query(query, [id]);
        return true;
    }
};

module.exports = BarberShopModels;
