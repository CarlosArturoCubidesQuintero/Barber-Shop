// 📦 Importamos el pool de conexión a PostgreSQL
const pool =  require('../config/postgreSqlConfig');

const BarberScheduleModel = {
    /**
   * 🔹 Crea un nuevo horario para un barbero
   * @param {Object} scheduleData - Datos del horario
   * @returns {Object} - Horario creado
   */
  async createSchedule(scheduleData) {
    const {barber_id, day_of_week, start_time, end_time, schedule_type} = scheduleData;// Desestructuramos los datos del horario

    // 🧠 Consulta SQL para insertar el nuevo horario
    const query = `
    INSERT INTO barber_schedules (barber_id, day_of_week, start_time, end_time, schedule_type)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
    `;
    const values = [barber_id, day_of_week, start_time, end_time, schedule_type];// Valores a insertar
    
    // ⚙️ Ejecutar la consulta
    const result = await pool.query(query, values);// Ejecutar la consulta

    // ✅ Devolver el horario creado
    return result.rows[0];
  },

  /**
   * 🔹 Obtiene todos los horarios de un barbero específico
   * @param {number} barber_id - ID del barbero
   * @returns {Array} - Lista de horarios
   */
  async getSchedulesByBarberId(barber_id){
    const query = `
    SELECT * FROM barber_schedules WHERE barber_id = $1 ORDER BY day_of_week, start_time;`;
    const result = await pool.query(query, [barber_id]);// Ejecutar la consulta
    return result.rows;// Devolver la lista de horarios
  },


   /**
   * 🔹 Obtiene todos los horarios con nombre del barbero (JOIN con barbers y users)
   * @returns {Array} - Lista de horarios con nombre del barbero
   */
  async getAllSchedulesWithBarberName(){
    const query = `
    SELECT bs.id, u.name AS barber_name, bs.day_of_week, bs.start_time, bs.end_time, bs.is_available
    FROM barber_schedules bs
    JOIN barbers b ON bs.barber_id = b.id
    JOIN users u ON b.user_id = u.id
    ORDER BY u.name, bs.day_of_week;
    `;
    const result = await pool.query(query);// Ejecutar la consulta = Devolver la lista de horarios con nombre del barbero
    return result.rows; // Devolver la lista de horarios con nombre del barbero
  },


/**
   * 🔹 Actualiza un horario existente
   * @param {number} id - ID del horario
   * @param {Object} updates - Campos a actualizar
   * @returns {Object|null} - Horario actualizado o null si no existe
   */
  async updateSchedule(id, updates){
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if(fields.length === 0) return null;// Si no hay campos para actualizar, devolver null

    //Generar la cláusula SET para la consulta SQL
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const query = `UPDATE barber_schedules SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *;`;
    values.push(id);

    const result = await pool.query(query, values);// Ejecutar la consulta
    return result.rows[0] || null;// Devolver el horario actualizado o null si no existe
  },


  /**
   * 🔹 Elimina un horario por su ID
   * @param {number} id - ID del horario
   * @returns {boolean} - true si fue eliminado
   */
  async deleteSchedule(id){
    const query = `DELETE FROM barber_schedules WHERE id = $1;`;
    await pool.query(query, [id]);// Ejecutar la consulta
    return true;// Devolver true si fue eliminado
  }


};

module.exports = BarberScheduleModel;// Exportar el modelo de horarios de barberos