const { getUserByEmail } = require('../models/userModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


//Función para Iniciar Sesión
const loginUser = async (req, res) => {
    try {
        const { email, contrasena } = req.body;

        //1. Validar que los campos no estén vacíos 
        if(!email || !contrasena){
            return res.status(400).json({ message: "Email y contraseña son obligatorios. "});
        }

        //2. Buscar el usuario por email en la base de datos
        const user = await getUserByEmail(email);
        if(!user){
            return res.status(401).json({ message: "Credenciales Inválidas."});
        }

        //3. Comparar la contraseña ingresada con la almacenada (hash)
        const isMatch = await bcrypt.compare(contrasena, user.contrasena_hash);
        if(!isMatch){
            return res.status(401).json({ message: "Credenciales inválidas." });
        }

        //4. Verificar que JWT_SECRET esté definido
        if (!process.env.JWT_SECRET){
            console.error("Error: La variable de entorno JWT_SECRET no está definida.");
            return res.status(500).json({message: "Error interno del servidor."});
        }

        // 5. Generar el token JWT incluyendo id, email y rol
        const token = jwt.sign(
            {id: user.id_usuarios, email: user.email, rol: user.rol},
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

          // 6. Enviar la respuesta con el token y los datos necesarios
         res.status(200).json({
            message: "Inicio de sesion exitoso.",
            token, // 🔥 Flutter usará este token para futuras peticiones
            user:{
                id: user.id_usuarios,
                email: user.email,
                rol: user.rol  // 🔥 Enviar el rol para redirigir en Flutter
            }
         });
    } catch (error) {
        console.error("Error en loginUser:", error);
        res.status(500).json({message: "Error interno del sevidor."});
    }
};

module.exports = {
    loginUser
}