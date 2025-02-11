// Importa la aplicación Express desde el archivo 'server.js' (asumiendo que el archivo exporta la instancia de Express).
const app = require('./app');

// Declara una función 'main' para iniciar el servidor.
function main(){
   // Llama al método 'listen' en la aplicación Express para que el servidor escuche en el puerto 4000.
   // El segundo parámetro es una función de callback que se ejecuta cuando el servidor ha comenzado a escuchar.
   app.listen(4000, () => {
      // Una vez que el servidor ha comenzado a escuchar, imprime un mensaje en la consola indicando que el servidor está en funcionamiento.
      console.log('Server on port 4000');
   });
}

// Llama a la función 'main' para iniciar el servidor.
main();
