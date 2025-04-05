const express =  require("express");
const router = express.Router();
const { 
    createBarberShop, 
    getAllBarberShop, 
    getBarberShopById, 
    updateBarberByIdShop, 
    deleteBarberShopById} = require("../controllers/controllersBarberShop");



//Ruta para crear una nueva barbería con su respetiva city / locality
router.post("/createBarberShop", createBarberShop);

//Ruta para obtener todas las barberías
router.get("/getAllBarberShops", getAllBarberShop);

//Ruta para obtener una barbería por su id 
router.get("/getBarberByid/:id", getBarberShopById);

//Ruta para actualizar la información de una barbería
router.put("/updateBarberShop/:id", updateBarberByIdShop);

//Ruta para eliminar una barbería
router.delete("/deleteBarberShop/:id", deleteBarberShopById);

module.exports = router;