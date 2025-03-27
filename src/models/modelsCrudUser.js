const pool = require("../config/postgreSqlConfig");// Import pool from postgreSqlConfig.js


//Otener usuario por ID
const getUserById = async (id) => {
    const result = await pool.query("SELECT id, name, email, role, created_at FROM users WHERE id = $1", [id]);
    return result.rows[0];
};


//Actualizar usuarios por ID
const updateUserById = async (id, name, email, role) => {
    const result = await pool.query("UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, role",[name, email, id]);
    return result.rows[0];
};


//Eliminar usuarios por ID 
const deleteUserById = async (id) => {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
    return result.rows[0];//Devuelve True si se eliminó el usuario
};


module.exports = {
    getUserById,
    updateUserById,
    deleteUserById
};