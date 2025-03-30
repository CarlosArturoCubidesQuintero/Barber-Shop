const pool = require("../config/postgreSqlConfig");


class User {
  
  // ✅ Método para buscar usuario por ID (AGREGADO)
  static async findUserById(userId) {
    try {
      const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // ✅ Método para buscar o crear una ubicación (ciudad/localidad)
  static async findOrCreateLocation(city, locality) {
    try {
      const locationQuery = "SELECT id FROM locations WHERE city = $1 AND locality = $2";
      const locationResult = await pool.query(locationQuery, [city, locality]);

      if (locationResult.rows.length > 0) {
        return locationResult.rows[0].id; // Retorna el ID si ya existe
      }

      // Si no existe, insertarlo y devolver el ID
      const insertQuery = "INSERT INTO locations (city, locality) VALUES ($1, $2) RETURNING id";
      const insertResult = await pool.query(insertQuery, [city, locality]);
      return insertResult.rows[0].id;
    } catch (error) {
      throw error;
    }
  }

  // ✅ Método para crear un nuevo usuario
  static async createUser(name, email,  role = "client", provider = "google", city = null, locality = null) {
    try {
      let locationId = null; // ✅ Declarar locationId antes de usarlo
      // Si el usuario es un "barber", asegurarse de obtener o crear la ubicación
      if (role === "barber" && city && locality) {
        locationId = await User.findOrCreateLocation(city, locality);
      }

      // ✅ Insertar usuario y retornar datos
      const userQuery = `
        INSERT INTO users (name, email, role, provider)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, provider, created_at;
      `;

      const userResult = await pool.query(userQuery, [name, email, role, provider]);
      const newUser = userResult.rows[0];

      // ✅ Si el usuario es barber, asociarlo con la ubicación
      if (role === "barber" && locationId) {
        await pool.query("INSERT INTO barbers (user_id, location_id) VALUES ($1, $2);", [newUser.id, locationId]);
      }

      return newUser;
    } catch (error) {
      throw error;
    }
  }

  // ✅ Buscar usuario por email
  static async findByEmail(email) {
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
