// Estado simple en memoria: { nombre: valor }
const estado = new Map();
const lista = document.getElementById("lista");
const estadoUI = document.getElementById("estado");
const btnCargar = document.getElementById("btn-cargar-nombres");
const btnReset = document.getElementById("btn-reset");
const inputArchivo = document.getElementById("input-archivo");
const tpl = document.getElementById("tpl-persona");

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

// --------- Interacción ---------
// Variables para funcionalidad de mantener presionado
let intervalId = null;
let timeoutId = null;

// Función para actualizar contador con efectos visuales
function actualizarContador(card, nuevoValor, tipoAccion) {
  const nombre = card.dataset.nombre;
  const span = card.querySelector(".contador");
  const valorAnterior = Number(span.dataset.valor || "10");
  
  estado.set(nombre, nuevoValor);
  span.dataset.valor = String(nuevoValor);
  span.textContent = nuevoValor;
  bump(span);
  
  // Efecto de color según la acción
  if (tipoAccion === 'increment' && nuevoValor > valorAnterior) {
    card.classList.add("increment-flash");
    setTimeout(() => card.classList.remove("increment-flash"), 300);
  } else if (tipoAccion === 'decrement' && nuevoValor < valorAnterior) {
    card.classList.add("decrement-flash");
    setTimeout(() => card.classList.remove("decrement-flash"), 300);
  }
}

// Función para incrementar/decrementar valor
function cambiarValor(card, incremento) {
  const span = card.querySelector(".contador");
  let valor = Number(span.dataset.valor || "10");
  
  valor += incremento;
  
  // Aplicar límites
  if (valor > 10) valor = 10;
  if (valor < 0) valor = 0;
  
  // Redondear para evitar problemas de precisión de punto flotante
  valor = Math.round(valor * 10) / 10;
  
  const tipoAccion = incremento > 0 ? 'increment' : 'decrement';
  actualizarContador(card, valor, tipoAccion);
}

// Función para iniciar cambio continuo
function iniciarCambioContinuo(card, incremento) {
  // Primer cambio inmediato
  cambiarValor(card, incremento);
  
  // Delay inicial antes de empezar el cambio continuo
  timeoutId = setTimeout(() => {
    intervalId = setInterval(() => {
      cambiarValor(card, incremento);
    }, 100); // Cambio cada 100ms
  }, 500); // Esperar 500ms antes de empezar el cambio continuo
}

// Función para detener cambio continuo
function detenerCambioContinuo() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}

// Delegación: un solo listener para todos los botones
lista.addEventListener("mousedown", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const card = btn.closest(".persona");
  if (!card) return;

  const nombre = card.dataset.nombre;
  if (!estado.has(nombre)) return;

  if (btn.classList.contains("btn-mas")) {
    iniciarCambioContinuo(card, 0.1);
  } else if (btn.classList.contains("btn-menos")) {
    iniciarCambioContinuo(card, -0.1);
  } else if (btn.classList.contains("btn-reset-individual")) {
    // Reset individual a 0
    actualizarContador(card, 0, 'decrement');
  }
});

// Detener cambio continuo al soltar el botón
lista.addEventListener("mouseup", detenerCambioContinuo);
lista.addEventListener("mouseleave", detenerCambioContinuo);

// También manejar eventos touch para dispositivos móviles
lista.addEventListener("touchstart", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const card = btn.closest(".persona");
  if (!card) return;

  const nombre = card.dataset.nombre;
  if (!estado.has(nombre)) return;

  if (btn.classList.contains("btn-mas")) {
    iniciarCambioContinuo(card, 0.1);
  } else if (btn.classList.contains("btn-menos")) {
    iniciarCambioContinuo(card, -0.1);
  } else if (btn.classList.contains("btn-reset-individual")) {
    actualizarContador(card, 0, 'decrement');
  }
});

lista.addEventListener("touchend", detenerCambioContinuo);
lista.addEventListener("touchcancel", detenerCambioContinuo);

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
