//Controlador para registrar usuarios

const registerUser = (req, res) =>{
    res.json({ message: 'Ruta de resgistro de usuarios funcionando  desde el controlador' });
};


module.exports = { registerUser };