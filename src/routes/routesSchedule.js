const express = require('express');// Importa express
const router = express.Router();// Crea un router de express
const { createSchedule, getAllSchedules, getSchedulesByBarberId, updateSchedule, deleteSchedule } = require('../controllers/controllersSchedule');// Importa el controlador de horarios
const authMiddleware = require('../middleware/middlewareToken');// Importa el middleware de autenticación


//Rutas para crear, obtener, editar y eliminar horarios de barberos
router.post('/createSchedule', createSchedule);// Ruta para crear un horario
router.get('/getAllSchedules', getAllSchedules);// Ruta para obtener todos los horarios
router.get('/getSchedulesBy/:id', getSchedulesByBarberId);// Ruta para obtener horarios por ID de barbero
router.put('/updateSchedule/:id', updateSchedule);// Ruta para actualizar un horario
router.delete('/deleteSchedule/:id', deleteSchedule);// Ruta para eliminar un horario


module.exports = router;// Exporta el router