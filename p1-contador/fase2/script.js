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

// --- Selección múltiple con checkbox ---
let seleccionados = new Set();

function renderLista() {
  lista.innerHTML = "";
  const nombres = Array.from(estado.keys()).sort((a, b) =>
    normalizaNombre(a).localeCompare(normalizaNombre(b))
  );
  for (const n of nombres) {
    const v = estado.get(n) ?? 10;
    const card = renderPersona(n, v);
    // Marcar el checkbox si está seleccionado
    const checkbox = card.querySelector('.selector-persona');
    if (checkbox) {
      checkbox.checked = seleccionados.has(n);
      checkbox.addEventListener('change', (ev) => {
        if (ev.target.checked) {
          seleccionados.add(n);
        } else {
          seleccionados.delete(n);
        }
        // Resalta visualmente
        if (ev.target.checked) {
          card.classList.add('selected');
        } else {
          card.classList.remove('selected');
        }
      });
      // Resalta visualmente
      if (seleccionados.has(n)) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    }
    lista.appendChild(card);
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

// Botones + y -
lista.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const cardBtn = btn.closest(".persona");
  if (!cardBtn) return;
  const nombreBtn = cardBtn.dataset.nombre;
  if (!estado.has(nombreBtn)) return;
  const span = cardBtn.querySelector(".contador");
  let valor = Number(span.dataset.valor || "10");
  if (btn.classList.contains("btn-mas")) valor = Math.round((valor + 0.1) * 10) / 10;
  if (btn.classList.contains("btn-menos")) valor = Math.round((valor - 0.1) * 10) / 10;
  if (btn.classList.contains("muerte")) valor = 0;
  if (valor <= 0) {
    valor = 0;
  } else if(valor >= 10) {
    valor = 10;
  }
  estado.set(nombreBtn, valor);
  span.dataset.valor = String(valor);
  span.textContent = valor.toFixed(1);
  bump(span);
});

// Teclas de flecha para subir/bajar valores de seleccionados
document.addEventListener("keydown", (ev) => {
  if (seleccionados.size === 0) return;
  let delta = 0;
  if (ev.key === "ArrowUp") delta = 0.1;
  if (ev.key === "ArrowDown") delta = -0.1;
  if (delta === 0) return;
  let cambio = false;
  for (const nombre of seleccionados) {
    let valor = estado.get(nombre) ?? 10;
    valor = Math.round((valor + delta) * 10) / 10;
    if (valor < 0) valor = 0;
    if (valor > 10) valor = 10;
    estado.set(nombre, valor);
    cambio = true;
  }
  if (cambio) {
    renderLista();
    // Animar los contadores seleccionados
    for (const card of lista.querySelectorAll(".persona.selected .contador")) {
      bump(card);
    }
  }
});

btnReset.addEventListener("click", () => {
  for (const n of estado.keys()) estado.set(n, 10);
  seleccionados.clear();
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

// --------- Bootstrap ---------
// Opción A (recomendada en local con live server): intenta cargar nombres.txt
// Opción B: si falla, el usuario puede usar “Cargar archivo local”
cargarNombresDesdeTxt("nombres.txt").catch(() => {
  setEstado("Consejo: coloca un nombres.txt junto a esta página o usa 'Cargar archivo local'.");
});
