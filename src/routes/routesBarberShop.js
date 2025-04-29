const express = require("express");
const router = express.Router();
const {
    createBarberShop,
    getAllBarberShop,
    getBarberShopById,
    updateBarberByIdShop,
    deleteBarberShopById,
    assignBarberToShop } = require("../controllers/controllersBarberShop");

const authMiddleware = require("../middleware/middlewareToken");// Middleware para verificar la autenticación

//Ruta para crear una nueva barbería con su respetiva city / locality
router.post("/createBarberShop", authMiddleware, createBarberShop);//OK 

//Ruta para obtener todas las barberías
router.get("/getAllBarberShops", getAllBarberShop);//ok

//Ruta para obtener una barbería por su id 
router.get("/getBarberByid/:id", getBarberShopById);//ok

//Ruta para actualizar la información de una barbería
router.put("/updateBarberShop/:id", authMiddleware, updateBarberByIdShop);//ok

//Ruta para eliminar una barbería
router.delete("/deleteBarberShop/:id", authMiddleware, deleteBarberShopById);//ok

//Ruta Asocia un barbero existente a una barbería solo un administrador puede hacer ese cambio
router.post("/createBarber", authMiddleware, assignBarberToShop); //Falta probar

module.exports = router;