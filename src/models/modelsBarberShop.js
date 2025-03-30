const pool = require("../config/postgreSqlConfig");

const BarberShopModels = {
    async createBarberShop(name, direccion, photo_url, city, locality, user_id) {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");

            // 1️⃣ Verificar si la ciudad/localidad ya existen
            let query = `SELECT id FROM locations WHERE city = $1 AND locality = $2`;
            let result = await client.query(query, [city, locality]);

            let location_id = result.rows.length > 0 ? result.rows[0].id : null;

            // 2️⃣ Si no existe, la creamos
            if (!location_id) {
                query = `INSERT INTO locations (city, locality) VALUES ($1, $2) RETURNING id`;
                result = await client.query(query, [city, locality]);
                location_id = result.rows[0].id;
            }

            // 3️⃣ Crear la barbería
            query = `INSERT INTO barber_shops (name, direccion, photo_url, location_id) VALUES ($1, $2, $3, $4) RETURNING id`;
            result = await client.query(query, [name, direccion, photo_url, location_id]);

            const barberShopId = result.rows[0].id;

            // 4️⃣ Asociar el usuario a la barbería en la tabla barbers
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

    async getAllBarberShop() {
        const query = `
        SELECT bs.*, l.city, l.locality
        FROM barber_shops bs
        JOIN locations l ON bs.location_id = l.id;`;
        const result = await pool.query(query);
        return result.rows;
    },

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

    async updateBarberShop(id, updates) {
        const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`);
        const values = Object.values(updates);
        values.push(id);

        const query = `UPDATE barber_shops SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *;`;
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    },

    async deleteBarberShop(id) {
        const query = `DELETE FROM barber_shops WHERE id = $1;`;
        await pool.query(query, [id]);
        return true;
    }
};

module.exports = BarberShopModels;
