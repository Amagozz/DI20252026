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

// NUEVAS referencias DOM para selector de archivos
const selectArchivo = document.getElementById('select-archivo');
const selectorArchivos = document.getElementById('selector-archivos');
const infoArchivos = document.getElementById('info-archivos');

// ========================
// Utilidades
// ========================

// Elimina acentos/diacríticos y espacios extras → usado para ordenar alfabéticamente
const STORAGE_KEY = 'contadores_clase_archivos_multiples'; 
const rankingListaUI = document.getElementById("ranking-lista"); // NUEVA CONSTANTE

// --------- Funciones de Guardar/Cargar Estado (localStorage) ---------

function guardarEstado() {
    try {
        const todosArchivos = {};
        archivosGestionados.forEach((estadoMap, nombreArchivo) => {
            todosArchivos[nombreArchivo] = Array.from(estadoMap.entries());
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            archivos: todosArchivos,
            activo: archivoActivo
        }));
    } catch (e) {
        console.error("Error al guardar estado en localStorage:", e);
    }
}

function cargarEstado() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const { archivos, activo } = JSON.parse(stored);
            archivosGestionados.clear();
            
            for (const [nombreArchivo, estadoArray] of Object.entries(archivos)) {
                const estadoMap = new Map();
                for (const [nombre, valor] of estadoArray) {
                    estadoMap.set(nombre, Number(valor));
                }
                archivosGestionados.set(nombreArchivo, estadoMap);
            }
            
            if (activo && archivosGestionados.has(activo)) {
                archivoActivo = activo;
                actualizarSelector();
                mostrarArchivo(archivoActivo);
                setEstado(`Cargados ${archivosGestionados.size} archivo(s) guardado(s).`);
                return true;
            }
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
  span.textContent = Number(valor.toFixed(1));
  span.dataset.valor = String(valor);
  
  // Aplicar color según valor
  span.classList.remove("verde", "verdeSuave","naranja", "rojo");
  if (valor >= 9) {
    span.classList.add("verde");
  } else if(valor >= 7){
    span.classList.add("verdeSuave");
  } else if (valor >= 5) {
    span.classList.add("naranja");
  } else {
    span.classList.add("rojo");
  }
  
  return node;
}

function bump(el) {
  el.classList.add("bump");
  setTimeout(() => el.classList.remove("bump"), 160);
}

function setEstado(msg) {
  estadoUI.textContent = msg ?? "";
}

// ========================
// NUEVO: Gestión de múltiples archivos
// ========================
const archivosGestionados = new Map(); // Almacena { nombreArchivo: Map(nombre -> valor) }
let archivoActivo = null; // Nombre del archivo actualmente visible

// Procesar y almacenar un archivo
function procesarArchivo(nombreArchivo, nombres) {
  const estadoMap = new Map();
  
  for (const nombre of nombres) {
    if (nombre.trim()) {
      estadoMap.set(nombre.trim(), 10);
    }
  }
  
  archivosGestionados.set(nombreArchivo, estadoMap);
  return estadoMap;
}

// Actualizar el selector de archivos
function actualizarSelector() {
  selectArchivo.innerHTML = '';
  
  archivosGestionados.forEach((estadoMap, nombreArchivo) => {
    const option = document.createElement('option');
    option.value = nombreArchivo;
    option.textContent = `${nombreArchivo} (${estadoMap.size} personas)`;
    selectArchivo.appendChild(option);
  });
  
  if (archivosGestionados.size > 0) {
    selectorArchivos.style.display = 'flex';
    infoArchivos.textContent = `${archivosGestionados.size} archivo(s) disponible(s)`;
    
    // Seleccionar el archivo activo en el dropdown
    if (archivoActivo) {
      selectArchivo.value = archivoActivo;
    }
  } else {
    selectorArchivos.style.display = 'none';
  }
}

// Mostrar archivo seleccionado
function mostrarArchivo(nombreArchivo) {
  const estadoMap = archivosGestionados.get(nombreArchivo);
  
  if (!estadoMap) return;
  
  // Copiar al estado global para compatibilidad con código existente
  estado.clear();
  estadoMap.forEach((valor, nombre) => {
    estado.set(nombre, valor);
  });
  
  renderLista();
  setEstado(`Mostrando: ${nombreArchivo} (${estadoMap.size} personas)`);
}

