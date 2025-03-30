const BarberShopModels = require("../models/modelsBarberShop");//Importamos  el modelo de BarberShop


 /**
     * Crea una nueva barbería y la guarda en la base de datos.
     * @param {Object} req - Objeto de solicitud con los datos de la barbería.
     * @param {Object} res - Objeto de respuesta.
     */
 const  createBarberShop = async(req, res) => {
    try {
        const { name, direccion, photo_url, city,  locality, user_id } = req.body;

        if(!name || !direccion || !photo_url || !city || !locality || !user_id){
            return res.status(400).json({message: "Todos los campos son obligatorios"});
        }
       

        //💈  Llamamos al modelo para crear la barbería
        const newBarberShop = await BarberShopModels.createBarberShop(name, direccion, photo_url, city, locality, user_id);

        res.status(201).json({message: "Barbería creada con éxito", barberShop: newBarberShop })
    } catch (error) {
        res.status(500).json({message: "Error al crear la barbería", error: error.message });
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
        const { id } = req.params.id;
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

const updateBarberByIdShop = async(req, res) => {
    try {
        const { id } =  req.params.id;
        const updates = req.body

        const updatedBarberShop = await BarberShopModels.updateBarberShop(id, updates);
        if(!updatedBarberShop){
            return res.status(400).json({mensagge: "Barbería no encontrada"});
        }
        res.status(200).json(updatedBarberShop);
    } catch (error) {
        res.status(500).json({mensagge: "Error al actualizar la barbería", error: error.mensagge});
    }
};

/**
 * Elimina una barbería por su ID.
 * @param {Object} req - Objeto de solicitud con el ID de la barbería.
 * @param {Object} res - Objeto de respuesta.
 */
const deleteBarberShopById = async(req, res) => { 
    try {
        const { id } = req.params.id; 
        await BarberShopModels.deleteBarberShop(id);
        res.status(200).json({mensagge: "Barbería eliminada con éxito:", error: error.mensagge});
    } catch (error) {
        res.status(500).json({mensagge: " Error al eliminar la barbería", error: error.mensagge});
    }
};

module.exports = {
    createBarberShop,
    getAllBarberShop,
    getBarberShopById,
    updateBarberByIdShop,
    deleteBarberShopById
}