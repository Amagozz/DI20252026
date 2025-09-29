// Estado simple en memoria: { nombre: valor }
//estado es donde guardamos la informacion de casa persona, nombre y nota
const estado = new Map();
const lista = document.getElementById("lista");
const estadoUI = document.getElementById("estado");
const btnCargar = document.getElementById("btn-cargar-nombres");
const btnReset = document.getElementById("btn-reset");
const inputArchivo = document.getElementById("input-archivo");
//plantilla HTML que sirve para crear la tarjeta de cada persona.
const tpl = document.getElementById("tpl-persona");

//array caja misteriosa
const accionesSorpresa = [
  { texto: "Tus puntos se duplican", efecto: (valor) => valor * 2 },
  { texto: "Pierdes 3 puntos", efecto: (valor) => valor - 3 },
  { texto: "Ganas 5 puntos", efecto: (valor) => valor + 5 },
  { texto: "Pierdes la mitad", efecto: (v) => Math.floor(v / 2) },
  { texto: "¡Estás a salvo! No pasa nada, menudo FAIL", efecto: (v) => v } // no cambia nada
];


// --------- Utilidades ---------
function normalizaNombre(s) {
  //devuelve los nobres sin acentos, para asi poder ordenarlos bien.
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

//Crea la tarjeta de una persona
// Copia el HTML del template, Pone el nombre, valor del contador, devuelve el elemento listo para insertarlo en la página.
function renderPersona(nombre, valor = 10) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.nombre = nombre;
  node.querySelector(".nombre").textContent = nombre;
  const span = node.querySelector(".contador");
  span.textContent = valor;
  span.dataset.valor = String(valor);
  return node;
}
//animación corta cuando cambia el número.
function bump(el) {
  el.classList.add("bump");
  setTimeout(() => el.classList.remove("bump"), 160);
}

// coge los nombre de estado, los ordena y los muestra en una tarjeta cada uno
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

    // detectamos todos los seleccionados
  const seleccionados = lista.querySelectorAll(".check-seleccion:checked");

  // si hay más de uno, trabajamos con todos; si no, solo con la tarjeta clicada
  let cardsObjetivo;
  if (seleccionados.length > 1) {
    cardsObjetivo = [];
    for (let i = 0; i < seleccionados.length; i++) {
      cardsObjetivo.push(seleccionados[i].closest(".persona"));
    }
  } else {
    cardsObjetivo = [card];
  }

  // recorrer cada tarjeta objetivo
  for (let i = 0; i < cardsObjetivo.length; i++) {
    const c = cardsObjetivo[i];
    const nombre = c.dataset.nombre;
    if (!estado.has(nombre)) continue;

    let valor = estado.get(nombre) ?? 10;

    // acciones de botones
    if (btn.classList.contains("btn-mas")) valor += 1;
    if (btn.classList.contains("btn-menos")) valor -= 1;
    if (btn.classList.contains("btn-decimal-menos")) valor -= 0.1;
    if (btn.classList.contains("btn-decimal-mas")) valor += 0.1;
    if (btn.classList.contains("btn-muerte")) valor = 0;
    if (btn.classList.contains("btn-reset")) valor = 10;

    if (btn.classList.contains("btn-sorpresa")) {
      if (valor < 5) {
        const accion = accionesSorpresa[Math.floor(Math.random() * accionesSorpresa.length)];
        valor = accion.efecto(valor);
        setEstado(`${nombre}: ${accion.texto}`);
      } else {
        setEstado(`${nombre}: Solo puedes usar la caja sorpresa si tienes menos de 5 puntos`);
      }
    }

    // límites
    if (valor > 10) valor = 10;
    if (valor < 0) valor = 0;

    // actualizar estado y UI
    estado.set(nombre, valor);
    const span = c.querySelector(".contador");
    span.dataset.valor = String(valor);
    span.textContent = valor.toFixed(1);
    bump(span);
  }
});
//boton reset
btnReset.addEventListener("click", () => {
  for (const n of estado.keys()) estado.set(n, 10);
  renderLista();
  setEstado("Todos los contadores han sido reiniciados a 10.");
});

//boton cargar archivo remoto
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

// Seleccionar todos
document.getElementById("btn-seleccionar-todos").addEventListener("click", () => {
  const checkboxes = lista.querySelectorAll(".check-seleccion");
  checkboxes.forEach(chk => chk.checked = true);
  setEstado(`Se han seleccionado ${checkboxes.length} personas`);
});

// Deseleccionar todos
document.getElementById("btn-deseleccionar-todos").addEventListener("click", () => {
  const checkboxes = lista.querySelectorAll(".check-seleccion");
  checkboxes.forEach(chk => chk.checked = false);
  setEstado("Se han deseleccionado todas las personas");
});

// --------- Bootstrap ---------
// Opción A (recomendada en local con live server): intenta cargar nombres.txt
// Opción B: si falla, el usuario puede usar “Cargar archivo local”
cargarNombresDesdeTxt("nombres.txt").catch(() => {
  setEstado("Consejo: coloca un nombres.txt junto a esta página o usa 'Cargar archivo local'.");
});
