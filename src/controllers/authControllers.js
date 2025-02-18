const { createUser, getUserByEmail} = require('../models/userModels');
const bcrypt = require('bcrypt');
const { body, validationResult } = require ('express-validator');
const xss =  require('xss'); // Para sanitización de entradas y prevenir XSS

//Hace falta la configuración para evitar ataques de inyeccón a nuestro formulario de registro


//Función ára validar la contraseña 
const validarContrasena  = (contrasena) =>{
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    return regex.test(contrasena);
};

//Función para sanitizar la entrada
const sanitizarEntrada = (entrada) =>{
    return xss(entrada); //Remueve cualquier HTLM malicioso de la entrada

};

// Función para registrar un usuario
const registerUser = [
    // Validación de los campos
    body('nombre_usuario')
      .trim()
      .notEmpty().withMessage('El nombre de usuario es obligatorio')
      .escape(), // Sanitiza el nombre de usuario
    body('email')
      .isEmail().withMessage('Debe ser un correo electrónico válido')
      .normalizeEmail()  // Normaliza el correo (minúsculas, etc.)
      .escape(), // Sanitiza el correo
    body('contrasena')
      .notEmpty().withMessage('La contraseña es obligatoria')
      .custom((value) => validarContrasena(value)).withMessage('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, números y caracteres especiales'),
    body('rol')
      .notEmpty().withMessage('El rol es obligatorio')
      .isIn(['cliente', 'barbero', 'administrador']).withMessage('Rol no válido'),

      
// Función de registro
 async (req, res) => {
    try {

        //Validar las entradas
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json({ message: errors.array()[0].msg});
        }

        //Extrae los datos del cuerpo de la solicitud
        let { nombre_usuario, email, contrasena, rol } = req.body;

        //Sanitizar las entradas
        nombre_usuario = sanitizarEntrada(nombre_usuario);
        email = sanitizarEntrada(email);
        contrasena = sanitizarEntrada(contrasena);
        rol = sanitizarEntrada(rol);


        //1. Validación de campos obligatorios
        if(!nombre_usuario || !email || !contrasena || !rol){
            return res.status(400).json({message: "Todos los campos son obligatorios."});
        }


        //2.Verifica si el email ya está registrado
        const existingUser = await getUserByEmail(email);
        if (existingUser){
            return res.status(400).json({message: 'El email ya está registrado.'});
        }


         // 3. Encriptar la contraseña usando bcrypt
        const saltRounds = 10;
        let contrasena_hash;
        try {
          contrasena_hash = await bcrypt.hash(contrasena, saltRounds);
        } catch (error) {
          console.error("Error en la encriptación de la contraseña:", error);
          return res.status(500).json({ message: "Error al encriptar la contraseña." });
        }





        //4. Insertar el usuario en la base de datos 
        const newUser = await createUser({nombre_usuario, email, contrasena_hash, rol});

       

       //5. Responder con el usuario registrado y sin el token
       res.status(201).json({
        message: "Usuario registrado exitosamente.",
        user: newUser,
        
      });

    } catch (error) {
        console.error("Error en registerUser:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
  },
];
  
  module.exports = { registerUser };
  