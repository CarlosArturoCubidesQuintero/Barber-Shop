/**
 * Controlador para la ruta protegida.
 * Solo accesible para usuarios con un token válido.
 */
const  rutaProtegida  = async (req, res) => {
    try {
        //Retorna la información del usuario autenticado desde req.user
        res.status(200).json({
            message: "Acceso autorizado a la ruta protegida.",
            user: req.user //Contiene id, email, rol.
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor.", error: error.message});
    }
};

module.exports =  { 
    rutaProtegida 
};
