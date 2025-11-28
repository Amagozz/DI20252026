// Estado simple en memoria: { nombre: valor }
const estado = new Map();
const lista = document.getElementById("lista");
const estadoUI = document.getElementById("estado");
const btnCargar = document.getElementById("btn-cargar-nombres");
const btnReset = document.getElementById("btn-reset");
const inputArchivo = document.getElementById("input-archivo");
const tpl = document.getElementById("tpl-persona");
const STORAGE_KEY = 'contadores_clase_estado'; 
const rankingListaUI = document.getElementById("ranking-lista");
const btnAgregarNombre = document.getElementById("btn-agregar-nombre");

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
        return false;
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
    const nombreEl = node.querySelector(".nombre");
    if (nombreEl) nombreEl.textContent = nombre;

    // Asegúrate de que el template tiene .contador y botones si esperas esas acciones
    const span = node.querySelector(".contador");
    if (span) {
        span.textContent = valor;
        span.dataset.valor = String(valor);
        span.title = "Doble click para editar";
    }
    return node;
}

function bump(el) {
    if (!el) return;
    el.classList.add("bump");
    setTimeout(() => el.classList.remove("bump"), 160);
}

// Render completo desde estado
// NOTE: ahora respeta el orden de inserción en 'estado' para mantener el orden drag-and-drop.
function renderLista() {
    lista.innerHTML = "";
    for (const [nombre, valor] of estado.entries()) {
        lista.appendChild(renderPersona(nombre, valor ?? 10));
    }
    // Llamar a la función de ranking después de renderizar la lista principal
    renderRanking();
}

// Mensaje de estado accesible
function setEstado(msg) {
    estadoUI.textContent = msg ?? "";
}

// --------- Animación FLIP para el ranking ---------
function renderRanking() {
    if (estado.size === 0) {
        rankingListaUI.innerHTML = '<li>No hay contadores cargados.</li>';
        return;
    }

    const rankingArray = Array.from(estado.entries())
        .map(([nombre, valor]) => ({ nombre, valor }))
        .sort((a, b) => {
            if (a.valor !== b.valor) return b.valor - a.valor;
            return normalizaNombre(a.nombre).localeCompare(normalizaNombre(b.nombre));
        });

    // FLIP: posiciones iniciales
    const itemsAntiguos = Array.from(rankingListaUI.children);
    const posicionesIniciales = new Map();
    itemsAntiguos.forEach(item => {
        const nombre = item.dataset.nombre;
        if (nombre) posicionesIniciales.set(nombre, item.getBoundingClientRect());
    });

    // Generar nuevo HTML con data-valor (entero para CSS selectors)
    rankingListaUI.innerHTML = rankingArray.map(item => `
        <li data-nombre="${item.nombre}" data-valor="${Math.floor(item.valor)}" class="ranking-animado">
            <span class="ranking-nombre">${item.nombre}</span>
            <span class="ranking-valor">${Number(item.valor).toFixed(1)}</span>
        </li>
    `).join('');

    // FLIP: animar cambios
    const itemsNuevos = Array.from(rankingListaUI.children);
    itemsNuevos.forEach(item => {
        const nombre = item.dataset.nombre;
        const posInicial = posicionesIniciales.get(nombre);
        if (posInicial) {
            const posFinal = item.getBoundingClientRect();
            const deltaY = posInicial.top - posFinal.top;
            if (deltaY !== 0) {
                item.style.transform = `translateY(${deltaY}px)`;
                item.style.opacity = '0.7';
                requestAnimationFrame(() => {
                    item.style.transition = 'transform 0.4s cubic-bezier(.4,2,.3,1), opacity 0.3s';
                    item.style.transform = '';
                    item.style.opacity = '1';
                });
                item.addEventListener('transitionend', () => item.style.transition = '', { once: true });
            }
        }
    });
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
    guardarEstado();
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
    guardarEstado();
    setEstado(`Cargados ${nombres.length} nombres desde archivo local.`);
}

