const BarberShopModels = require("../models/modelsBarberShop");// Importa el modelo de barbería
const { normalizeText } = require("../services/locationServices");// Importa la función de normalización de texto
const path = require("path");// Importa el módulo 'path' para manejar rutas de archivos
const fs = require("fs");// Importa el módulo 'fs' para manejar el sistema de archivos
/**
 * Crea una nueva barbería. Solo el administrador puede realizar esta acción.
 */
const createBarberShop = async (req, res) => {
    try {
        const { name, direccion, city, locality } = req.body;// Desestructuración de los datos del cuerpo de la solicitud
        const admin_id = req.user.id;// ID del administrador que realiza la solicitud

        //Validar que la imagen fue subida correctamente
        if (!req.file) {
            return res.status(400).json({ message: "La imagen de la barbería es obligatoria" });
        }

        const photo_url = `/uploads${req.file.filename}`; // ✅ La ruta pública del archivo subido por Multer

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
            photo_url,// ✅ Ya viene del archivo subido
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
 * Obtiene todos los barberos que no tienen una barbería asociada.
 * Solo los administradores pueden acceder a esta información.
 */
const getBarbersWithoutProfile = async (req, res) => {
    try {
        const userId = req.user.id; // ID del usuario autenticado 

        //Verifica si el usuario tiene rol de administrador
        const role = await BarberShopModels.hasProperRole(userId);
        if (role !== 'admin') {
            return res.status(403).json({
                menssage: `Acceso denegado. Solo los administradores pueden ver esta información. Tu rol: ${role}`

            });
        }

        // Obtiene todos los barberos que no tienen una barbería asociada
        const barbers = await BarberShopModels.getBarbersWithoutProfile();
        return res.status(200).json(barbers);


    } catch (error) {
        console.error("❌ Error al obtener barberos sin perfil:", error);
        return res.status(500).json({
            message: "Error interno del servidor al obtener barberos sin perfil.",
            error: error.message
        });
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
 * Actualiza la información de una barbería por su ID.
 * Solo el administrador que la creó puede hacerlo.
 * Si se sube una nueva imagen de portada, se reemplaza la anterior físicamente y en la base de datos.
 */
const updateBarberShop = async (req, res) => {
    try {
        const user_id = req.user.id; // ID del usuario autenticado (admin)
        const { id } = req.params; // ID de la barbería que se va a actualizar
        const updates = req.body; // Datos que vienen desde el frontend

        console.log("Datos recibidos para actualizar:", updates);

        // 🔧 Limpiar claves que puedan tener espacios innecesarios
        const cleanedUpdates = {};
        Object.keys(updates).forEach(key => {
            cleanedUpdates[key.trim()] = updates[key];
        });

        // 1️⃣ Verificar si el usuario tiene rol de administrador
        const role = await BarberShopModels.hasProperRole(user_id);
        if (role !== 'admin') {
            return res.status(403).json({
                message: `El usuario con rol ${role} no tiene permisos para actualizar una barbería.`
            });
        }

        // 2️⃣ Normalizar los campos de texto si existen
        if (cleanedUpdates.name) {
            console.log("Nombre antes de normalizar:", cleanedUpdates.name);
            cleanedUpdates.name = normalizeText(cleanedUpdates.name);
            console.log("Nombre después de normalizar:", cleanedUpdates.name);
        }

        if (cleanedUpdates.city) {
            console.log("Ciudad antes de normalizar:", cleanedUpdates.city);
            cleanedUpdates.city = normalizeText(cleanedUpdates.city);
            console.log("Ciudad después de normalizar:", cleanedUpdates.city);
        }

        if (cleanedUpdates.locality) {
            console.log("Localidad antes de normalizar:", cleanedUpdates.locality);
            cleanedUpdates.locality = normalizeText(cleanedUpdates.locality);
            console.log("Localidad después de normalizar:", cleanedUpdates.locality);
        }

        // 3️⃣ Manejo de imagen nueva si se sube una
        if (req.file) {
            const newPhotoUrl = `/uploads/${req.file.filename}`; // Ruta pública generada por Multer

            // Obtener los datos actuales de la barbería
            const barberShop = await BarberShopModels.getBarberShopById(id);

            // Si ya existe una imagen de portada
            if (barberShop.main_photo_id) {
                const oldPhoto = await BarberShopModels.getPhotoById(barberShop.main_photo_id);

                if (oldPhoto && oldPhoto.photo_url) {
                    // Normaliza por si la ruta tiene carpetas adicionales como 'barberias'
                    let cleanedOldUrl = oldPhoto.photo_url.replace('/uploads/barberias/', '/uploads/');
                    const oldPath = path.join(__dirname, '..', '..', 'public', cleanedOldUrl); // Ruta completa del archivo a eliminar
                    console.log("Ruta de la foto anterior:", oldPath);

                    // Verificar si el archivo existe y eliminarlo
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                        console.log("🗑️ Foto anterior eliminada correctamente:", oldPath);
                    } else {
                        console.warn("⚠️ No se encontró la foto anterior para eliminar:", oldPath);
                    }

                    // Actualizar la fila existente en la base de datos con la nueva URL
                    await BarberShopModels.updatePhotoUrlById(barberShop.main_photo_id, newPhotoUrl);
                }
            } else {
                // Si no había imagen anterior, se inserta una nueva y se actualiza el campo main_photo_id
                const newPhotoId = await BarberShopModels.insertBarberPhoto(id, newPhotoUrl);
                cleanedUpdates.main_photo_id = newPhotoId; // Se guarda este nuevo ID en los updates
            }
        }

        // 4️⃣ Realizar la actualización de los datos de la barbería
        const updated = await BarberShopModels.updateBarberShop(id, cleanedUpdates, user_id);

        // Si no se pudo actualizar (porque no existe o el usuario no es el creador)
        if (!updated) {
            return res.status(404).json({
                message: "No se pudo actualizar la barbería. Verifique permisos o ID."
            });
        }

        // ✅ Retornar respuesta exitosa
        return res.status(200).json(updated);

    } catch (error) {
        console.error("❌ Error al actualizar la barbería:", error);
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
        const { id } = req.params; // ID de la barbería que se de sea eliminar
        const user_id = req.user.id; // ID del usuario autenticado (admin)

        // Verifica si el usuario tiene permisos de administrador
        const role = await BarberShopModels.hasProperRole(user_id);
        if (role !== 'admin') {
            return res.status(403).json({
                message: `El usuario con rol ${role} no tiene permisos para eliminar barberías.`
            });
        }

        // 🔍 Obtener la barbería para acceder a su main_photo_id
        const barberShop = await BarberShopModels.getBarberShopById(id);
        if (!barberShop) {
            return res.status(404).json({ message: "Barbería no encontrada" });

        }

        // 🖼️ Verificar si tiene imagen principal y eliminarla
        if (barberShop.main_photo_id) {
            const photo = await BarberShopModels.getPhotoById(barberShop.main_photo_id);
            if (photo && photo.photo_url) {
                const imagePath = path.join(__dirname, '..', '..', 'public', photo.photo_url); // Ruta completa de la imagen


                //Eliminar la imagen del servidor
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath); // Elimina la imagen del servidor
                    console.log("🗑️ Imagen eliminada correctamente:", imagePath);
                } else {
                    console.log("⚠️ No se encontró la imagen para eliminar:", imagePath);
                }

                // Opcional: también puedes eliminar la fila en barber_photos si ya no la necesitas
                await BarberShopModels.getPhotoById(barberShop.main_photo_id);

            }

        }



        // 🧹 Elimina la barbería de la base de datos
        const deleted = await BarberShopModels.deleteBarberShop(id);
        if (!deleted) {
            return res.status(404).json({ message: "Barbería no encontrada o ya fue eliminada" });
        }

        return res.status(200).json({ message: "Barbería eliminada con éxito" });

    } catch (error) {
        console.error("❌ Error al eliminar la barbería:", error);
        return res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};

// Exporta todas las funciones del controlador para que puedan ser utilizadas en rutas
module.exports = {
    createBarberShop,
    assignBarberToShop,
    getAllBarberShop,
    updateBarberShop,
    deleteBarberShopById,
    getBarbersWithoutProfile
};
