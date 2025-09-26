// Estado simple en memoria: { nombre: valor }
const estado = new Map();
const lista = document.getElementById("lista");
const estadoUI = document.getElementById("estado");
const btnCargar = document.getElementById("btn-cargar-nombres");
const btnReset = document.getElementById("btn-reset");
const inputArchivo = document.getElementById("input-archivo");
const tpl = document.getElementById("tpl-persona");

const inputNota = document.getElementById("input-nota");
const btnAsignarNota = document.getElementById("btn-asignar-nota");

// --------- Utilidades ---------
function efectoColor(span) {
  const valor = parseFloat(span.textContent);
  if (valor > 8) span.style.color = "green";
  else if (valor > 5) span.style.color = "orange";
  else if (valor > 0) span.style.color = "red";
  else span.style.color = "black";
}

function normalizaNombre(s) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function formatValor(v) {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

function bump(el) {
  el.classList.add("bump");
  setTimeout(() => el.classList.remove("bump"), 160);
}

// --------- Render de personas ---------
function renderPersona(nombre, valor = 10) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.nombre = nombre;
  node.querySelector(".nombre").textContent = nombre;

  const span = node.querySelector(".contador");
  span.textContent = formatValor(valor);
  span.dataset.valor = String(valor);
  span.contentEditable = true;

  // Validación al perder foco
  span.addEventListener("blur", () => {
    let v = parseFloat(span.textContent.replace(",", "."));
    if (isNaN(v) || v < 0 || v > 10) {
      span.textContent = formatValor(parseFloat(span.dataset.valor));
      return;
    }
    v = Math.round(v * 10) / 10; // Limita a un decimal
    span.dataset.valor = String(v);
    span.textContent = formatValor(v);
    estado.set(nombre, v);
    efectoColor(span);
    bump(span);
  });

  // Selección de tarjeta al hacer clic (evita botones)
  node.addEventListener("click", (ev) => {
    if (
      ev.target.closest("button") || // si clicas un botón
      ev.target.isContentEditable // si clicas el contador editable
    ) {
      return;
    }
    node.classList.toggle("seleccionado");
  });

  efectoColor(span);
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
    const nodo = renderPersona(n, v);
    lista.appendChild(nodo);
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
    nombres = text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (nombres.length === 0) throw new Error("El archivo no contiene nombres.");

  for (const n of nombres) {
    if (!estado.has(n)) estado.set(n, 10);
  }
  renderLista();
  setEstado(`Cargados ${nombres.length} nombres.`);
}

async function cargarDesdeArchivoLocal(file) {
  const text = await file.text();
  let nombres;
  if (file.name.endsWith(".json")) {
    const arr = JSON.parse(text);
    nombres = Array.isArray(arr) ? arr : [];
  } else {
    nombres = text
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (nombres.length === 0) throw new Error("El archivo no contiene nombres.");

  for (const n of nombres) {
    if (!estado.has(n)) estado.set(n, 10);
  }
  renderLista();
  setEstado(`Cargados ${nombres.length} nombres desde archivo local.`);
}

// --------- Botón Seleccionar todos ---------
const btnSeleccionarTodos = document.getElementById("btn-seleccionar-todos");

btnSeleccionarTodos.addEventListener("click", () => {
  const cards = lista.querySelectorAll(".persona");
  const todosSeleccionados = Array.from(cards).every((card) =>
    card.classList.contains("seleccionado")
  );

  if (todosSeleccionados) {
    // 🔹 Si ya están todos seleccionados → deseleccionamos
    cards.forEach((card) => card.classList.remove("seleccionado"));
    setEstado("Todos los alumnos han sido deseleccionados.");
    btnSeleccionarTodos.textContent = "Seleccionar todos";
  } else {
    // 🔹 Si no → seleccionamos todos
    cards.forEach((card) => card.classList.add("seleccionado"));
    setEstado("Todos los alumnos han sido seleccionados.");
    btnSeleccionarTodos.textContent = "Deseleccionar todos";
  }
});

// --------- Botones de interacción ---------

lista.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const card = btn.closest(".persona");
  if (!card) return;

  const nombre = card.dataset.nombre;
  const span = card.querySelector(".contador");
  let valor = parseFloat(span.dataset.valor || "10");

  if (btn.classList.contains("btn-mas")) valor += 0.1;
  if (btn.classList.contains("btn-menos")) valor -= 0.1;

  if (valor < 0 || valor > 10) return;

  valor = Math.round(valor * 10) / 10;
  estado.set(nombre, valor);
  span.dataset.valor = String(valor);
  span.textContent = formatValor(valor);
  efectoColor(span);
  bump(span);
});

// --------- Asignar nota a los seleccionados ---------
btnAsignarNota.addEventListener("click", () => {
  const nota = parseFloat(inputNota.value);
  if (isNaN(nota) || nota < 0 || nota > 10) {
    alert("Ingresa una nota válida entre 0 y 10");
    return;
  }

  const seleccionados = lista.querySelectorAll(".persona.seleccionado");
  if (seleccionados.length === 0) {
    alert("Selecciona al menos un alumno haciendo clic en su tarjeta.");
    return;
  }

  seleccionados.forEach((card) => {
    const nombre = card.dataset.nombre;
    estado.set(nombre, nota);
    const span = card.querySelector(".contador");
    span.dataset.valor = String(nota);
    span.textContent = formatValor(nota);
    efectoColor(span);
    bump(span);
    card.classList.remove("seleccionado");
  });

  inputNota.value = "";
});

// --------- Reset y carga ---------
btnReset.addEventListener("click", () => {
  for (const n of estado.keys()) estado.set(n, 10);
  renderLista();
  setEstado("Todos los contadores han sido reiniciados a 10.");
});

btnCargar.addEventListener("click", async () => {
  try {
    await cargarNombresDesdeTxt("nombres.txt");
  } catch {
    setEstado("No se pudo cargar nombres.txt. Usa archivo local.");
  }
});

inputArchivo.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    await cargarDesdeArchivoLocal(file);
  } finally {
    inputArchivo.value = "";
  }
});

// Bootstrap inicial
cargarNombresDesdeTxt("nombres.txt").catch(() => {
  setEstado("Coloca nombres.txt o usa archivo local.");
});
