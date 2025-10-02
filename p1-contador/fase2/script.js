// Estado simple en memoria: { nombre: valor }

// Usamos un Map porque nos permite asociar cada nombre con su valor (contador)
const estado = new Map(); 

// ========================
// Referencias a elementos del DOM
// ========================
const lista = document.getElementById("lista"); // Contenedor donde se generan las tarjetas de personas
const estadoUI = document.getElementById("estado"); // Mensajes de estado accesibles (aria-live)
const btnCargar = document.getElementById("btn-cargar-nombres"); // Botón para cargar nombres.txt
const btnReset = document.getElementById("btn-reset"); // Botón para reiniciar todos a 10
const btnSumarPuntos = document.getElementById("btn-sumarPuntos"); // Botón global +1
const btnMasMedioPunto = document.getElementById("btn-masMedioPunto"); // Botón global +0.1
const btnRestarPuntos = document.getElementById("btn-restarPuntos"); // Botón global -1
const btnMenosMedioPunto = document.getElementById("btn-menosMedioPunto"); // Botón global -0.1
const inputArchivo = document.getElementById("input-archivo"); // Input file para subir un archivo local
const tpl = document.getElementById("tpl-persona"); // Template HTML para clonar una persona

// ========================
// Utilidades
// ========================

// Elimina acentos/diacríticos y espacios extras → usado para ordenar alfabéticamente
const STORAGE_KEY = 'contadores_clase_estado'; 
const rankingListaUI = document.getElementById("ranking-lista"); // NUEVA CONSTANTE

// --------- Funciones de Guardar/Cargar Estado (localStorage) ---------

function guardarEstado() {
    try {
        const estadoArray = Array.from(estado.entries());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoArray));
    } catch (e) {
        console.error("Error al guardar estado en localStorage:", e);
    }
}

function cargarEstado() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const estadoArray = JSON.parse(stored);
            estado.clear();
            for (const [nombre, valor] of estadoArray) {
                estado.set(nombre, Number(valor)); 
            }
            setEstado(`Cargados ${estado.size} contadores guardados.`);
            return true;
        }
        return false; // No hay estado guardado
    } catch (e) {
        console.error("Error al cargar estado desde localStorage:", e);
        return false;
    }
}


// --------- Utilidades ---------
function normalizaNombre(s) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

function renderPersona(nombre, valor = 10) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.nombre = nombre;
  node.querySelector(".nombre").textContent = nombre;
  const span = node.querySelector(".contador");
  span.textContent = valor;
  span.dataset.valor = String(valor);
  return node;
}

function bump(el) {
  el.classList.add("bump");
  setTimeout(() => el.classList.remove("bump"), 160);
}

// Render completo desde estado
function renderLista() {
  lista.innerHTML = "";
  const nombres = Array.from(estado.keys()).sort((a, b) =>
    normalizaNombre(a).localeCompare(normalizaNombre(b))
  );
  for (const n of nombres) {
    const v = estado.get(n) ?? 10;
    lista.appendChild(renderPersona(n, v));
  }
}

// Mensaje de estado accesible
function setEstado(msg) {
  estadoUI.textContent = msg ?? "";
}

