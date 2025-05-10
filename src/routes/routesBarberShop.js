const express = require("express");
const router = express.Router();
const {
    createBarberShop,
    getAllBarberShop,
    deleteBarberShopById,
    assignBarberToShop,
    updateBarberShop,
    getBarbersWithoutProfile } = require("../controllers/controllersBarberShop");

const authMiddleware = require("../middleware/middlewareToken");// Middleware para verificar la autenticación


const uploadPhotos = require("../middleware/uploadPhotos");// Importamos el middleware para cargar imágenes

//Ruta para crear una nueva barbería con su respetiva city / locality
router.post("/createBarberShop", authMiddleware, uploadPhotos, createBarberShop);

//Ruta para obtener todas las barberías
router.get("/getAllBarberShops", getAllBarberShop);


//Ruta para actualizar la información de una barbería
router.put("/updateBarberShop/:id", authMiddleware, uploadPhotos, updateBarberShop);

//Ruta para eliminar una barbería
router.delete("/deleteBarberShop/:id", authMiddleware, deleteBarberShopById);

//Ruta Asocia un barbero existente a una barbería solo un administrador puede hacer ese cambio
router.post("/createBarber", authMiddleware, assignBarberToShop);

//Obtiene todos los barberos que no tiene una barberia asociada
router.get("/barbersunassigned", authMiddleware, getBarbersWithoutProfile); //Falta probar

module.exports = router;