// Sincronizar cambios del estado global al archivo activo
function sincronizarEstadoActual() {
  if (!archivoActivo) return;
  
  const estadoMap = archivosGestionados.get(archivoActivo);
  if (!estadoMap) return;
  
  // Copiar todos los valores actuales al mapa del archivo
  estado.forEach((valor, nombre) => {
    estadoMap.set(nombre, valor);
  });
  
  guardarEstado();
}

// ========================
// Render de lista (modificado)
// ========================
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

// ========================
// Carga de nombres (modificado)
// ========================
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

  // Procesar y almacenar el archivo
  const nombreArchivo = url.split('/').pop();
  procesarArchivo(nombreArchivo, nombres);
  
  archivoActivo = nombreArchivo;
  actualizarSelector();
  mostrarArchivo(nombreArchivo);
  
  setEstado(`Cargados ${nombres.length} nombres desde ${nombreArchivo}.`);
}

// Carga desde archivos locales (MODIFICADO para soportar múltiples)
inputArchivo.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;
  
  try {
    for (const file of files) {
      const text = await file.text();
      let nombres;
      
      if (file.name.endsWith(".json")) {
        const arr = JSON.parse(text);
        nombres = Array.isArray(arr) ? arr : [];
      } else {
        nombres = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      }

      if (nombres.length > 0) {
        procesarArchivo(file.name, nombres);
      }
    }
    
    // Activar el último archivo cargado
    if (files.length > 0) {
      archivoActivo = files[files.length - 1].name;
    }
    
    actualizarSelector();
    mostrarArchivo(archivoActivo);
    setEstado(`Cargados ${files.length} archivo(s) local(es).`);
    
  } catch (err) {
    console.error(err);
    setEstado("Error al leer algún archivo local.");
  } finally {
    inputArchivo.value = "";
  }
});

// ========================
// Evento: cambiar archivo en el selector
// ========================
selectArchivo.addEventListener('change', (e) => {
  archivoActivo = e.target.value;
  mostrarArchivo(archivoActivo);
});

// ========================
// Interacción con tarjetas (modificado)
// ========================
function manejarInteraccion(ev) {
  const card = ev.target.closest(".persona");
  if (!card) return;
  
  const nombre = card.dataset.nombre;
  if (!estado.has(nombre)) return;

  const span = card.querySelector(".contador");
  let valor = Number(span.dataset.valor || "10");
  let nuevoValor = valor;
  let btn;

  if (ev.type === "click") {
    btn = ev.target.closest("button");
    if (!btn) return;

    if (btn.classList.contains("btn-redondeado-mas")) valor += 0.1;
    if (btn.classList.contains("btn-mas")) valor += 1;
    if (btn.classList.contains("btn-redondeado-menos")) valor -= 0.1;
    if (btn.classList.contains("btn-menos")) valor -= 1;

    if (valor > 10) valor = 10;
    if (valor < 0) valor = 0;

    if (btn.classList.contains("btn-muerte")) valor = 0;
    if (btn.classList.contains("btn-magico")) valor = Number((Math.random() * 10).toFixed(1));

    nuevoValor = valor;
  } else if (ev.type === "input" || ev.type === "change") {
    const slider = ev.target.closest(".contador-slider");
    if (!slider) return;
    nuevoValor = Number(slider.value);
    if (nuevoValor > 10) nuevoValor = 10;
    if (nuevoValor < 0) nuevoValor = 0;
  } else {
    return;
  }

  // Actualizar estado
  estado.set(nombre, Number(nuevoValor.toFixed(1)));
  span.dataset.valor = String(nuevoValor);
  span.textContent = Number(nuevoValor.toFixed(1));
  bump(span);

  // Aplicar colores
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
  
  // IMPORTANTE: Sincronizar con archivo activo
  sincronizarEstadoActual();
}

lista.addEventListener("click", manejarInteraccion);
lista.addEventListener("input", manejarInteraccion);
lista.addEventListener("change", manejarInteraccion);

// ========================
// Botones globales (modificados)
// ========================
btnReset.addEventListener("click", () => {
  for (const n of estado.keys()) estado.set(n, 10);
  renderLista();
  sincronizarEstadoActual();
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

// ========================
// Bootstrap
// ========================
// Intentar cargar estado guardado, si no existe cargar nombres.txt
if (!cargarEstado()) {
  cargarNombresDesdeTxt("nombres.txt").catch(() => {
    setEstado("Consejo: coloca un nombres.txt junto a esta página o usa 'Cargar archivo local'.");
  });
}
