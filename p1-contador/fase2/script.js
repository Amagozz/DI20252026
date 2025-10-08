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

function bump(el) {
  el.classList.add("bump");
  setTimeout(() => el.classList.remove("bump"), 160);
}

// Render de una persona
function renderPersona(nombre, valor = 10) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.nombre = nombre;
  node.querySelector(".nombre").textContent = nombre;

  const span = node.querySelector(".contador");
  span.textContent = valor.toFixed(1);
  span.dataset.valor = String(valor);

  const slider = node.querySelector(".slider");
  slider.value = valor.toFixed(1);

  // Escuchar cambios en el slider
  slider.addEventListener("input", (e) => {
    const v = parseFloat(e.target.value);
    estado.set(nombre, v);
    span.textContent = v.toFixed(1);
    span.dataset.valor = String(v);
    bump(span);
  });

  return node;
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

  let nombres;
  if (url.endsWith(".json")) {
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
  setEstado(`Cargados ${nombres.length} nombres.`);
}

// Carga desde archivo local
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
const tarjetasSeleccionadas = new Set();

function actualizarContador(card, delta) {
  const nombre = card.dataset.nombre;
  if (!estado.has(nombre)) return;

  const span = card.querySelector(".contador");
  const slider = card.querySelector(".slider");

  let valor = Number(span.dataset.valor || "10");
  valor += delta;
  valor = Math.max(0, Math.min(10, valor));

  estado.set(nombre, valor);
  span.dataset.valor = String(valor);
  span.textContent = valor.toFixed(1);

  if (slider) slider.value = valor.toFixed(1);

  bump(span);
}

// Delegación de clicks
lista.addEventListener("click", (ev) => {
  const card = ev.target.closest(".persona");
  if (!card) return;

  const nombre = card.dataset.nombre;
  if (!estado.has(nombre)) return;

  // Selección
  if (ev.target.classList.contains("btn-select")) {
    if (tarjetasSeleccionadas.has(card)) {
      tarjetasSeleccionadas.delete(card);
      card.classList.remove("seleccionada");
    } else {
      tarjetasSeleccionadas.add(card);
      card.classList.add("seleccionada");
    }
    return;
  }

  // Botones sumar/restar
  if (ev.target.classList.contains("btn-mas")) actualizarContador(card, +0.1);
  if (ev.target.classList.contains("btn-menos")) actualizarContador(card, -0.1);
  if (ev.target.classList.contains("btn-muerte")) actualizarContador(card, -5);
});

// Reset
btnReset.addEventListener("click", () => {
  for (const n of estado.keys()) estado.set(n, 10);
  renderLista();
  setEstado("Todos los contadores han sido reiniciados a 10.");
});

// Cargar nombres
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

// Teclado
document.addEventListener("keydown", (e) => {
  if (tarjetasSeleccionadas.size === 0) return;

  if (e.key === "ArrowUp") {
    e.preventDefault();
    tarjetasSeleccionadas.forEach(card => actualizarContador(card, +0.1));
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    tarjetasSeleccionadas.forEach(card => actualizarContador(card, -0.1));
  }
});

// Intento de bootstrap inicial
cargarNombresDesdeTxt("nombres.txt").catch(() => {
  setEstado("Consejo: coloca un nombres.txt junto a esta página o usa 'Cargar archivo local'.");
});
