// ============================================================
//  Marcador en vivo · escucha Firebase y dibuja la tabla
// ============================================================
import { FIREBASE_CONFIG, RUTA, EQUIPOS, SDK_VERSION } from "./firebase-config.js";

const $ = (id) => document.getElementById(id);
const filas = [];                       // un <li> por equipo
let anteriores = EQUIPOS.map(() => 0);  // para detectar cambios

// ---------- Estado de la conexión (pastilla + apartado) ----------
function mostrarEstado(tipo, texto) {
  const pastilla = $("pastilla");
  pastilla.className = "pastilla " + tipo;     // conectado | error | demo
  $("pastilla-texto").textContent = texto;
  $("con-estado").textContent = texto;
}

// ---------- Construcción de la tabla ----------
function crearFilas() {
  EQUIPOS.forEach((nombre) => {
    const li = document.createElement("li");
    li.className = "fila";
    li.innerHTML =
      '<span class="pos">–</span>' +
      '<span class="nombre"></span>' +
      '<span class="puntos">0</span>' +
      '<div class="barra"><div class="relleno"></div></div>';
    li.querySelector(".nombre").textContent = nombre;
    $("ranking").appendChild(li);
    filas.push(li);
  });
}

// ---------- Datos -> pantalla ----------
// datos = { equipo1: 3, equipo2: "5", ... }  (App Inventor puede guardar texto o número)
function procesarDatos(datos) {
  const puntos = EQUIPOS.map((_, i) => Number(datos?.["equipo" + (i + 1)]) || 0);
  const maximo = Math.max(1, ...puntos);

  const orden = puntos
    .map((p, i) => ({ p, i }))
    .sort((a, b) => b.p - a.p || a.i - b.i);

  orden.forEach(({ p, i }, lugar) => {
    const li = filas[i];
    li.className = "fila" + (lugar < 3 ? " p" + (lugar + 1) : "");
    li.querySelector(".pos").textContent = lugar + 1;
    li.querySelector(".puntos").textContent = p;
    li.querySelector(".relleno").style.width = (p / maximo) * 100 + "%";
    $("ranking").appendChild(li);                 // reordena la lista
    if (p !== anteriores[i]) {
      li.classList.add("cambio");
    }
  });
  anteriores = puntos;

  const mejor = orden[0];
  const empate = orden.filter((o) => o.p === mejor.p).length > 1;
  if (mejor.p === 0) {
    $("lider-nombre").textContent = "—";
    $("lider-puntos").textContent = "Aún no hay puntos";
  } else {
    $("lider-nombre").textContent = empate ? "Empate" : EQUIPOS[mejor.i];
    $("lider-puntos").textContent = mejor.p + (mejor.p === 1 ? " punto" : " puntos");
  }

  const detectados = EQUIPOS.filter((_, i) => datos && datos["equipo" + (i + 1)] !== undefined).length;
  $("con-equipos").textContent = detectados + " de " + EQUIPOS.length;
  $("con-hora").textContent = new Date().toLocaleTimeString("es-MX");
  $("debug-json").textContent = JSON.stringify(datos, null, 2) ?? "Sin datos";
}

// ---------- Modo demostración (sin Firebase configurado) ----------
function modoDemostracion() {
  mostrarEstado("demo", "Modo demostración");
  $("con-ruta").textContent = "(sin configurar)";
  const datos = {};
  EQUIPOS.forEach((_, i) => (datos["equipo" + (i + 1)] = "0"));   // como texto, igual que podría llegar de App Inventor
  procesarDatos(datos);
  setInterval(() => {
    const i = Math.ceil(Math.random() * EQUIPOS.length);
    datos["equipo" + i] = String(Number(datos["equipo" + i]) + 1);
    procesarDatos(datos);
  }, 1500);
}

// ---------- Conexión real con Firebase ----------
async function conectar() {
  const base = "https://www.gstatic.com/firebasejs/" + SDK_VERSION + "/";
  const { initializeApp } = await import(base + "firebase-app.js");
  const { getDatabase, ref, onValue, get } = await import(base + "firebase-database.js");

  const db = getDatabase(initializeApp(FIREBASE_CONFIG));
  $("con-ruta").textContent = "/" + RUTA;

  // ¿Hay conexión con el servidor?
  onValue(ref(db, ".info/connected"), (s) => {
    if (s.val() === true) mostrarEstado("conectado", "En vivo");
    else mostrarEstado("error", "Reconectando…");
  });

  // Escucha de los puntajes (una sola carpeta con equipo1, equipo2…)
  onValue(
    ref(db, RUTA),
    (instantanea) => {
      const datos = instantanea.val();
      if (datos === null) {
        $("con-equipos").textContent = "0 (revisa la ruta)";
        $("debug-json").textContent = "No hay datos en /" + RUTA;
      }
      procesarDatos(datos);
    },
    (error) => mostrarEstado("error", "Sin acceso: " + error.message)
  );

  // Diagnóstico: mostrar la estructura de la base de datos
  $("btn-raiz").addEventListener("click", async () => {
    const todo = await get(ref(db, "/"));
    const texto = JSON.stringify(todo.val(), null, 2) ?? "La base de datos está vacía";
    $("debug-json").textContent = texto.length > 6000 ? texto.slice(0, 6000) + "\n…" : texto;
  });
}

// ---------- Arranque ----------
crearFilas();
if (new URLSearchParams(location.search).has("debug")) $("debug").hidden = false;

if (FIREBASE_CONFIG.databaseURL.includes("TU-PROYECTO")) {
  modoDemostracion();
} else {
  procesarDatos(null);
  conectar().catch((e) => mostrarEstado("error", "Error: " + e.message));
}
