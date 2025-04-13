const pool = require("../config/postgreSqlConfig"); // Importa la configuración de conexión a la base de datos PostgreSQL

// ==========================
// Crear especialidad + asignarla al barbero + guardar la foto
// ==========================
const createAndAssignSpecialty = async (barber_id, specialty_name, price, photo_url) => {
    const client = await pool.connect(); // Obtiene una conexión de la base de datos
    try {
        await client.query('BEGIN'); // Inicia una transacción

        // 1. Insertar la especialidad (si no existe) en la tabla specialties
        const specialtyInsert = `
            INSERT INTO specialties (name)
            VALUES ($1)
            ON CONFLICT (name) DO NOTHING
            RETURNING *`; // Si ya existe, ignora el conflicto y no inserta de nuevo
        let specialtyResult = await client.query(specialtyInsert, [specialty_name]);

        let specialty = specialtyResult.rows[0];

        // Si la especialidad ya existía y no se insertó, buscarla manualmente
        if (!specialty) {
            const existing = await client.query(`SELECT * FROM specialties WHERE name = $1`, [specialty_name]);
            specialty = existing.rows[0];
        }

        // 2. Insertar la relación entre barbero y especialidad con el precio
        const barberSpecialtyInsert = `
            INSERT INTO barber_specialties (barber_id, specialty_id, price)
            VALUES ($1, $2, $3)
            RETURNING *`;
        const barberSpecialty = (await client.query(barberSpecialtyInsert, [barber_id, specialty.id, price])).rows[0];

        // 3. Guardar la URL de la foto de la especialidad asignada al barbero
        const photoInsert = `
            INSERT INTO barber_specialty_photos (barber_specialty_id, photo_url)
            VALUES ($1, $2)
            RETURNING *`;
        const photo = (await client.query(photoInsert, [barberSpecialty.id, photo_url])).rows[0];

        await client.query('COMMIT'); // Confirmar la transacción
        return { specialty, barberSpecialty, photo }; // Retornar la información creada
    } catch (error) {
        await client.query('ROLLBACK'); // Revertir los cambios si hubo error
        throw error;
    } finally {
        client.release(); // Liberar la conexión
    }
};

// ==========================
// Obtener especialidades con precio y foto por barbero
// ==========================
const getBarberSpecialties = async (barber_id) => {
    try {
        const query = `
            SELECT s.name AS specialty, bs.price, bp.photo_url
            FROM barber_specialties bs
            INNER JOIN specialties s ON bs.specialty_id = s.id
            LEFT JOIN barber_specialty_photos bp ON bs.id = bp.barber_specialty_id
            WHERE bs.barber_id = $1`; // Relaciona barbero con sus especialidades y fotos
        const result = await pool.query(query, [parseInt(barber_id, 10)]);
        return result.rows; // Devuelve un arreglo de especialidades con precio y foto
    } catch (error) {
        console.error("Error en la consulta:", error);
        throw error;
    }
};

// ==========================
// Actualizar especialidad (nombre, precio, foto)
// ==========================
const updateSpecialty = async (id, name, price, photo_url) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN"); // Inicia la transacción

        // Si se envió un nuevo nombre, actualízalo
        if (name) {
            await client.query(`UPDATE specialties SET name = $1 WHERE id = $2`, [name, id]);
        }

        // Si se envió un nuevo precio, actualiza en la relación con el barbero
        if (price) {
            await client.query(`UPDATE barber_specialties SET price = $1 WHERE specialty_id = $2`, [price, id]);
        }

        // Si se envió una nueva URL de foto, actualiza la imagen
        if (photo_url) {
            await client.query(`
                UPDATE barber_specialty_photos 
                SET photo_url = $1 
                WHERE barber_specialty_id = (
                    SELECT id FROM barber_specialties WHERE specialty_id = $2
                )`, [photo_url, id]);
        }

        await client.query("COMMIT"); // Confirmar cambios
        return { id, name, price, photo_url }; // Retornar los valores actualizados
    } catch (error) {
        await client.query("ROLLBACK"); // Revertir si algo falla
        throw error;
    } finally {
        client.release(); // Liberar conexión
    }
};

// ==========================
// Eliminar especialidad (incluyendo relación con barbero y foto)
// ==========================
const deleteSpecialty = async (id) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Buscar la relación con el barbero
        const { rows } = await client.query(`SELECT id FROM barber_specialties WHERE specialty_id = $1`, [id]);
        const barberSpecialtyId = rows[0]?.id;

        // Si existe la relación, eliminar foto y la relación
        if (barberSpecialtyId) {
            await client.query(`DELETE FROM barber_specialty_photos WHERE barber_specialty_id = $1`, [barberSpecialtyId]);
            await client.query(`DELETE FROM barber_specialties WHERE id = $1`, [barberSpecialtyId]);
        }

        // Eliminar la especialidad en sí
        const result = await client.query(`DELETE FROM specialties WHERE id = $1 RETURNING *`, [id]);

        await client.query("COMMIT"); // Confirmar eliminación
        return result.rows.length > 0; // Devuelve true si se eliminó correctamente
    } catch (error) {
        await client.query("ROLLBACK"); // Revertir si hubo error
        throw error;
    } finally {
        client.release(); // Liberar conexión
    }
};

// ==========================
// Exportar las funciones para usarlas en otros archivos
// ==========================
module.exports = {
    createAndAssignSpecialty,
    getBarberSpecialties,
    updateSpecialty,
    deleteSpecialty
};
