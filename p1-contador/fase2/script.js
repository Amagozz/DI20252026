// Estado simple en memoria: { nombre: valor }
const estado = new Map();
const lista = document.getElementById("lista");
const estadoUI = document.getElementById("estado");
const btnCargar = document.getElementById("btn-cargar-nombres");
const btnReset = document.getElementById("btn-reset");
const inputArchivo = document.getElementById("input-archivo");
const tpl = document.getElementById("tpl-persona");

// Elementos para selección múltiple
const controlesSeleccion = document.getElementById("controles-seleccion");
const contadorSeleccionados = document.getElementById("contador-seleccionados");
const btnSeleccionarTodos = document.getElementById("btn-seleccionar-todos");
const btnSeleccionadosCero = document.getElementById("btn-seleccionados-cero");
const btnSeleccionadosMas = document.getElementById("btn-seleccionados-mas");
const btnSeleccionadosMenos = document.getElementById("btn-seleccionados-menos");
const btnSeleccionadosReset = document.getElementById("btn-seleccionados-reset");
const btnDeseleccionar = document.getElementById("btn-deseleccionar");

// --------- Utilidades ---------
function normalizaNombre(s) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

function renderPersona(nombre, valor = 10) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.nombre = nombre;
  node.querySelector(".nombre").textContent = nombre;
  const span = node.querySelector(".contador");
  span.textContent = valor.toFixed(2);
  span.dataset.valor = String(valor);
  
  // Aplicar color según el valor
  span.classList.remove("rojo", "verde");
  if (valor <= 5) {
    span.classList.add("rojo");
  } else if (valor >= 6) {
    span.classList.add("verde");
  }
  
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

// --------- Funciones de selección múltiple ---------
function actualizarControlesSeleccion() {
  const checkboxes = document.querySelectorAll('.selector-alumno:checked');
  const cantidad = checkboxes.length;
  
  if (cantidad > 0) {
    controlesSeleccion.style.display = 'flex';
    contadorSeleccionados.textContent = `${cantidad} alumno${cantidad > 1 ? 's' : ''} seleccionado${cantidad > 1 ? 's' : ''}`;
  } else {
    controlesSeleccion.style.display = 'none';
  }
}

function seleccionarTodosAlumnos() {
  const checkboxes = document.querySelectorAll('.selector-alumno');
  checkboxes.forEach(cb => cb.checked = true);
  actualizarControlesSeleccion();
}

function aplicarAccionASeleccionados(accion) {
  const checkboxes = document.querySelectorAll('.selector-alumno:checked');
  
  checkboxes.forEach(checkbox => {
    const card = checkbox.closest('.persona');
    const nombre = card.dataset.nombre;
    const span = card.querySelector('.contador');
    let valor = Number(span.dataset.valor || "10");
    
    switch(accion) {
      case 'cero':
        valor = 0;
        break;
      case 'mas':
        valor += 0.1;
        break;
      case 'menos':
        valor -= 0.1;
        break;
      case 'reset':
        valor = 10;
        break;
    }
    
    // Aplicar límites
    valor = Math.max(0, Math.min(10, valor));
    
    // Actualizar estado y UI
    estado.set(nombre, valor);
    span.dataset.valor = String(valor);
    span.textContent = valor.toFixed(1);
    
    // Aplicar color según el valor
    span.classList.remove("rojo", "verde");
    if (valor <= 5) {
      span.classList.add("rojo");
    } else if (valor >= 6) {
      span.classList.add("verde");
    }
    
    bump(span);
  });
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

// Variables para el sistema de mantener pulsado
let intervalId = null;
let timeoutId = null;
let intervalIdSeleccionados = null;
let timeoutIdSeleccionados = null;

// Función para actualizar contador individual
function actualizarContador(card, accion) {
  const nombre = card.dataset.nombre;
  if (!estado.has(nombre)) return;

  const span = card.querySelector(".contador");
  let valor = Number(span.dataset.valor || "10");


  if (btn.classList.contains("btn-mas")) valor += 1;
  if (btn.classList.contains("btn-menos")) valor -= 1;

  estado.set(nombre, valor);
  span.dataset.valor = String(valor);
  span.textContent = valor.toFixed(1);
  
  // Aplicar color según el valor
  span.classList.remove("rojo", "verde");
  if (valor <= 5) {
    span.classList.add("rojo");
  } else if (valor >= 6) {
    span.classList.add("verde");
  }
  
  bump(span);
}

// Función para iniciar el incremento/decremento continuo
function iniciarAccionContinua(card, accion) {
  // Limpiar cualquier intervalo previo
  if (intervalId) clearInterval(intervalId);
  if (timeoutId) clearTimeout(timeoutId);
  
  // Ejecutar la primera acción inmediatamente
  actualizarContador(card, accion);
  
  // Si es la acción "cero", no necesita repetirse
  if (accion === "cero") return;
  
  // Iniciar después de 500ms para evitar activación accidental
  timeoutId = setTimeout(() => {
    intervalId = setInterval(() => {
      actualizarContador(card, accion);
    }, 100); // Repetir cada 100ms
  }, 500);
}

// Función para detener la acción continua
function detenerAccionContinua() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}

// Función para aplicar acción continua a seleccionados
function iniciarAccionContinuaSeleccionados(accion) {
  // Limpiar cualquier intervalo previo
  if (intervalIdSeleccionados) clearInterval(intervalIdSeleccionados);
  if (timeoutIdSeleccionados) clearTimeout(timeoutIdSeleccionados);
  
  // Ejecutar la primera acción inmediatamente
  aplicarAccionASeleccionados(accion);
  
  // Si es la acción "cero" o "reset", no necesita repetirse
  if (accion === "cero" || accion === "reset") return;
  
  // Iniciar después de 500ms para evitar activación accidental
  timeoutIdSeleccionados = setTimeout(() => {
    intervalIdSeleccionados = setInterval(() => {
      aplicarAccionASeleccionados(accion);
    }, 100); // Repetir cada 100ms
  }, 500);
}