// --------- Edición por doble click ---------
function handleContadorDblClick(event) {
    const span = event.target;
    if (!span.classList.contains('contador')) return;
    
    // Guardar valor original por si necesitamos restaurarlo
    const valorOriginal = span.dataset.valor;
    
    // Seleccionar todo el texto al hacer doble click
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(range);
    
    const finalizarEdicion = () => {
        let nuevoValor = Number(span.textContent.trim());
        
        // Validar el rango y formato del número
        if (isNaN(nuevoValor) || nuevoValor < 0 || nuevoValor > 10) {
            span.textContent = valorOriginal;
            return;
        }
        
        // Redondear a un decimal
        nuevoValor = Math.round(nuevoValor * 10) / 10;
        
        const card = span.closest('.persona');
        const nombre = card.dataset.nombre;
        
        // Actualizar estado y UI
        estado.set(nombre, nuevoValor);
        span.dataset.valor = String(nuevoValor);
        span.textContent = nuevoValor;
        
        guardarEstado();
        renderRanking();
        bump(span);
    };
    
    // Prevenir salto de línea y manejar Enter
    span.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            span.blur();
        }
    });
    
    // Limpiar eventos al terminar
    span.addEventListener('blur', () => {
        finalizarEdicion();
        span.removeEventListener('keydown', null);
    }, { once: true });
}

// Agregar nueva persona
function agregarNuevaPersona() {
    const nombre = prompt("Nombre de la nueva persona:");
    if (!nombre) return;

    const nombreNormalizado = nombre.trim();
    if (nombreNormalizado === "") return;

    if (estado.has(nombreNormalizado)) {
        alert("Esa persona ya existe en la lista.");
        return;
    }

    estado.set(nombreNormalizado, 10);
    renderLista();
    guardarEstado();
    setEstado("Nueva persona añadida.");
}

// --------- Inicializar Sortable (drag & drop) ---------
// Requiere Sortable.js incluido en index.html (ya está en tu proyecto).
// Esta configuración actualiza el Map 'estado' en el orden visual tras un arrastre.
if (typeof Sortable !== "undefined" && lista) {
    new Sortable(lista, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: () => {
            // Reconstruir el Map 'estado' según el orden actual del DOM
            const nuevos = Array.from(lista.querySelectorAll('.persona')).map(n => n.dataset.nombre).filter(Boolean);
            const nuevoMap = new Map();
            for (const nombre of nuevos) {
                if (estado.has(nombre)) nuevoMap.set(nombre, estado.get(nombre));
            }
            // Reemplazar contenido de 'estado' conservando valores
            estado.clear();
            for (const [k, v] of nuevoMap) estado.set(k, v);
            guardarEstado();
            setEstado("Orden actualizado.");
        }
    });
}

// --------- Event Listeners ---------
// Delegación para botones +/-
lista.addEventListener("click", (ev) => {
    const card = ev.target.closest(".persona");
    if (!card) return;

    const nombre = card.dataset.nombre;
    if (!estado.has(nombre)) return;

    const btn = ev.target.closest("button");
    if (!btn) return;

    const span = card.querySelector(".contador");
    const valor = Number(span?.dataset.valor ?? 10);
    let nuevoValor = valor;

    if (btn.classList.contains("btn-mas")) {
        nuevoValor = Math.min(10, valor + 0.1);
    } else if (btn.classList.contains("btn-menos")) {
        nuevoValor = Math.max(0, valor - 0.1);
    } else {
        return;
    }

    nuevoValor = Math.round(nuevoValor * 10) / 10;

    estado.set(nombre, nuevoValor);
    if (span) {
        span.dataset.valor = String(nuevoValor);
        span.textContent = nuevoValor;
        bump(span);
    }

    guardarEstado();
    renderRanking();
});

// Doble click para editar nota
lista.addEventListener('dblclick', handleContadorDblClick);

btnReset.addEventListener("click", () => {
    for (const n of Array.from(estado.keys())) estado.set(n, 10);
    renderLista();
    setEstado("Todos los contadores han sido reiniciados a 10.");
    guardarEstado();
});

btnCargar.addEventListener("click", async () => {
    try {
        await cargarNombresDesdeTxt("nombres.txt");
    } catch (err) {
        console.error(err);
        setEstado("No se pudo cargar nombres.txt. Puedes subir un archivo local.");
    }
});

btnAgregarNombre?.addEventListener("click", agregarNuevaPersona);

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