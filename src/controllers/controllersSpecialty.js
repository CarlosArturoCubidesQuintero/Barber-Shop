// Importamos el modelo que contiene las funciones relacionadas con las especialidades
const SpecialtyModels = require("../models/modelsSpecialty");

/**
 * Controlador para obtener las especialidades asignadas a un barbero específico
 */
const getBarberSpecialties = async (req, res) => {
    const { id } = req.params; // Obtenemos el ID del barbero desde los parámetros de la ruta

    // Verificamos que el ID haya sido proporcionado
    if (!id) {
        return res.status(400).json({ error: "El ID del barbero es obligatorio" });
    }

    try {
        // Llamamos al modelo para obtener las especialidades del barbero
        const specialties = await SpecialtyModels.getBarberSpecialties(id);
        // Respondemos con las especialidades obtenidas
        res.status(200).json(specialties);
    } catch (error) {
        // Si ocurre un error, lo mostramos en consola y enviamos un error 500 al cliente
        console.error("Error al obtener las especialidades:", error);
        res.status(500).json({ error: "Error al obtener las especialidades del barbero" });
    }
};

/**
 * Controlador para crear una nueva especialidad y asignarla a un barbero
 */
const createSpecialty = async (req, res) => {
    const { name, barber_id, price, photo_url } = req.body; // Extraemos los datos necesarios del cuerpo de la petición

    // Verificamos que todos los campos hayan sido proporcionados
    if (!name || !barber_id || !price || !photo_url) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        // Creamos y asignamos la especialidad usando el modelo
        const specialty = await SpecialtyModels.createAndAssignSpecialty(barber_id, name, price, photo_url);
        // Respondemos con la especialidad creada
        res.status(201).json(specialty);
    } catch (error) {
        // Si ocurre un error durante la creación, lo mostramos en consola y devolvemos error 500
        console.error("Error al crear la especialidad:", error);
        res.status(500).json({ error: "Error al crear la especialidad" });
    }
};

/**
 * Controlador para actualizar los datos de una especialidad
 */
const updateSpecialty = async (req, res) => {
    const { id } = req.params; // Obtenemos el ID de la especialidad desde los parámetros
    const { name, price, photo_url } = req.body; // Extraemos los campos a actualizar desde el cuerpo de la petición

    // Verificamos que se haya enviado un ID y al menos un campo a modificar
    if (!id || (!name && !price && !photo_url)) {
        return res.status(400).json({ error: "ID y al menos un campo a actualizar son obligatorios" });
    }

    try {
        // Llamamos al modelo para actualizar la especialidad
        const updated = await SpecialtyModels.updateSpecialty(id, name, price, photo_url);
        // Respondemos con los datos actualizados
        res.status(200).json(updated);
    } catch (error) {
        // Si ocurre un error, lo mostramos en consola y devolvemos un error 500
        console.error("Error al actualizar la especialidad:", error);
        res.status(500).json({ error: "Error al actualizar la especialidad" });
    }
};

/**
 * Controlador para eliminar una especialidad por su ID
 */
const deleteSpecialty = async (req, res) => {
    const { id } = req.params; // Obtenemos el ID de la especialidad a eliminar

    try {
        // Llamamos al modelo para eliminar la especialidad
        const deleted = await SpecialtyModels.deleteSpecialty(id);

        // Si no se encuentra la especialidad, devolvemos un error 404
        if (!deleted) {
            return res.status(404).json({ error: "Especialidad no encontrada" });
        }

        // Si la eliminación fue exitosa, devolvemos un mensaje de éxito
        res.status(200).json({ message: "Especialidad eliminada correctamente" });
    } catch (error) {
        // En caso de error, lo registramos en consola y devolvemos un error 500
        console.error("Error al eliminar la especialidad:", error);
        res.status(500).json({ error: "Error al eliminar la especialidad" });
    }
};

// Exportamos los controladores para poder usarlos en nuestras rutas
module.exports = {
    getBarberSpecialties,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty
};
