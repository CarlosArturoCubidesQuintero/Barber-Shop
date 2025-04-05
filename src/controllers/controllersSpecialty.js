const SpecialtyModels = require("../models/modelsSpecialty");//Importamos el modelo de especialidad

/**
 * Controlador para obtener las especialidades de un barbero con precio y fotos
 * @param {object} req - Objeto de solicitud de Express (con barber_id en params)
 * @param {object} res - Objeto de respuesta de Express
 */
const getBarberSpecialties = async (req, res) => {
    const { id } = req.params; // 🛠 Corregido: `id` en lugar de `barber_id`

    if (!id) {
        return res.status(400).json({ error: "El ID del barbero es obligatorio" });
    }

    try {
        const specialties = await SpecialtyModels.getBarberSpecialties(id); // 🛠 Pasar `id` correctamente
        res.status(200).json(specialties);
    } catch (error) {
        console.error("Error al obtener las especialidades del barbero:", error);
        res.status(500).json({ error: "Error al obtener las especialidades del barbero" });
    }
};



/**
 * Controlador para crear una nueva especialidad,  asignarla a un barbero con precio y agregar una foto
 * @param {object} req - Objeto de solicitud de Express (con nombre en el body)
 * @param {object} res - Objeto de respuesta de Express
 */

const createSpecialty = async (req, res) => {
    const { name, barber_id, price, photo_url} = req.body;//Obtiene el nombre de la especialidad del body

    if(!name || !barber_id || !price || !photo_url){
        return res.status(400).json({error: "Todos los campos son obligatorios"});
    }
    try {
        const specialty = await SpecialtyModels.createAndAssignSpecialty(barber_id, name, price, photo_url);// Llama a la función createSpecialty del modelo de especialidad
        res.status(201).json(specialty);//Retorna la especialidad creada   con status 201
    } catch (error) {
        console.error("Error al crear la especialidad:", error);//Imprimimos el error en la consola

        res.status(500).json({ error: "Error al crear la especialidad" });
    }
};




/**
 * Controlador para eliminar una especialidad por ID
 * @param {object} req - Objeto de solicitud de Express (con ID en params)
 * @param {object} res - Objeto de respuesta de Express
 */

const deleteSpecialty = async (req, res) => {
    const { id } = req.params;// Obtiene el ID de la URL

    try {
        const specialty = await SpecialtyModels.deleteSpecialty(id);

        if(!specialty){
            return res.status(404).json({error: " Especialidad no encontrada "});
        }
        
        res.status(200).json(specialty);// Retorna la especialidad eliminada
    } catch (error) {
        console.log("❌ Error al eliminar la especialidad:", error);// 💥  Imprime el error en la consola
        res.status(500).json({error: "Error al eliminar la especialidad"});
    }
};

/**
 * Controlador para editar una especialidad por ID
 * @param {object} req - Objeto de solicitud de Express (con ID en params y name en el body)
 * @param {object} res - Objeto de respuesta de Express
 */
const updateSpecialty = async (req, res) => {
    const { id } = req.params;//Obtiene el ID de la URL
    const { name, price, photo_url } = req.body;//Obtiene el nombre de la especialidad del body 
    if (!id || !name){
        return res.status(400).json({error: "El ID y el nombre son obigatorios"}); //Verifica que el ID y el nombre no sean nulos
    }
    try {
        const specialty = await SpecialtyModels.updateSpecialty(id, name, price, photo_url);//Llama a la función ediSpecialty del modelo de especialidad
        if (!specialty){
            return res.status(404).json({error: "Especialidad no encontrada"});//Verifica que la especialidad exista
        }
        res.status(200).json(specialty);//Retorna la especialidad editada
    } catch (error) {
        console.error("❌ Error al editar la especialidad:", error);// 💥  Imprime el error en la consola
        res.status(500).json({error: "Error al editar la especialidad"});//Retorna un error 500
    }
};




module.exports = {
    createSpecialty,
    deleteSpecialty,
    getBarberSpecialties,
    updateSpecialty
};