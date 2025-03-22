const pool = require("../config/postgreSqlConfig"); // Importa la configuración de la base de datos PostgreSQL
const bcrypt = require("bcrypt"); // Importa bcrypt para encriptar contraseñas

class User {
  // Método para crear un nuevo usuario en la base de datos
  static async createUser(name, email, password = null, role = "client", provider = "local") {
    try {
      let hashedPassword = null;

      // Si se proporciona una contraseña, se encripta antes de almacenarla
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10); // Encripta la contraseña con un factor de costo de 10
      }

      // Query SQL para insertar un nuevo usuario en la base de datos
      const query = `
        INSERT INTO users (name, email, password, role, provider)
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id, name, email, role, provider, created_at; 
      `;
      // RETURNING Devuelve los datos del usuario insertado

      // Valores a insertar en la consulta
      const values = [name, email, hashedPassword, role, provider];
      const result = await pool.query(query, values); // Ejecuta la consulta SQL

      return result.rows[0]; // Retorna el usuario creado
    } catch (error) {
      throw error; // Lanza el error para ser manejado externamente
    }
  }

  // Método para buscar un usuario por su correo electrónico
  static async findByEmail(email) {
    try {
      const query = "SELECT * FROM users WHERE email = $1"; // Consulta SQL para buscar un usuario por email
      const result = await pool.query(query, [email]); // Ejecuta la consulta con el email proporcionado
      return result.rows[0]; // Retorna el usuario encontrado o undefined si no existe
    } catch (error) {
      throw error; // Lanza el error para ser manejado externamente
    }
  }
}

module.exports = User; // Exporta la clase User para su uso en otros archivos
