// Estado simple en memoria: { nombre: valor }
const estado = new Map();
const lista = document.getElementById("lista");
const estadoUI = document.getElementById("estado");
const btnCargar = document.getElementById("btn-cargar-nombres");
const btnReset = document.getElementById("btn-reset");
const inputArchivo = document.getElementById("input-archivo");
const tpl = document.getElementById("tpl-persona");
const btnReset5 = document.getElementById("btn-reset-5");
const btnReset0 = document.getElementById("btn-reset-0");
const btnMas = document.getElementById("btn-mas-global");
const btnMenos = document.getElementById("btn-menos-global");


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
  const card = ev.target.closest(".persona");

  // Si es un botón (+/-/reset individual)
  if (btn && card) {
    const nombre = card.dataset.nombre;
    if (!estado.has(nombre)) return;
    const span = card.querySelector(".contador");
    let valor = Number(span.dataset.valor || "10");

    if (btn.classList.contains("btn-mas")) valor += 0.1;
    if (btn.classList.contains("btn-menos")) valor -= 0.1;
    if (btn.classList.contains("btn-reset-individual")) valor = 10;

    valor = Math.min(10, Math.max(0, parseFloat(valor.toFixed(1))));

    estado.set(nombre, valor);
    span.dataset.valor = String(valor);
    span.textContent = valor.toFixed(1);
    actualizarColor(span, valor);
    bump(span);
    return; // ya procesado, no sigue al siguiente bloque
  }

  // Si no es un botón, manejamos la selección
  if (card) {
    if (ev.ctrlKey || ev.metaKey) {
      card.classList.toggle("seleccionada");
    } else {
      document.querySelectorAll(".persona.seleccionada").forEach(c => c.classList.remove("seleccionada"));
      card.classList.add("seleccionada");
    }
  }
});


btnReset.addEventListener("click", () => {
  for (const n of estado.keys()) estado.set(n, 10);
  renderLista();
  setEstado("Todos los contadores han sido reiniciados a 10.");
});

btnReset5.addEventListener("click", () => {
  for (const n of estado.keys()) estado.set(n, 5);
  renderLista();
  setEstado("Todos los contadores han sido reiniciados a 5.");
});

btnReset0.addEventListener("click", () => {
  for (const n of estado.keys()) estado.set(n, 0);
  renderLista();
  setEstado("Todos los contadores han sido reiniciados a 0.");
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

function actualizarColor(span, valor) {
  if (valor <= 5) {
    span.style.color = "red";
  } else if (valor <= 7) {
    span.style.color = "orange";
  } else {
    span.style.color = "green";
  }
}

function modificarSeleccionadas(cambio) {
  const seleccionadas = document.querySelectorAll(".persona.seleccionada");
  seleccionadas.forEach(card => {
    const nombre = card.dataset.nombre;
    const span = card.querySelector(".contador");
    let valor = Number(span.dataset.valor || "10");

    valor += cambio;              // +0.1 o -0.1
    valor = Math.min(10, Math.max(0, parseFloat(valor.toFixed(1))));

    estado.set(nombre, valor);
    span.dataset.valor = String(valor);
    span.textContent = valor.toFixed(1);
    actualizarColor(span, valor);
    bump(span);
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") modificarSeleccionadas(0.1);
  if (e.key === "ArrowDown") modificarSeleccionadas(-0.1);
});

function resetSeleccionadas(valor) {
  const seleccionadas = document.querySelectorAll(".persona.seleccionada");
  seleccionadas.forEach(card => {
    const nombre = card.dataset.nombre;
    const span = card.querySelector(".contador");
    estado.set(nombre, valor);
    span.dataset.valor = String(valor);
    span.textContent = valor.toFixed(1);
    actualizarColor(span, valor);
    bump(span);
  });
}

btnMas.addEventListener("click", () => modificarSeleccionadas(0.1));
btnMenos.addEventListener("click", () => modificarSeleccionadas(-0.1));

