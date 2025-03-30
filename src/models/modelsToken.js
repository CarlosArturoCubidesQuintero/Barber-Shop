const pool = require("../config/postgreSqlConfig");// Importa la conexión a la base de datos

const TokenModel =  {
    async saveToken(userId, token, expiresAt){//  Guarda un Refresh Token en la base de datos.
        const query = `
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3) RETURNING *;
        ;`

        const values = [userId, token, expiresAt];// Valores a insertar
        const result = await pool.query(query, values);// Ejecuta la consulta
        return result.rows[0];// Retorna el resultado
    },

    async findToken(token){// Busca un Refresh Token en la base de datos.
        const query = `SELECT * FROM  refresh_tokens WHERE token = $1;`;// Consulta para buscar el token
        const result = await pool.query(query, [token]);// Ejecuta la consulta
        return result.rows[0];// Retorna el resultado
    },


    async deleteToken(token){// Elimina un Refresh Token de la base de datos.
        const query = `DELETE FROM refresh_tokens WHERE token = $1;`;// Consulta para eliminar el token
        await pool.query(query, [token]);// Ejecuta la consulta
    },

    async deleteTokenByUserId(userId){// Elimina todos los tokens de un usuario por su id (útil para cerrar sesión en todos.
        const query = `DELETE FROM refresh_tokens WHERE user_id = $1; `;// Consulta para eliminar el token por ID de usuario
        await pool.query(query, [userId]);// Ejecuta la consulta
    },

    async updateToken(userId, newToken, expiresAt){// ✅ Nueva función para actualizar un Refresh Token
        const query = `UPDATE refresh_tokens SET token = $1, expires_at = $2 WHERE user_id = $3 RETURNING *;`;// Consulta para actualizar el refresh token
        const values = [newToken, expiresAt, userId];// Valores a actualizar
        const result = await pool.query(query, values);// Ejecuta la consulta
        return result.rows[0];// Retorna el resultado
    },

    async findTokenByUserId(userId) {
        const query = `SELECT * FROM refresh_tokens WHERE user_id = $1;`;
        const result = await pool.query(query, [userId]);
        return result.rows[0] || null;
    },
    

};

module.exports = TokenModel;// Exporta el modelo para su uso en otros archivos