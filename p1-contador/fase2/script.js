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

  if (btn.classList.contains("btn-mas") && valor<=9.9)  valor += 0.10;
  if (btn.classList.contains("btn-menos")&& valor>=0.1) valor -= 0.10;
  if (btn.classList.contains("btn-suspender")) { valor=0;

  span.classList.remove("rojo", "naranja", "verde");
  span.classList.add("rojo");

  bump(span);
  setEstado(`${nombre} ha sido suspendido. Nota puesta: 0.`);
}


// Limpia clases anteriores
span.classList.remove("naranja", "rojo","verde");

// Aplica color según el valor
if (valor < 5) {
  span.classList.add("rojo");
} else if (valor >= 5 && valor < 6) {
  span.classList.add("naranja");
} else if (valor >=6) {
  span.classList.add("verde");
}

  estado.set(nombre, valor);
  span.dataset.valor = String(valor);
  span.textContent = valor.toFixed(1);
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
function actualizarSeleccionados(delta) {
  const seleccionados = lista.querySelectorAll(".selector:checked");
  for (const checkbox of seleccionados) {
    const card = checkbox.closest(".persona");
    const nombre = card.dataset.nombre;
    const span = card.querySelector(".contador");
    let valor = Number(span.dataset.valor || "10");

    valor += delta;
    valor = Math.min(10, Math.max(0, Number(valor.toFixed(1))));

    estado.set(nombre, valor);
    span.dataset.valor = valor.toFixed(1);
    span.textContent = valor.toFixed(1);

    span.classList.remove("rojo", "naranja", "verde");
    if (valor < 5) span.classList.add("rojo");
    else if (valor >= 5 && valor < 6) span.classList.add("naranja");
    else if (valor >= 6) span.classList.add("verde");

    bump(span);
  }
}

document.getElementById("btn-subir-seleccion").addEventListener("click", () => {
  actualizarSeleccionados(0.10);
});

document.getElementById("btn-bajar-seleccion").addEventListener("click", () => {
  actualizarSeleccionados(-0.10);
});
document.getElementById("btn-aleatorio").addEventListener("click", () => {
  const personas = Array.from(lista.querySelectorAll(".persona"));
  if (personas.length === 0) return;

  // Selecciona una al azar
  const aleatoria = personas[Math.floor(Math.random() * personas.length)];
  const nombre = aleatoria.dataset.nombre;
  const span = aleatoria.querySelector(".contador");

  let valor = Number(span.dataset.valor || "10");

  // Decide si subir o bajar
  const delta = Math.random() < 0.5 ? -0.5 : 0.5;
  valor += delta;
  valor = Math.min(10, Math.max(0, Number(valor.toFixed(1))));

  estado.set(nombre, valor);
  span.dataset.valor = valor.toFixed(1);
  span.textContent = valor.toFixed(1);

  // Actualiza color
  span.classList.remove("rojo", "naranja", "verde");
  if (valor < 5) span.classList.add("rojo");
  else if (valor >= 5 && valor < 6) span.classList.add("naranja");
  else if (valor >= 6) span.classList.add("verde");

  bump(span);
  setEstado(`Se ha modificado la nota de ${nombre} en ${delta > 0 ? '+' : ''}${delta}`);
});

// --------- Bootstrap ---------
// Opción A (recomendada en local con live server): intenta cargar nombres.txt
// Opción B: si falla, el usuario puede usar “Cargar archivo local”
cargarNombresDesdeTxt("nombres.txt").catch(() => {
  setEstado("Consejo: coloca un nombres.txt junto a esta página o usa 'Cargar archivo local'.");
});
lista.addEventListener("keydown", (ev) => {
  const span = ev.target.closest(".contador");
  if (!span) return;

  const card = span.closest(".persona");
  const nombre = card?.dataset.nombre;
  if (!estado.has(nombre)) return;

  let valor = Number(span.dataset.valor || "10");

  if (ev.key === "ArrowRight" && valor <= 9.9) valor += 0.1;
  if (ev.key === "ArrowLeft" && valor >= 0.1) valor -= 0.1;

  valor = Number(valor.toFixed(1));
  estado.set(nombre, valor);
  span.dataset.valor = valor.toFixed(1);
  span.textContent = valor.toFixed(1);

  // Limpia clases de color
  span.classList.remove("rojo", "naranja", "verde");

  // Aplica color según el valor
  if (valor < 5) span.classList.add("rojo");
  else if (valor >= 5 && valor < 6) span.classList.add("naranja");
  else if (valor >= 6) span.classList.add("verde");

  bump(span);
});
