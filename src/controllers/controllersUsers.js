const User =  require("../models/modelsUsers"); // Importa el modelo de usuarios
const { validationResult } = require("express-validator"); // Importa express-validator para validar los datos del usuario


const registerUser = async (req, res) => { // Controlador para registrar un nuevo usuario
    try {
        const errors = validationResult(req); // Valida los datos del usuario
        if (!errors.isEmpty()) { // Si hay errores en la validación
            return res.status(400).json({ errors: errors.array() }); // Retorna los errores
        }

        const { name, email, password, role, provider } = req.body; // Extrae los datos del usuario del cuerpo de la petición

        //Verificar si el usuario ya existe
        const existingUser = await User.findByEmail(email); // Busca un usuario por su correo electrónico
        if (existingUser) { // Si el usuario ya existe
            return res.status(400).json({ msg: "El usuario ya existe" }); // Retorna un mensaje de exito
        }

        //Crear el usuario
        const newUser = await User.createUser(name, email, password, role, provider); // Crea un nuevo usuario en la base de datos
        res.status(201).json({message: "Usuario creado éxitosamente", user: newUser}); // Retorna un mensaje de exito y el usuario creado
    } catch (error) {
        res.status(500).json({message: "Error al registrar el usuario", error: error.message}); // Retorna un mensaje de error si falla el registro
    }
};

module.exports = { registerUser }; // Exporta el controlador para registrar un nuevo usuario