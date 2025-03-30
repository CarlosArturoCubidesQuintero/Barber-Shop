const express =  require("express");
const router = express.Router();
const { 
    createBarberShop, 
    getAllBarberShop, 
    getBarberShopById, 
    updateBarberByIdShop, 
    deleteBarberShopById} = require("../controllers/controllersBarberShop");



//Ruta para crear una nueva barbería
router.post("/createBarberShop", createBarberShop);

//Ruta para obtener todas las barberías
router.get("/getBarberShops", getAllBarberShop);

//Ruta para obtener una barbería por su id 
router.get("/getBarberByid", getBarberShopById);

//Ruta para actualizar la información de una barbería
router.put("/updateBarberShop", updateBarberByIdShop)

//Ruta para eliminar una barbería
router.delete("/deleteBarberShop", deleteBarberShopById);

module.exports = router;