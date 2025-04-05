const pool = require("../config/postgreSqlConfig");//Importamos la configuración de la base de datos

/**
 * Crea una especialidad, la asigna a un barbero con precio y agrega una foto en una sola operación.
 * @param {number} barber_id - ID del barbero
 * @param {string} specialty_name - Nombre de la especialidad
 * @param {number} price - Precio de la especialidad
 * @param {string} photo_url - URL de la foto del peluqueado
 * @returns {Promise<object>} - Retorna la especialidad creada con su asignación y foto
 */
const createAndAssignSpecialty = async (barber_id, specialty_name, price, photo_url) => {
    const client = await pool.connect(); // Conexión a la base de datos
    try {
        await client.query('BEGIN'); // Inicia una transacción

        //Insertar la especialidad si no existe
        let specialtyResult = await client.query(
            `INSERT INTO specialties (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING *`,
            [specialty_name]
        );

        let specialty;
        if(specialtyResult.rows.length > 0) {
            specialty = specialtyResult.rows[0]; // Especialidad creada
        }else{
            specialty = await client.query(`SELECT * FROM  specialties WHERE name = $1`, [specialty_name]);
            specialty = specialty.rows[0]; // Especialidad existente
        }


        // Asignar la especialidad al barbero
        const barberSpecialtyResult = await client.query(
            `INSERT INTO barber_specialties (barber_id, specialty_id, price) VALUES ($1, $2, $3) RETURNING *`,
            [barber_id, specialty.id, price]
        );
        const barberSpecialty = barberSpecialtyResult.rows[0]; // Foto creada

        //Insertar la foto de la especialidad del barbero
        const  photoResult = await client.query(
            `INSERT INTO barber_specialty_photos (barber_specialty_id, photo_url) VALUES ($1, $2) RETURNING *`,
            [barberSpecialty.id, photo_url]
        );
        const photo = photoResult.rows[0]; // Foto creada

        await client.query('COMMIT'); // Confirma la transacción
        return{
            specialty,
            barberSpecialty,
            photo
        };
    } catch (error) {
        await client.query('ROLLBACK'); // Cancela la transacción
        throw error; // Lanza el error para manejarlo en otro lugar
    }finally{
        client.release(); // Libera el cliente de la conexión
    }
};


/**
 * Obtiene las especialidades de un barbero con precio y fotos
 * @param {number} barber_id - ID del barbero
 * @returns {Promise<Array>} - Lista de especialidades con detalles
 */
const getBarberSpecialties = async (id) => {
    try {
        const barberId = parseInt(id, 10); // 🛠 Convierte a número entero
      

        const result = await pool.query(
            `SELECT s.name AS specialty, bs.price, bp.photo_url
            FROM barber_specialties bs
            INNER JOIN specialties s ON bs.specialty_id = s.id
            LEFT JOIN barber_specialty_photos bp ON bs.id = bp.barber_specialty_id
            WHERE bs.barber_id = $1`,
            [barberId]
        );
        
        return result.rows;
    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error;
    }
};




/**
 * Editar una especialidad por su ID
 * @param {number} id - ID de la especialidad a editar
 * @param {string} name - Nuevo nombre de la especialidad 
 * @param {number} price - Nuevo precio de la especialidad
 * @param {string} photo_url - Nueva URL de la foto de la especialidad
 * @returns {Promise<object>} - Retorna la especialidad editada
 */
const updateSpecialty = async (id, name, price, photo_url) => {//  función de flecha asíncrona
    const client = await pool.connect(); // Inicia la conexión con la base de datos

    try {
        await client.query("BEGIN"); // Inicia una transacción

        let updatedSpecialty = null; // Variable para almacenar la especialidad actualizada

        // 1️⃣ Actualizar el nombre en specialties si se proporciona
        if (name) {
            const specialtyQuery = `
                UPDATE specialties SET name = $1 WHERE id = $2 RETURNING *`;
            const specialtyResult = await client.query(specialtyQuery, [name, id,]);// Actualiza el nombre de la especialidad
            updatedSpecialty = specialtyResult.rows[0]; // Guarda la especialidad actualizada
        }

        // 2️⃣ Actualizar el precio en barber_specialties si se proporciona
        if (price) {
            const priceQuery = `
                UPDATE barber_specialties SET price = $1 WHERE specialty_id = $2 RETURNING *`;
            await client.query(priceQuery, [price, id]);// Actualiza el precio de la especialidad
        }

        // 3️⃣ Actualizar la foto en barber_specialty_photos si se proporciona
        if (photo_url) {
            const photoQuery = `
                UPDATE barber_specialty_photos SET photo_url = $1 
                WHERE barber_specialty_id = (SELECT id FROM barber_specialties WHERE specialty_id = $2) 
                RETURNING *`;
            await client.query(photoQuery, [photo_url, id]);
        }

        await client.query("COMMIT"); // Confirma la transacción

        return updatedSpecialty; // Devuelve la especialidad editada
    } catch (error) {
        await client.query("ROLLBACK"); // Revierte la transacción en caso de error
        throw error;
    } finally {
        client.release(); // Libera la conexión con la base de datos
    }
};




/**
 * Elimina una especialidad por su ID
 * @param {number} id - ID de la especialidad a eliminar
 * @returns {Promise<boolean>} - Retorna true si se eliminó correctamente, false si no se encontró
 */
const deleteSpecialty = async (id) => {
    const client = await pool.connect();// Inicia la conexión con la base de datos

    try {
        await client.query("BEGIN"); // Inicia una transacción

         // 1️⃣ Obtener el ID del barber_specialty para eliminar la foto
         const { rows } = await client.query(
            `SELECT id FROM barber_specialties WHERE specialty_id = $1`,
            [id]
         );
         const barberSpecialtyId = rows[0]?.id; // Obtiene el ID del barber_specialty

         if (barberSpecialtyId){
            // 2️⃣ Eliminar la foto de barber_specialty_photos
            await client.query(
                `DELETE FROM barber_specialty_photos WHERE barber_specialty_id = $1`,
                [barberSpecialtyId]
            );

            // 3️⃣ Eliminar la especialidad de barber_specialties
            await client.query(
                `DELETE FROM barber_specialties WHERE id = $1`,
                [barberSpecialtyId]
            );
         }

        // 4️⃣ Finalmente eliminar de specialties
        const result = await client.query(
            `DELETE FROM specialties WHERE id = $1 RETURNING *`,
            [id]
        );
        await client.query("COMMIT"); // Confirma la transacción
        return result.rows.length > 0; // Retorna true si se eliminó correctamente, false si no se encontró
    } catch (error) {
        await client.query("ROLLBACK"); // Revierte la transacción en caso de error
        throw error; // Lanza el error para manejarlo en otro lugar

    }finally{
        client.release(); // Libera el cliente de la conexión
    }
};

module.exports ={
    createAndAssignSpecialty,
    deleteSpecialty,
    getBarberSpecialties,
    updateSpecialty
};
