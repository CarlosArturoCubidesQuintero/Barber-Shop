// Importa el modelo de usuarios desde la carpeta de modelos
const crudUsers = require("../models/modelsCrudUser");

// Obtener un usuario por su ID
const getUserId = async (req, res) => {
    try {
        // Extrae el ID del usuario de los parámetros de la solicitud
        const { id } = req.params;

        // Llama al método del modelo para obtener el usuario por su ID
        const user = await crudUsers.getUserById(id);

        // Si no se encuentra el usuario, responde con un estado 404 y un mensaje de error
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Si el usuario existe, responde con los datos del usuario en formato JSON
        res.json(user);
    } catch (error) {
        // Maneja cualquier error y responde con un estado 500 y un mensaje de error
        res.status(500).json({ message: "Error al obtener usuario", error });
    }
};

// Actualizar el perfil de un usuario por su ID
const updateUser = async (req, res) => {
    try {
        // Extrae el ID del usuario de los parámetros de la solicitud
        const { id } = req.params;

        // Extrae los datos del cuerpo de la solicitud (nombre y correo electrónico)
        const { name, email } = req.body;

        // Llama al método del modelo para actualizar el usuario por su ID
        const updateUser = await crudUsers.updateUserById(id, name, email);

        // Si el usuario no se encuentra, responde con un estado 404 y un mensaje de error
        if (!updateUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Si la actualización fue exitosa, responde con los datos actualizados del usuario
        res.json(updateUser);
    } catch (error) {
        // Maneja cualquier error y responde con un estado 500 y un mensaje de error
        res.status(500).json({ message: "Error al actualizar usuario", error });
    }
};

// Eliminar un usuario por su ID
const deleteUser = async (req, res) => {
    try {
        console.log("ID recibido:", req.params.id); 
        // Extrae el ID del usuario de los parámetros de la solicitud
        //Convertir ID en numero osea parsear
        const id = parseInt(req.params.id, 10);

        // Si el ID no es un número válido, responder con error
        if (isNaN(id)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        // Llama al método del modelo para eliminar el usuario por su ID
        const deleted = await crudUsers.deleteUserById(id);

        // Si el usuario no se encuentra, responde con un mensaje indicando que no fue encontrado
        if (!deleted || deleted.length === 0) {
            return res.json({ message: "Usuario no encontrado" });
        }

        // Si la eliminación fue exitosa, responde con un mensaje de confirmación
        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        // Maneja cualquier error y responde con un estado 500 y un mensaje de error
        res.status(500).json({ message: "Error al eliminar usuario", error });
    }
};

// Exporta las funciones para poder utilizarlas en otras partes de la aplicación
module.exports = {
    getUserId,
    updateUser,
    deleteUser
};
