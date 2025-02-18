//LLamando nuestra conexion 
const pool = require("../config/firebaseConfig");

//Funcion para  crear un nuevo usuario en la tabla Usuarios 
const createUser = async ({nombre_usuario, email, contrasena_hash, rol}) =>{
    const query =`
    INSERT INTO usuarios(nombre_usuario, email, contrasena_hash, rol)
    VALUES($1, $2, $3, $4) RETURNING *`;
    const values = [nombre_usuario, email, contrasena_hash, rol];

    console.log("Ejecutando consulta:", query);
    console.log("Valores:", values);

    try {
      const { rows } = await pool.query(query, values);
      return rows[0]; 
    } catch (error) {
        console.log("Error en createUser", error);
        throw error;
    }
};

//Funcion para optener un usuario por email (Util para validar duplicados, login, etc.)
const getUserByEmail = async (email) =>{
    const query = `SELECT * FROM Usuarios WHERE email  =  $1;
    `;
    const values = [email];

    try {
        const { rows } = await pool.query(query, values);
        return rows[0];
    } catch (error) {
        console.log("Error en getUserByEmail", error);
        throw error;
    }
};

module.exports = { createUser, getUserByEmail }