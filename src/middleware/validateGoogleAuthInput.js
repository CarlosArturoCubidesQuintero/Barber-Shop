// Importa las funciones necesarias de la librería 'express-validator':
// 'body' se usa para validar campos específicos del cuerpo (body) de una solicitud HTTP.
// 'validationResult' se usa para recopilar los resultados de las validaciones y verificar si hay errores.
const { body, validationResult } = require('express-validator');

// Define un arreglo de middlewares llamado 'validateGoogleAuthInput' que validará los datos del cuerpo de la solicitud.
const validateGoogleAuthInput = [

    // Primer validador: se asegura de que el campo 'idToken' esté presente y sea una cadena de texto.
    body('idToken')
        .notEmpty() // Verifica que 'idToken' no esté vacío.
        .withMessage('El idToken es obligatorio') // Mensaje de error si está vacío.
        .isString() // Verifica que 'idToken' sea una cadena de texto.
        .withMessage('El idToken debe ser una cadena de texto'), // Mensaje de error si no es una cadena.

    // Segundo validador: se asegura de que el campo 'role' esté presente y tenga un valor válido.
    body('role')
        .notEmpty() // Verifica que 'role' no esté vacío.
        .withMessage('El rol es obligatorio') // Mensaje de error si está vacío.
        .isIn(['admin', 'client', 'barber']) // Verifica que 'role' sea uno de los valores permitidos.
        .withMessage('El rol debe ser "admin" o "client" o "barber"'), // Mensaje de error si el valor no es válido.

    // Middleware personalizado que revisa si hubo errores de validación:
    (req, res, next) => {
        const errors = validationResult(req); // Recoge los errores de validación de la solicitud.
        if (!errors.isEmpty()) { // Si hay errores, se responde con un estado 400 (Bad Request)
            return res.status(400).json({ errors: errors.array() }); // y se devuelve un arreglo con los mensajes de error.
        }
        next(); // Si no hay errores, continúa al siguiente middleware o controlador.
    }
];

// Exporta el arreglo de middlewares para poder usarlo en otras partes de la aplicación, como en una ruta.
module.exports = validateGoogleAuthInput;
