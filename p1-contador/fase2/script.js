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
  // Si el valor es exactamente 10, mostrar solo 10
  span.textContent = valor === 10 ? "10" : valor.toFixed(1);
  span.dataset.valor = String(valor);
  setColor(span, valor);
  // Hacer el span focusable
  span.tabIndex = 0;
  return node;
}
// Permitir subir/bajar nota con flechas cuando el span .contador tiene el foco
lista.addEventListener("keydown", (ev) => {
  const span = ev.target.closest(".contador");
  if (!span) return;
  const card = span.closest(".persona");
  if (!card) return;
  const nombre = card.dataset.nombre;
  if (!estado.has(nombre)) return;
  let valor = Number(span.dataset.valor || "10");
  let cambiado = false;
  if (ev.key === "ArrowUp") {
    valor = +(valor + 0.1).toFixed(1);
    if (valor > 10) valor = 10;
    cambiado = true;
  } else if (ev.key === "ArrowDown") {
    valor = Math.max(0, +(valor - 0.1).toFixed(1));
    cambiado = true;
  }
  if (cambiado) {
    estado.set(nombre, valor);
    span.dataset.valor = String(valor);
    span.textContent = valor === 10 ? "10" : valor.toFixed(1);
    setColor(span, valor);
    bump(span);
    ev.preventDefault();
  }
});

// Añade esta función para los colores
function setColor(span, valor) {
  span.classList.remove("rojo", "naranja", "verde");
  if (valor <= 3) {
    span.classList.add("rojo");
  } else if (valor < 7) {
    span.classList.add("naranja");
  } else {
    span.classList.add("verde");
  }
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
// Delegación: un solo listener para todos los botones
lista.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const card = btn.closest(".persona");
  if (!card) return;

  const nombre = card.dataset.nombre;
  if (!estado.has(nombre)) return;

  const span = card.querySelector(".contador");
  let valor = Number(span.dataset.valor || "10");

  if (btn.classList.contains("btn-mas")) {
    valor = +(valor + 0.1).toFixed(1);
    if (valor > 10) valor = 10;
  }
  if (btn.classList.contains("btn-menos")) valor = Math.max(0, +(valor - 0.1).toFixed(1));
  if (btn.classList.contains("btn-muerte")) valor = 4; // Botón de la muerte

  estado.set(nombre, valor);
  span.dataset.valor = String(valor);
  span.textContent = valor === 10 ? "10" : valor.toFixed(1);
  setColor(span, valor);
  bump(span);
});

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

const btnSuspenderSeleccionados = document.getElementById("btn-suspender-seleccionados");

btnSuspenderSeleccionados.addEventListener("click", () => {
  const seleccionados = lista.querySelectorAll(".seleccion-suspenso:checked");
  let count = 0;
  seleccionados.forEach(checkbox => {
    const card = checkbox.closest(".persona");
    const nombre = card.dataset.nombre;
    if (estado.has(nombre)) {
      estado.set(nombre, 4);
      count++;
    }
  });
  renderLista();
  setEstado(count > 0 ? `Suspendidos ${count} alumnos seleccionados.` : "No hay alumnos seleccionados.");
});

// --------- Bootstrap ---------
// Opción A (recomendada en local con live server): intenta cargar nombres.txt
// Opción B: si falla, el usuario puede usar “Cargar archivo local”
cargarNombresDesdeTxt("nombres.txt").catch(() => {
  setEstado("Consejo: coloca un nombres.txt junto a esta página o usa 'Cargar archivo local'.");
});