// --------- Carga de nombres ---------
async function cargarNombresDesdeTxt(url = "nombres.txt") {
  setEstado("Cargando nombres…");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo leer ${url}`);
  const text = await res.text();

  // Permite .txt (una por línea) o .json (array de strings)
  let nombres;
  if (url.endsWith(".json")) {
    const arr = JSON.parse(text);
    nombres = Array.isArray(arr) ? arr : [];
  } else {
    nombres = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }

  if (nombres.length === 0) throw new Error("El archivo no contiene nombres.");

  // Inicializa estado si no existían
  for (const n of nombres) {
    if (!estado.has(n)) estado.set(n, 10);
  }
  renderLista();
  setEstado(`Cargados ${nombres.length} nombres.`);
}

// Carga desde archivo local (input file)
async function cargarDesdeArchivoLocal(file) {
  const text = await file.text();
  let nombres;
  if (file.name.endsWith(".json")) {
    const arr = JSON.parse(text);
    nombres = Array.isArray(arr) ? arr : [];
  } else {
    nombres = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }

  if (nombres.length === 0) throw new Error("El archivo no contiene nombres.");

  for (const n of nombres) {
    if (!estado.has(n)) estado.set(n, 10);
  }
  renderLista();
  setEstado(`Cargados ${nombres.length} nombres desde archivo local.`);
}


// ========================
// Interacción con la UI (tarjetas individuales)
// ========================

// Delegación de eventos: un solo listener para todos los botones dentro de lista
// --------- Interacción (Maneja Clicks y Sliders) ---------
function manejarInteraccion(ev) {
    const card = ev.target.closest(".persona");
    if (!card) return;
    
    const nombre = card.dataset.nombre;
    if (!estado.has(nombre)) return;

    const span = card.querySelector(".contador");
    let valor = Number(span.dataset.valor || "10");
    let nuevoValor = valor;
    let btn;

    // Lógica para botones (+1 / -1)
    if (ev.type === "click") {
        btn = ev.target.closest("button");
        if (!btn) return;

        if (btn.classList.contains("btn-redondeado-mas")) valor += 0.1;
        if (btn.classList.contains("btn-mas")) valor += 1;
        if (btn.classList.contains("btn-redondeado-menos")) valor -= 0.1;
        if (btn.classList.contains("btn-menos")) valor -= 1;

        // Limitar rango [0,10]
        if (valor > 10) valor = 10;
        if (valor < 0) valor = 0;

        // Botones especiales
        if (btn.classList.contains("btn-muerte")) valor = 0; // Calavera → directo a 0
        if (btn.classList.contains("btn-magico")) valor = Number((Math.random() * 10).toFixed(1)); // Aleatorio 0-10

        nuevoValor = valor;
    // Lógica para el slider (input / change)
    } else if (ev.type === "input" || ev.type === "change") {
        const slider = ev.target.closest(".contador-slider");
        if (!slider) return;
        nuevoValor = Number(slider.value);
        // Limitar rango [0,10]
        if (nuevoValor > 10) nuevoValor = 10;
        if (nuevoValor < 0) nuevoValor = 0;
    } else {
        return;
    }

    // Actualiza estado y UI
    estado.set(nombre, Number(nuevoValor.toFixed(1)));
    span.dataset.valor = String(nuevoValor);
    span.textContent = Number(nuevoValor.toFixed(1)); // Siempre con 1 decimal
    bump(span);

    // Reaplica color dinámico según valor
    span.classList.remove("verde", "verdeSuave","naranja", "rojo");
    if (nuevoValor >= 9) {
        span.classList.add("verde");
    } else if(nuevoValor >= 7){
        span.classList.add("verdeSuave");
    } else if (nuevoValor >= 5) {
        span.classList.add("naranja");
    } else {
        span.classList.add("rojo");
    }
    guardarEstado();
    renderRanking();
}

// Delegación de eventos: un solo listener para todos los botones y sliders dentro de lista
lista.addEventListener("click", manejarInteraccion);
lista.addEventListener("input", manejarInteraccion);
lista.addEventListener("change", manejarInteraccion);


// ========================
// Botones globales
// ========================

// Reinicia todos los contadores a 10
btnReset.addEventListener("click", () => {
  for (const n of estado.keys()) estado.set(n, 10);
  renderLista();
  setEstado("Todos los contadores han sido reiniciados a 10.");
});

btnCargar.addEventListener("click", async () => {
  try {
    await cargarNombresDesdeTxt("nombres.txt");
  } catch (err) {
    console.error(err);
    setEstado("No se pudo cargar nombres.txt. Puedes subir un archivo local.");
  }
});

inputArchivo.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    await cargarDesdeArchivoLocal(file);
  } catch (err) {
    console.error(err);
    setEstado("No se pudo leer el archivo local.");
  } finally {
    inputArchivo.value = "";
  }
});

// --------- Bootstrap ---------
// Opción A (recomendada en local con live server): intenta cargar nombres.txt
// Opción B: si falla, el usuario puede usar “Cargar archivo local”
cargarNombresDesdeTxt("nombres.txt").catch(() => {
  setEstado("Consejo: coloca un nombres.txt junto a esta página o usa 'Cargar archivo local'.");
});
