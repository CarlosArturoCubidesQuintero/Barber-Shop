const admin = require("firebase-admin");
const dotenv = require("dotenv");

// Cargar variables del archivo .env
dotenv.config();

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL // Aquí se usa la variable de entorno
});

// Para Firestore
const db = admin.firestore();

console.log("🔥 Conectando a Firebase con la URL:", process.env.FIREBASE_DATABASE_URL); // Agregar para verificar

module.exports = { admin, db };
