const express = require("express");// import express
const router = express.Router();// import express module and create router
const {createSpecialty, deleteSpecialty,getBarberSpecialties,updateSpecialty} = require("../controllers/controllersSpecialty");// importamos el archivo controllersSpecialty.js



//Ruta para crear una nueva especialidad con precio y foto
router.post("/createSpecialty", createSpecialty);

//Ruta  para obtener las especialidades de un barbero con precio y fotos
router.get("/getBarberSpecialties/:id", getBarberSpecialties);

//Ruta para editar una especialidad por ID
router.put("/editSpecialty/:id", updateSpecialty)

//Ruta  para eliminar una especialidad por ID 
router.delete("/deleteSpecialty/:id", deleteSpecialty);




module.exports = router;