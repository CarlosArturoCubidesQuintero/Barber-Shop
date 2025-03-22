const protectedRoute = (req, res) => {
    res.json({
        message: "Bienvenidos a la ruta protegida",
        user: req.user, //Datos del usuario extraídos del JWT
    });
};

module.exports = { protectedRoute };