// Función para detener la acción continua de seleccionados
function detenerAccionContinuaSeleccionados() {
  if (intervalIdSeleccionados) {
    clearInterval(intervalIdSeleccionados);
    intervalIdSeleccionados = null;
  }
  if (timeoutIdSeleccionados) {
    clearTimeout(timeoutIdSeleccionados);
    timeoutIdSeleccionados = null;
  }
}

// --------- Interacción ---------
// Delegación: click para acción simple
lista.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const card = btn.closest(".persona");
  if (!card) return;

  let accion = null;
  if (btn.classList.contains("btn-mas")) accion = "mas";
  if (btn.classList.contains("btn-menos")) accion = "menos";
  if (btn.classList.contains("btn-cero")) accion = "cero";
  
  if (accion) {
    actualizarContador(card, accion);
  }
});

// Delegación: mousedown para iniciar acción continua
lista.addEventListener("mousedown", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const card = btn.closest(".persona");
  if (!card) return;

  ev.preventDefault(); // Prevenir selección de texto
  
  let accion = null;
  if (btn.classList.contains("btn-mas")) accion = "mas";
  if (btn.classList.contains("btn-menos")) accion = "menos";
  if (btn.classList.contains("btn-cero")) accion = "cero";
  
  if (accion) {
    iniciarAccionContinua(card, accion);
  }
});

// Detener acción al soltar el botón
lista.addEventListener("mouseup", detenerAccionContinua);
lista.addEventListener("mouseleave", detenerAccionContinua);

// También detener si el mouse sale del botón
lista.addEventListener("mouseleave", (ev) => {
  if (ev.target.closest("button")) {
    detenerAccionContinua();
  }
});

// Prevenir el menú contextual en los botones
lista.addEventListener("contextmenu", (ev) => {
  if (ev.target.closest("button")) {
    ev.preventDefault();
  }
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

// Event listeners para selección múltiple
lista.addEventListener("change", (ev) => {
  if (ev.target.classList.contains("selector-alumno")) {
    actualizarControlesSeleccion();
  }
});

btnSeleccionadosCero.addEventListener("click", () => {
  aplicarAccionASeleccionados('cero');
  setEstado("Contadores seleccionados puestos en 0.");
});

btnSeleccionadosMas.addEventListener("click", () => {
  aplicarAccionASeleccionados('mas');
  setEstado("Sumado 0.1 a los contadores seleccionados.");
});

btnSeleccionadosMenos.addEventListener("click", () => {
  aplicarAccionASeleccionados('menos');
  setEstado("Restado 0.1 a los contadores seleccionados.");
});

btnSeleccionadosReset.addEventListener("click", () => {
  aplicarAccionASeleccionados('reset');
  setEstado("Contadores seleccionados reiniciados a 10.");
});

// Event listeners para selección múltiple con hold-down
btnSeleccionadosCero.addEventListener("mousedown", (ev) => {
  ev.preventDefault();
  aplicarAccionASeleccionados('cero');
  setEstado("Contadores seleccionados puestos en 0.");
});

btnSeleccionadosMas.addEventListener("mousedown", (ev) => {
  ev.preventDefault();
  iniciarAccionContinuaSeleccionados('mas');
  setEstado("Sumando 0.1 a los contadores seleccionados...");
});

btnSeleccionadosMenos.addEventListener("mousedown", (ev) => {
  ev.preventDefault();
  iniciarAccionContinuaSeleccionados('menos');
  setEstado("Restando 0.1 a los contadores seleccionados...");
});

btnSeleccionadosReset.addEventListener("mousedown", (ev) => {
  ev.preventDefault();
  aplicarAccionASeleccionados('reset');
  setEstado("Contadores seleccionados reiniciados a 10.");
});

// Detener acciones continuas en botones de selección múltiple
[btnSeleccionadosMas, btnSeleccionadosMenos].forEach(btn => {
  btn.addEventListener("mouseup", detenerAccionContinuaSeleccionados);
  btn.addEventListener("mouseleave", detenerAccionContinuaSeleccionados);
});

// Prevenir menú contextual en botones de selección
[btnSeleccionarTodos, btnSeleccionadosCero, btnSeleccionadosMas, btnSeleccionadosMenos, btnSeleccionadosReset, btnDeseleccionar].forEach(btn => {
  btn.addEventListener("contextmenu", (ev) => ev.preventDefault());
});

btnSeleccionarTodos.addEventListener("click", () => {
  seleccionarTodosAlumnos();
  setEstado("Todos los alumnos seleccionados.");
});

btnDeseleccionar.addEventListener("click", () => {
  const checkboxes = document.querySelectorAll('.selector-alumno:checked');
  checkboxes.forEach(cb => cb.checked = false);
  actualizarControlesSeleccion();
  setEstado("Todos los alumnos deseleccionados.");
});

// --------- Bootstrap ---------
// Opción A (recomendada en local con live server): intenta cargar nombres.txt
// Opción B: si falla, el usuario puede usar “Cargar archivo local”
cargarNombresDesdeTxt("nombres.txt").catch(() => {
  setEstado("Consejo: coloca un nombres.txt junto a esta página o usa 'Cargar archivo local'.");
});
