// Estado simple en memoria: { nombre: valor }
const estado = new Map();
const lista = document.getElementById("lista");
const estadoUI = document.getElementById("estado");
const btnCargar = document.getElementById("btn-cargar-nombres");
const btnReset = document.getElementById("btn-reset");
const inputArchivo = document.getElementById("input-archivo");
const tpl = document.getElementById("tpl-persona");
const STORAGE_KEY = 'contadores_clase_estado'; 
const rankingListaUI = document.getElementById("ranking-lista"); // NUEVA CONSTANTE

// --------- Funciones de Guardar/Cargar Estado (localStorage) ---------

function guardarEstado() {
    try {
        const estadoArray = Array.from(estado.entries());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoArray));
    } catch (e) {
        console.error("Error al guardar estado en localStorage:", e);
    }
}

function cargarEstado() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const estadoArray = JSON.parse(stored);
            estado.clear();
            for (const [nombre, valor] of estadoArray) {
                estado.set(nombre, Number(valor)); 
            }
            setEstado(`Cargados ${estado.size} contadores guardados.`);
            return true;
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
  span.textContent = valor;
  span.dataset.valor = String(valor);
  
    // Inicializar el valor del slider
    const slider = node.querySelector(".contador-slider");
    if (slider) {
        slider.value = valor;
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
    // Llamar a la función de ranking después de renderizar la lista principal
    renderRanking(); 
}

// Función para calcular y renderizar el Ranking
function renderRanking() {
    if (estado.size === 0) {
        rankingListaUI.innerHTML = '<li>No hay contadores cargados.</li>';
        return;
    }

    // 1. Convertir el Map a un array de objetos [nombre, valor]
    const rankingArray = Array.from(estado.entries())
        .map(([nombre, valor]) => ({ nombre, valor }));
        
    // 2. Ordenar: de mayor valor a menor. Si los valores son iguales, ordenar por nombre.
    rankingArray.sort((a, b) => {
        // Ordenar por valor (descendente)
        if (a.valor !== b.valor) {
            return b.valor - a.valor;
        }
        // Si los valores son iguales, ordenar por nombre (alfabético)
        return normalizaNombre(a.nombre).localeCompare(normalizaNombre(b.nombre));
    });

    // 3. Crear el HTML para la lista
    const html = rankingArray.map(item => `
        <li>
            <span>${item.nombre}</span>
            <span class="ranking-valor">${item.valor.toFixed(1)}</span>
        </li>
    `).join('');

    rankingListaUI.innerHTML = html;
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
  guardarEstado();
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
  guardarEstado(); 
  setEstado(`Cargados ${nombres.length} nombres desde archivo local.`);
}

// --------- Interacción (Maneja Clicks y Sliders) ---------
function manejarInteraccion(ev) {
    const card = ev.target.closest(".persona");
    if (!card) return;
    
    const nombre = card.dataset.nombre;
    if (!estado.has(nombre)) return;

    const span = card.querySelector(".contador");
    let valor = Number(span.dataset.valor || "10");
    let nuevoValor = valor;
    
    // Lógica para botones (+1 / -1)
    if (ev.type === "click") {
        const btn = ev.target.closest("button");
        if (!btn) return;
        
        if (btn.classList.contains("btn-mas")) {
            nuevoValor = Math.min(10, valor + 0.1);
        } else if (btn.classList.contains("btn-menos")) {
            nuevoValor = valor - 0.1;
        }
        
        // Redondea a un decimal
        nuevoValor = Number(nuevoValor.toFixed(1));
    
    // Lógica para el slider (input / change)
    } else if (ev.type === "input" || ev.type === "change") {
        const slider = ev.target.closest(".contador-slider");
        if (!slider) return;

        nuevoValor = Number(slider.value);
    } else {
        return;
    }

    if (nuevoValor === valor) return;
    
    // Aplicar el nuevo valor
    estado.set(nombre, nuevoValor);
    span.dataset.valor = String(nuevoValor);
    span.textContent = nuevoValor;
    bump(span);
    
    // Sincronizar el slider si el cambio vino de un botón
    const slider = card.querySelector(".contador-slider");
    if (slider) {
        slider.value = nuevoValor;
    }
    
    guardarEstado(); // Persistir el cambio
    renderRanking(); // Actualizar el ranking en tiempo real
}

// Delegación: un solo listener para todos los botones Y el slider
lista.addEventListener("click", manejarInteraccion);
lista.addEventListener("input", manejarInteraccion); // Para movimiento continuo del slider
lista.addEventListener("change", manejarInteraccion); // Para valor final del slider


btnReset.addEventListener("click", () => {
  for (const n of estado.keys()) estado.set(n, 10);
  renderLista();
  setEstado("Todos los contadores han sido reiniciados a 10.");
  guardarEstado();
  renderRanking(); // Actualizar el ranking después del reset
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

// --------- Bootstrap (Carga inicial) ---------
if (cargarEstado()) {
    renderLista();
} else {
    cargarNombresDesdeTxt("nombres.txt").catch(() => {
        setEstado("Consejo: coloca un nombres.txt junto a esta página o usa 'Cargar archivo local'.");
    });
}