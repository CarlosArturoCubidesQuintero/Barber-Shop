const { createUser, getUserByEmail} = require('../models/userModels');
const bcrypt = require('bcrypt');


//Función ára validar la contraseña 
const validarContrasena  = (contrasena) =>{
    const regex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(contrasena);
};

// Función para registrar un usuario
const registerUser = async (req, res) => {
    try {

        //Extrae los datos del cuerpo de la solicitud
        const { nombre_usuario, email, contrasena, rol } = req.body;
        

        //1. Validación de campos obligatorios
        if(!nombre_usuario || !email || !contrasena || !rol){
            return res.status(400).json({message: "Todos los campos son obligatorios."});
        }


        //2. Validación del rol permitido
        const validRoles = ['cliente', 'barbero', 'administrador'];
        if (!validRoles.includes(rol)){
            return res.status(400).json({message: "Rol no valido"});
        }


        // 3. Validar la contraseña
        if (!validarContrasena(contrasena)) {
            return res.status(400).json({ 
                message: "La contraseña debe tener al menos 8 caracteres, incluir una letra mayúscula y contener letras y números." 
            });
        }

        //4. Verificar si el email ya está registrado 
        const existingUser = await getUserByEmail(email);
        if(existingUser){
            return res.status(400).json({message: "El email ya está registrado. "})
        }

        //5.Encriptar la contraseña usando bcrypt
        const saltRounds = 10;
        const contrasena_hash = await bcrypt.hash(contrasena, saltRounds);

        //6. Insertar el usuario en la base de datos 
        const newUser = await createUser({nombre_usuario, email, contrasena_hash, rol});

       

       //7. Responder con el usuario registrado y sin el token
       res.status(201).json({
        message: "Usuario registrado exitosamente.",
        user: newUser,
        
      });

    } catch (error) {
        console.error("Error en registerUser:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
  };
  
  module.exports = { registerUser };
  