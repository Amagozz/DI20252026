// Estado simple en memoria: { nombre: valor }
const estado = new Map();
const lista = document.getElementById("lista");
const estadoUI = document.getElementById("estado");
const tpl = document.getElementById("tpl-persona");
const inputArchivo = document.getElementById("input-archivo");
const btnCargar = document.getElementById("btn-cargar-nombres");
const btnReset = document.getElementById("btn-reset");
const btnSeleccionarTodos = document.getElementById("btn-seleccionar-todos");
const btnDeseleccionarTodos = document.getElementById("btn-deseleccionar-todos");

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
  // busca si el click fue en un botón.
  if (!btn) return;

  //busca todas las tarjetas seleccionadas
  // --- lógica múltiple (si hay seleccionadas) ---
  const seleccionadas = lista.querySelectorAll(".persona.selected");
  if (seleccionadas.length > 0) {
    // si hay seleccionadas, aplicamos la acción a todas
    //recorremos las seleccionadas y obtenemos su nombre y su valor actual del estado
    seleccionadas.forEach(card => {
      const nombre = card.dataset.nombre;
      if (!estado.has(nombre)) return;
      let valor = estado.get(nombre) ?? 10;
      //incrementamos o decrementamos según el botón
      if (btn.classList.contains("btn-mas")) valor += 1;
      if (btn.classList.contains("btn-menos")) valor -= 1;

      estado.set(nombre, valor);
      const span = card.querySelector(".contador");
      //actualizamos el estado y el DOM
      span.dataset.valor = String(valor);
      span.textContent = valor;
      bump(span);
    });
    return; // salimos, ya no seguimos con la lógica individual
  }

  // --- lógica individual (si no hay seleccionadas) ---
  const card = btn.closest(".persona");
  if (!card) return;

  const nombre = card.dataset.nombre;
  if (!estado.has(nombre)) return;

  const span = card.querySelector(".contador");
  let valor = Number(span.dataset.valor || "10");

  if (btn.classList.contains("btn-mas")) valor += 1;
  if (btn.classList.contains("btn-menos")) valor -= 1;

  estado.set(nombre, valor);
  span.dataset.valor = String(valor);
  span.textContent = valor;
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


// Seleccionar/deseleccionar una tarjeta con click en su checkbox
lista.addEventListener("click", function(event) {
  if (event.target.classList.contains("check-seleccion")) {
    const card = event.target.closest(".persona");
    if (card) {
      card.classList.toggle("selected", event.target.checked);
    }
  }
});


// Seleccionar todos
document.getElementById("btn-seleccionar-todos").addEventListener("click", () => {
  const checkboxes = lista.querySelectorAll(".check-seleccion");
  checkboxes.forEach(chk => {
    chk.checked = true;
    chk.closest(".persona").classList.add("selected");
  });
  setEstado(`Se han seleccionado ${checkboxes.length} personas`);
});

// Deseleccionar todos
document.getElementById("btn-deseleccionar-todos").addEventListener("click", () => {
  const checkboxes = lista.querySelectorAll(".check-seleccion");
  checkboxes.forEach(chk => {
    chk.checked = false;
    chk.closest(".persona").classList.remove("selected");
  });
  setEstado("Se han deseleccionado todas las personas");
})



// --------- Bootstrap ---------
// Opción A (recomendada en local con live server): intenta cargar nombres.txt
// Opción B: si falla, el usuario puede usar “Cargar archivo local”
cargarNombresDesdeTxt("nombres.txt").catch(() => {
  setEstado("Consejo: coloca un nombres.txt junto a esta página o usa 'Cargar archivo local'.");
});
