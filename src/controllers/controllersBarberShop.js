const BarberShopModels = require("../models/modelsBarberShop");// Importa el modelo de barbería
const { normalizeText } = require("../services/locationServices");// Importa la función de normalización de texto

/**
 * Crea una nueva barbería. Solo el administrador puede realizar esta acción.
 */
const createBarberShop = async (req, res) => {
    try {
        const { name, direccion, photo_url, city, locality } = req.body;// Desestructuración de los datos del cuerpo de la solicitud
        const admin_id = req.user.id;// ID del administrador que realiza la solicitud

        // Validación: todos los campos son obligatorios
        if (!name || !direccion || !photo_url || !city || !locality) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        const normalizedName = normalizeText(name);// Normaliza el nombre de la barbería
        const normalizedCity = normalizeText(city);// Normaliza la ciudad
        const normalizedLocality = normalizeText(locality);// Normaliza la localidad

        // Verifica si ya existe una barbería con ese nombre. Y su respectiva normalización
        const existingBarberShop = await BarberShopModels.hasBarberShopByName(normalizedName);
        if (existingBarberShop) {
            return res.status(400).json({ message: "Ese nombre de barbería ya existe. Por favor elige otro." });
        }

        // Solo los administradores pueden crear barberías
        const userRole = req.user.role;
        if (userRole !== 'admin') {
            return res.status(403).json({ message: `El usuario con rol: ${userRole} no tiene permiso para crear barberías` });
        }

        // Verifica si el administrador ya tiene una barbería registrada
        const hasBarberShop = await BarberShopModels.hasBarberShop(admin_id);
        if (hasBarberShop) {
            return res.status(400).json({ message: "El usuario ya tiene una barbería registrada." });
        }

        // Crea la nueva barbería con los valores normalizados
        const newBarberShop = await BarberShopModels.createBarberShop(
            name,
            direccion,
            photo_url,
            normalizedCity,
            normalizedLocality,
            admin_id
        );

        res.status(201).json({ message: "Barbería creada con éxito", barberShop: newBarberShop });

    } catch (error) {
        res.status(500).json({ message: "Error al crear la barbería", error: error.message });
    }
};

/**
 * Asocia un barbero existente a una barbería. Solo un administrador puede hacerlo.
 */
const assignBarberToShop = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { barber_shop_id, user_id } = req.body;

        // Verifica que quien realiza la acción sea un administrador
        const role = await BarberShopModels.hasProperRole(adminId);
        if (role !== 'admin') {
            return res.status(403).json({ message: `El usuario con rol ${role} No autorizado. Solo un administrador puede asignar barberos` });
        }

        // Verifica que el usuario a asignar tenga rol de barbero
        const barberRole = await BarberShopModels.hasProperRole(user_id);
        if (barberRole !== 'barber') {
            return res.status(403).json({ message: `El usuario con rol: ${barberRole} no puede ser asignado como barbero.` });
        }

        // Verifica si el barbero ya está asignado a una barbería
        const existingBarber = await BarberShopModels.hasBarberShop(user_id);
        if (existingBarber) {
            return res.status(400).json({ message: "El barbero ya está asignado a una barbería." });
        }

        // Asigna el barbero a la barbería
        await BarberShopModels.assignBarberToShop(user_id, barber_shop_id);

        return res.status(200).json({ message: "Barbero asignado con éxito a la barbería." });

    } catch (error) {
        return res.status(500).json({ message: "Error del servidor", error: error.message });
    }
};

/**
 * Obtiene todas las barberías registradas.
 */
const getAllBarberShop = async (req, res) => {
    try {
        const barberShop = await BarberShopModels.getAllBarberShop();
        res.status(200).json(barberShop);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener las barberías", error: error.message });
    }
};

/**
 * Obtiene los detalles de una barbería por su ID.
 */
const getBarberShopById = async (req, res) => {
    try {
        const { id } = req.params;
        const barberShop = await BarberShopModels.getBarberShopById(id);
        if (!barberShop) {
            return res.status(404).json({ message: "Barbería no encontrada" });
        }
        res.status(200).json(barberShop);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la barbería", error: error.message });
    }
};

/**
 * Actualiza la información de una barbería por su ID. Solo el administrador que la creó puede hacerlo.
 */
const updateBarberByIdShop = async (req, res) => {
    try {
        const user_id = req.user.id; // ID del usuario autenticado (admin)
        const { id } = req.params; // ID de la barbería que se va a actualizar
        const updates = req.body; // Campos a actualizar recibidos desde el frontend

        // Verifica si el usuario tiene permisos de administrador
        const role = await BarberShopModels.hasProperRole(user_id);
        if (role !== 'admin') {
            return res.status(403).json({
                message: `El usuario con rol ${role} no tiene permisos para actualizar una barbería.`
            });
        }

        // Intenta actualizar la barbería con los campos nuevos y el ID del administrador
        const updated = await BarberShopModels.updateBarberShop(id, updates, user_id);

        // Si no se pudo actualizar (porque no existe o no es el creador), se informa
        if (!updated) {
            return res.status(404).json({
                message: "Barbería no encontrada o el administrador no es el creador."
            });
        }

        // Si se actualizó correctamente, se retorna la barbería actualizada
        return res.status(200).json(updated);

    } catch (error) {
        console.error("Error al actualizar la barbería:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message
        });
    }
};


/**
 * Elimina una barbería por su ID. Solo administradores pueden hacerlo.
 */
const deleteBarberShopById = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        // Verifica si el usuario tiene permisos de administrador
        const role = await BarberShopModels.hasProperRole(user_id);
        if (role !== 'admin') {
            return res.status(403).json({ message: "No autorizado. Solo un administrador puede eliminar barberías." });
        }

        // Intenta eliminar la barbería
        const deleted = await BarberShopModels.deleteBarberShop(id);
        if (!deleted) {
            return res.status(404).json({ message: "Barbería no encontrada o ya fue eliminada" });
        }

        return res.status(200).json({ message: "Barbería eliminada con éxito" });

    } catch (error) {
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};

// Exporta todas las funciones del controlador para que puedan ser utilizadas en rutas
module.exports = {
    createBarberShop,
    assignBarberToShop,
    getAllBarberShop,
    getBarberShopById,
    updateBarberByIdShop,
    deleteBarberShopById
};
