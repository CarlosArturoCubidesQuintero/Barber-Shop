// 📦 Importamos el modelo que contiene las consultas a la base de datos
const BarberScheduleModel = require("../models/modelsSchedule");

/**
 * Crea un nuevo horario para un barbero.
 * @param {Object} req - Objeto de solicitud con los datos del horario.
 * @param {Object} res - Objeto de respuesta.
 */
const createSchedule = async (req, res) => {
  try {
    const schedules = req.body;

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return res
        .status(400)
        .json({ menssage: "Debes enviar al menos un horario." });
    }

    const createdSchedules = []; // Nombre corregido aquí también

    for (const schedule of schedules) {
      const { barber_id, day_of_week, start_time, end_time, schedule_type } =
        schedule;

      if (
        !barber_id ||
        !day_of_week ||
        !start_time ||
        !end_time ||
        !schedule_type
      ) {
        return res
          .status(400)
          .json({ menssage: "Todos los campos son obligatorios" });
      }

      const newSchedule = await BarberScheduleModel.createSchedule({
        barber_id,
        day_of_week,
        start_time,
        end_time,
        schedule_type,
        //is_available: true,
      });

      createdSchedules.push(newSchedule);
    }

    return res.status(201).json({
      menssage: "Horarios creados exitosamente",
      schedules: createdSchedules,
    });
  } catch (error) {
    res
      .status(500)
      .json({ menssage: "Error al crear el horario", error: error.message });
  }
};

/**
 * Obtiene todos los horarios registrados, incluyendo el nombre del barbero.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 */

const getAllSchedules = async (req, res) => {
  try {
    const echedule = await BarberScheduleModel.getAllSchedulesWithBarberName(); // Llamamos al modelo para obtener los horarios
    res.status(200).json(echedule); // Devolvemos la lista de horarios
  } catch (error) {
    res.status(500).json({
      menssage: "Error al obtener los horarios",
      error: error.message,
    });
  }
};

/**
 * Obtiene todos los horarios de un barbero específico.
 * @param {Object} req - Objeto de solicitud con el ID del barbero.
 * @param {Object} res - Objeto de respuesta.
 */
const getSchedulesByBarberId = async (req, res) => {
  try {
    const { id } = req.params; // Obtenemos el ID del barbero de los parámetros de la solicitud
    const schedules = await BarberScheduleModel.getSchedulesByBarberId(
        id
    ); // Llamamos al modelo para obtener los horarios del barbero por ID

    if (!schedules || schedules.length === 0) {
      return res
        .status(404)
        .json({ menssage: "No se encontraron horarios para este barbero" });
    }
    res.status(200).json(schedules); // Devolvemos la lista de horarios
  } catch (error) {
    res.status(500).json({
      menssage: "Error al obtener los horarios",
      error: error.message,
    });
  }
};

/**
 * Actualiza un horario existente por su ID.
 * @param {Object} req - Objeto de solicitud con los datos a actualizar.
 * @param {Object} res - Objeto de respuesta.
 */
const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params; // Obtenemos el ID del horario de los parámetros de la solicitud
    const updates = req.body; // Obtenemos los datos a actualizar del cuerpo de la solicitud

    //Validación de campos a actualizar
    if (!updates || Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ menssage: "No hay datos para actualizar " });
    }

    const updatedSchedule = await BarberScheduleModel.updateSchedule(
      id,
      updates
    ); // Llamamos al modelo para actualizar el horario

    if (!updatedSchedule) {
      return res.status(404).json({ menssage: "Horario no encontrado" });
    }
    res.status(200).json({
      menssage: "Hoario actualizado exitosamente",
      schedule: updatedSchedule,
    }); // Devolvemos el horario actualizado
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el horario",
      error: error.message,
    });
  }
};

/**
 * Elimina un horario por su ID.
 * @param {Object} req - Objeto de solicitud con el ID del horario.
 * @param {Object} res - Objeto de respuesta.
 */
const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params; // Obtenemos el ID del horario de los parámetros de la solicitud
    const deleted = await BarberScheduleModel.deleteSchedule(id); // Llamamos al modelo para eliminar el horario

    if (!deleted) {
      return res.status(404).json({ menssage: "Horario no encontrado" });
    }
    res.status(200).json({ menssage: "Horario eliminado exitosamente" }); // Devolvemos un mensaje de éxito
  } catch (error) {
    res
      .status(500)
      .json({ menssage: "Error al eliminar el horario", error: error.message }); // Devolvemos un mensaje de error
  }
};

// Exportamos las funciones para ser utilizadas en las rutas
module.exports = {
  createSchedule,
  getAllSchedules,
  getSchedulesByBarberId,
  updateSchedule,
  deleteSchedule,
};
