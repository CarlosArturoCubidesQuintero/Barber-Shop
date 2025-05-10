const pool = require("../config/postgreSqlConfig");// Importa la configuración de PostgreSQL
const { locationServices, normalizeText } = require("../services/locationServices");// Importa la función de normalización de texto

const BarberShopModels = {
    /**
     * Verifica si el usuario tiene el rol adecuado.
     * @param {number} user_id - ID del usuario.
     * @returns {Promise<string|null>} - Retorna el rol del usuario o null si no existe.
     */
    async hasProperRole(user_id) {
        const query = `SELECT role FROM users WHERE id = $1`;
        const { rows } = await pool.query(query, [user_id]);
        return rows[0]?.role || null;
    },

    /**
     * Verifica si el usuario ya tiene una barbería registrada.
     * @param {number} user_id - ID del usuario.
     * @returns {Promise<boolean>} - True si ya tiene una barbería, false en caso contrario.
     */
    async hasBarberShop(user_id) {
        const query = `SELECT 1 FROM barbers WHERE user_id = $1 LIMIT 1`;
        const result = await pool.query(query, [user_id]);
        return result.rows.length > 0;
    },

    /**
     * Verifica si ya existe una barbería con un nombre específico.
     * @param {string} name - Nombre de la barbería.
     * @returns {Promise<boolean>} - True si existe, false si no.
     */
    async hasBarberShopByName(name) {
        const normalizedName = normalizeText(name); // Aplica normalización dentro del modelo también

        const query = `SELECT 1 FROM barber_shops WHERE name = $1 LIMIT 1`;
        const result = await pool.query(query, [normalizedName]);
        return result.rows.length > 0;
    },

    /**
  * Crea una nueva barbería, asegurando que la ubicación ya exista o se cree si no existe,
  * y asocia la barbería tanto al administrador como barbero.
  *
  * @param {string} name - Nombre de la barbería.
  * @param {string} direccion - Dirección física de la barbería.
  * @param {string} photo_url - URL de la imagen representativa de la barbería.
  * @param {string} city - Ciudad donde está ubicada la barbería.
  * @param {string} locality - Localidad o zona específica dentro de la ciudad.
  * @param {number} user_id - ID del usuario administrador que crea la barbería.
  * @returns {Promise<object>} - Devuelve los datos de la barbería creada.
  */
    async createBarberShop(name, direccion, photo_url, city, locality, user_id) {
        const client = await pool.connect(); // Establece conexión con la base de datos
        try {
            await client.query("BEGIN"); // Inicia la transacción

            const normalizedName = normalizeText(name); // Normaliza el nombre
            const location_id = await locationServices.getOrCreateLocation(city, locality); // Obtiene o crea la ubicación

            // Inserta la barbería
            const insertBarberShopQuery = `
            INSERT INTO barber_shops (name, direccion,  location_id, admin_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
            const result = await client.query(insertBarberShopQuery, [normalizedName, direccion, location_id, user_id]);
            const barberShopId = result.rows[0].id; // ID de la barbería creada

            //Insertar la foto de la barbería
            const insertPhotoQuery = `
            INSERT INTO barber_photos (barber_shop_id, photo_url)
            VALUES ($1, $2)
            RETURNING id
            `;
            const photoRes = await client.query(insertPhotoQuery, [barberShopId, photo_url]);
            const photoId = photoRes.rows[0].id; // ID de la foto de la barbería creada

            //  Actualizar barber_shops con el main_photo_id
            const updateMainPhotoQuery = `
            UPDATE barber_shops
            SET main_photo_id = $1
            WHERE id = $2
            `;
            await client.query(updateMainPhotoQuery, [photoId, barberShopId]);

            // Inserta al administrador como barbero
            const insertBarberQuery = `
            INSERT INTO barbers (user_id, barber_shop_id)
            VALUES ($1, $2)
        `;
            await client.query(insertBarberQuery, [user_id, barberShopId]);

            await client.query("COMMIT"); // Finaliza la transacción

            return {
                id: barberShopId,
                name: normalizedName,
                direccion,
                photo_url,
                location_id,
                main_photo_id: photoId,
            };
        } catch (error) {
            await client.query("ROLLBACK"); // Revierte la transacción si ocurre error
            throw error;
        } finally {
            client.release(); // Libera la conexión
        }
    },

    /**
     * Obtiene todas las barberías junto con su ciudad y localidad. junto con los barberos asociados.
     * @returns {Promise<Array>} - Lista de barberías cons sus barberos.
     */
    async getAllBarberShop() {
        const query = `
            SELECT 
                bs.*, 
                l.city, 
                l.locality,
    
                -- Foto principal
                jsonb_build_object(
                    'id', bp.id,
                    'photo_url', bp.photo_url
                ) AS main_photo,
    
                -- Barberos como JSON
                COALESCE(json_agg(
                    DISTINCT jsonb_build_object(
                        'id', b.id,
                        'user_id', b.user_id
                    )
                ) FILTER (WHERE b.id IS NOT NULL), '[]') AS barbers
    
            FROM barber_shops bs
            JOIN locations l ON bs.location_id = l.id
            LEFT JOIN barbers b ON bs.id = b.barber_shop_id
            LEFT JOIN barber_photos bp ON bs.main_photo_id = bp.id
    
            GROUP BY bs.id, l.city, l.locality, bp.id
        `;

        const result = await pool.query(query);
        return result.rows;
    },


    /**
     * Nos devuelve los barberos que aún no tienen perfil en la tabla barbers
     */
    async getBarbersWithoutProfile() {
        try {
            const query = `
             SELECT u.id, u.name, u.email
             FROM users u
             LEFT JOIN barbers b ON u.id = b.user_id
             WHERE u.role = 'barber' AND b.id IS NULL;
             `;
            const result = await pool.query(query);
            return result.rows; // Devuelve los barberos sin perfil
        } catch (error) {
            console.error('Error en getBarbersWithoutProfile:', error);
            throw error; // Lanza el error para que lo maneje el controlador
        }
    },



    /**
     * Asigna un barbero a una barbería.
     * @param {number} user_id
     * @param {number} barber_shop_id
     * @returns {Promise<object>} - Resultado de la inserción.
     */
    async assignBarberToShop(user_id, barber_shop_id) {
        const query = `INSERT INTO barbers (user_id, barber_shop_id) VALUES ($1, $2) RETURNING id`;
        const result = await pool.query(query, [user_id, barber_shop_id]);
        return {
            insertedId: result.rows[0].id,
            user_id,
            barber_shop_id,
        };
    },

    /**
     * Actualiza los datos de una barbería existente si el admin es el creador.
     * Puede actualizar campos de 'barber_shops' y, si se incluyen, actualiza la 'location_id' en base a city y locality.
     * 
     * @param {number} id - ID de la barbería que se desea actualizar.
     * @param {object} updates - Objeto con los campos a actualizar. Puede incluir 'city' y 'locality'.
     * @param {number} adminId - ID del administrador que solicita la actualización.
     * @returns {Promise<object|null>} - Retorna la barbería actualizada o null si no tiene permisos o no existe.
     */
    async updateBarberShop(id, updates, adminId) {
        const client = await pool.connect(); // Obtiene una conexión del pool

        try {
            await client.query('BEGIN'); // Inicia una transacción

            // Paso 1: Verificar que el admin que solicita el cambio sea el creador de la barbería
            const authCheck = await client.query(
                'SELECT admin_id, location_id FROM barber_shops WHERE id = $1',
                [id]
            );

            if (authCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return null;// Barbería no existe
            }

            const { admin_id, location_id } = authCheck.rows[0];

            if (admin_id !== adminId) {
                await client.query('ROLLBACK');
                return null;// No tiene permisos para actualizar
            }

            //👉 Filtrar campos vacíos o inválidos en updates
            const validUpdates = {};
            for (const [key, value] of Object.entries(updates)) {
                if (value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '')) {
                    validUpdates[key] = value;
                }
            }

            //👉 Normaliza los campos válidos antes de cualquier uso
            if (validUpdates.city) {
                validUpdates.city = normalizeText(validUpdates.city);
            }
            if (validUpdates.locality) {
                validUpdates.locality = normalizeText(validUpdates.locality);
            }
            if (validUpdates.name) {
                validUpdates.name = normalizeText(validUpdates.name);
            }

            //Paso 2: Verificar si city y locality fueron proporcionados
            if (validUpdates.city || validUpdates.locality) {
                //Si proporcionaron city y localidad, obtenemos o creamos la ubicación
                const location_id = await locationServices.getOrCreateLocation(
                    validUpdates.city,
                    validUpdates.locality
                );

                // Actualizamos la barbería para que apunte a la nueva ubicación
                validUpdates.location_id = location_id; // Actualiza el ID de la ubicación en barber_shops

                //Eliminamos city y locality del objeto updates, ya que no existen en barber_shops
                delete validUpdates.city;
                delete validUpdates.locality;
            }

            // Paso 3: Actualizar la tabla 'locations' si se proporcionan 'city' o 'locality'
            const fields = Object.keys(validUpdates).map((key, index) => `${key} = $${index + 1}`);
            const values = Object.values(validUpdates);
            values.push(id); // Agrega el ID de la barbería al final del array de valores

            let result = null;

            if (fields.length > 0) {
                const shopQuery = `
                UPDATE barber_shops
                SET ${fields.join(', ')}
                WHERE id = $${values.length}
                RETURNING *
                `;
                const updateResult = await client.query(shopQuery, values);
                result = updateResult.rows[0]; // Guarda la barbería actualizada
            } else {
                //Si no hubo campos para actualizar, simplemente consultamos la barbería 
                const fetch = await client.query('SELECT * FROM barber_shops WHERE id = $1', [id]);
                result = fetch.rows[0]; // Guarda la barbería sin cambios
            }

            await client.query('COMMIT');//Confirmamos la transacción
            return result;

        } catch (error) {
            await client.query('ROLLBACK');//Encaso de error, revertimos los cambios
            console.error('Error actualizando barbería:', error);
            throw error;
        } finally {
            client.release();//Liberamos la conexión del pool
        }
    },


    /*
    *Insertar la foto actualizada por la que ya existe en la base de datos
    */
    async insertBarberPhoto(barber_shop_id, photo_url) {
        const query = `
            INSERT INTO barber_photos (barber_shop_id, photo_url)
            VALUES ($1, $2)
            RETURNING id
        `;
        const result = await pool.query(query, [barber_shop_id, photo_url]);
        return result.rows[0].id;
    },

    /**
     * Método para actualizar la URL de laimagen de la BD 
     */
    async updatePhotoUrlById(id, photo_url) {
        const query = `
            UPDATE barber_photos
            SET photo_url = $1
            WHERE id = $2
        `;
        await pool.query(query, [photo_url, id]);
    },


    /**
     * Obtener los datos actuales de la barbería por ID.
     */
    async getBarberShopById(id) {
        const query = await pool.query(`
            SELECT * FROM barber_shops WHERE id = $1`,
            [id]
        );
        return query.rows[0]; // ✅ Esto sí está correcto
    },


    /*
     *Nos de vuelve la foto encontrada por id 
    */
    async getPhotoById(photo_id) {
        const query = `
            SELECT * FROM barber_photos
            WHERE id = $1
        `;
        const result = await pool.query(query, [photo_id]);
        return result.rows[0]; // Devuelve la foto encontrada
    },



    /**
     * Elimina una barbería por ID.
     * @param {number} id
     * @returns {Promise<boolean>} - True si se eliminó.
     */
    async deleteBarberShop(id) {
        const query = `DELETE FROM barber_shops WHERE id = $1`;
        const result = await pool.query(query, [id]);
        return result.rowCount > 0;
    }
};

module.exports = BarberShopModels;
