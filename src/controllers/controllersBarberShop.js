const  BarberShopModels = require("../models/modelsBarberShop");//Importamos  el modelo de BarberShop

/**
 * Crea una nueva barbería y la guarda en la base de datos.
 * @param {Object} req - Objeto de solicitud con los datos de la barbería.
 * @param {Object} res - Objeto de respuesta.
 */
 
/**
 * Crea una nueva barbería y la guarda en la base de datos.
 * @param {Object} req - Objeto de solicitud con los datos de la barbería.
 * @param {Object} res - Objeto de respuesta.
 */
const createBarberShop = async (req, res) => {
    try {
        // Extraemos los datos enviados en la solicitud
        const { name, direccion, photo_url, city, locality, user_id } = req.body;

        // 1️⃣ Validar que todos los campos requeridos están presentes
        if (!name || !direccion || !photo_url || !city || !locality || !user_id) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // 2️⃣ Verificar si el usuario tiene el rol adecuado
        const userRole = await BarberShopModels.hasProperRole(user_id);
        if (!userRole || userRole !== 'barber') {
            return res.status(403).json({ 
                message: `El usuario con rol: ${userRole || 'desconocido'} no tiene permiso para crear barberías` 
            });
        }

        // 3️⃣ Verificar si el usuario ya tiene una barbería registrada
        const hasBarberShop = await BarberShopModels.hasBarberShop(user_id);
        if (hasBarberShop) {
            return res.status(400).json({ message: "El usuario ya tiene una barbería registrada" });
        }

        // 4️⃣ Llamamos al modelo para crear la barbería
        const newBarberShop = await BarberShopModels.createBarberShop(name, direccion, photo_url, city, locality, user_id);

        // 5️⃣ Si todo salió bien, devolvemos el id
        res.status(201).json({ message: "Barbería creada con éxito", barberShop: newBarberShop });
    } catch (error) {
        // 6️⃣ Manejo de errores
        res.status(500).json({ message: "Error al crear la barbería", error: error.message });
    }
};


/**
 * Obtiene todas las barberías con su información de ubicación.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 */

const getAllBarberShop = async(req, res) => {
    try {
        const barberShop = await BarberShopModels.getAllBarberShop();
        res.status(200).json(barberShop);
    } catch (error) {
        res.status(500).json({message: "Error al obtener las barberías ", error: error.message});
    }
};

/**
 * Obtiene una barbería por su ID con información de ubicación y barberos.
 * @param {Object} req - Objeto de solicitud con el ID de la barbería.
 * @param {Object} res - Objeto de respuesta.
 */

const getBarberShopById = async(req, res) => {
    try {
        //console.log("ID recibido:", req.params.id); // <-- Agregar esto para depurar
        const { id } = req.params;

        const barberShop = await BarberShopModels.getBarberShopById(id);
        if(!barberShop){
            return res.status(404).json({message: "Barbería no encontrada"});
        }
        res.status(200).json(barberShop);
    } catch (error) {
        res.status(500).json({menssage: "Error al obtener la barbería", error: error.menssage});
    }
};

/**
 * Actualiza una barbería por su ID.
 * @param {Object} req - Objeto de solicitud con los datos a actualizar.
 * @param {Object} res - Objeto de respuesta.
 */

const updateBarberByIdShop = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;


        // Validación del ID
        const barberShopId = Number(id);
        if (!Number.isInteger(barberShopId) || barberShopId <= 0) {
            return res.status(400).json({ message: "ID inválido" });
        }

        // Validación de los datos a actualizar
        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No hay datos para actualizar" });
        }

        // Actualizar la barbería en la base de datos
        const updatedBarberShop = await BarberShopModels.updateBarberShop(barberShopId, updates);

        if (!updatedBarberShop) {
            return res.status(404).json({ message: "Barbería no encontrada" });
        }

        res.status(200).json({ message: "Barbería actualizada con éxito", barberShop: updatedBarberShop });
    } catch (error) {
        
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};


/**
 * Elimina una barbería por su ID.
 * @param {Object} req - Objeto de solicitud con el ID de la barbería.
 * @param {Object} res - Objeto de respuesta.
 */
const deleteBarberShopById = async (req, res) => { 
    try {
        const { id } = req.params;
        

        const result = await BarberShopModels.deleteBarberShop(id);

        if (result) {
            return res.status(200).json({ message: "Barbería eliminada con éxito" });
        } else {
            return res.status(404).json({ message: "Barbería no encontrada" });
        }

    } catch (error) {
        console.error("Error al eliminar la barbería:", error);
        return res.status(500).json({ message: "Error al eliminar la barbería", error: error.message });
    }
};


module.exports = {
    createBarberShop,
    getAllBarberShop,
    getBarberShopById,
    updateBarberByIdShop,
    deleteBarberShopById
}