// ============================================================
//  APARTADO DE CONEXIÓN CON FIREBASE
//  Este es el ÚNICO archivo que hay que editar.
// ============================================================

// 1) Dirección de la base de datos (Firebase Console → Realtime Database).
export const FIREBASE_CONFIG = {
  databaseURL: "https://contadorbd-6f2e5-default-rtdb.firebaseio.com"
};

// 2) Ruta (carpeta) donde App Inventor guarda los puntajes.
export const RUTA = "contadorBD";

// 3) Nombres de los equipos, en orden (del 1 al 6).
export const EQUIPOS = [
  "Equipo Newland", 
  "TeamTurbo", 
  "Agentes P", 
  "Avispones Verdes", 
  "Team Momonga", 
  "Equipo 6"
];

// 4) Versión del SDK de Firebase que se descarga en el navegador.
export const SDK_VERSION = "10.12.2";
