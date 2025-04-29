const pool = require("../config/postgreSqlConfig");

class User {

  // ✅ Método para buscar usuario por ID
  static async findUserById(id) {
    try {
      const result = await pool.query("SELECT id, name, email, role, created_at FROM users WHERE id = $1", [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error en findUserById:", error);
      throw error;
    }
  }

  // ✅ Actualizar usuarios por ID
  static async updateUserById(id, name, email, role) {
    try {
      const result = await pool.query(
        "UPDATE users SET name = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, name, email, role",
        [name, email, role, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error en updateUserById:", error);
      throw error;
    }
  }

  // ✅ Eliminar usuarios por ID
  static async deleteUserById(id) {
    try {
      const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
      return result.rows[0]; // Devuelve True si se eliminó el usuario
    } catch (error) {
      console.error("Error en deleteUserById:", error);
      throw error;
    }
  }

  // ✅ Método para crear un nuevo usuario
  static async createUser(name, email, role = "client", provider = "google", city = null, locality = null) {
    try {
      let locationId = null;
      if (role === "barber" && city && locality) {
        locationId = await User.findOrCreateLocation(city, locality);
      }

      const userQuery = `
        INSERT INTO users (name, email, role, provider)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, provider, created_at;
      `;

      const userResult = await pool.query(userQuery, [name, email, role, provider]);
      const newUser = userResult.rows[0];

      if (role === "barber" && locationId) {
        await pool.query("INSERT INTO barbers (user_id, location_id) VALUES ($1, $2);", [newUser.id, locationId]);
      }

      return newUser;
    } catch (error) {
      console.error("Error en createUser:", error);
      throw error;
    }
  }

  // ✅ Buscar usuario por email
  static async findByEmail(email) {
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error en findByEmail:", error);
      throw error;
    }
  }
}

module.exports = User;
