// Guardar todos los comentarios en un solo archivo txt
document.getElementById('guardar-todos-comentarios')?.addEventListener('click', () => {
  const cards = lista.querySelectorAll('.persona');
  let contenido = '';
  cards.forEach(card => {
    const nombre = card.dataset.nombre || 'Alumno';
    const comentario = card.querySelector('.comentario')?.value.trim();
    if (comentario) {
      contenido += `${nombre}: ${comentario}\n`;
    }
  });
  if (!contenido) {
    alert('No hay comentarios para guardar.');
    return;
  }
  const blob = new Blob([contenido], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'comentarios_alumnos.txt';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }, 100);
});
// Estado simple en memoria: { nombre: valor }
const estado = new Map();
const lista = document.getElementById("lista");
const estadoUI = document.getElementById("estado");
const btnCargar = document.getElementById("btn-cargar-nombres");
const btnReset = document.getElementById("btn-reset");
const inputArchivo = document.getElementById("input-archivo");
const tpl = document.getElementById("tpl-persona");
const spanContador = document.getElementById("contador");

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
  efectoColorDelContador(span, valor);
  // Hacer la tarjeta accesible por teclado
  node.tabIndex = 0;
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
  // Foco en la primera caja al renderizar
  const firstCard = lista.querySelector('.persona');
  if (firstCard) firstCard.focus();

// Accesibilidad con flechas y selección múltiple
lista.addEventListener("keydown", (ev) => {
  const card = ev.target.closest('.persona');
  if (!card) return;
  const cards = Array.from(lista.querySelectorAll('.persona'));
  const idx = cards.indexOf(card);
  // Selección múltiple
  const seleccionados = Array.from(lista.querySelectorAll('.seleccion-persona:checked'));
  if (seleccionados.length > 1) {
    // Si hay varios seleccionados, solo flechas arriba/abajo afectan a todos
    if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
      const delta = ev.key === 'ArrowUp' ? 0.1 : -0.1;
      seleccionados.forEach(checkbox => {
        const persona = checkbox.closest('.persona');
        const nombre = persona.dataset.nombre;
        let valor = Number(persona.querySelector('.contador').dataset.valor || "10");
        valor += delta;
        if (valor > 10) valor = 10;
        if (valor < 0) valor = 0;
        valor = Math.round(valor * 10) / 10;
        estado.set(nombre, valor);
        const span = persona.querySelector('.contador');
        span.dataset.valor = String(valor);
        span.textContent = valor;
        bump(span);
        efectoColorDelContador(span, valor);
      });
      ev.preventDefault();
    } else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowRight') {
      // Bloquear navegación lateral
      ev.preventDefault();
    }
    return;
  }
  // Comportamiento normal si no hay selección múltiple
  if (ev.key === 'ArrowRight') {
    const next = cards[(idx + 1) % cards.length];
    next.focus();
    ev.preventDefault();
  } else if (ev.key === 'ArrowLeft') {
    const prev = cards[(idx - 1 + cards.length) % cards.length];
    prev.focus();
    ev.preventDefault();
  } else if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown') {
    const btn = card.querySelector(ev.key === 'ArrowUp' ? '.btn-mas' : '.btn-menos');
    if (btn) btn.click();
    ev.preventDefault();
  }
});
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
//color
// Cambia el color del contador según su valor
function efectoColorDelContador(span, valor) {
  if (valor > 8) {
    span.style.color = "green";
  } else if (valor > 5) {
    span.style.color = "orange";
  } else {
    span.style.color = "red";
  }
}
lista.addEventListener("click", (ev) => {
  
  const btn = ev.target.closest("button");
  if (!btn) return;
  const card = btn.closest(".persona");
  if (!card) return;

  const nombre = card.dataset.nombre;
  if (!estado.has(nombre)) return;

  const span = card.querySelector(".contador");
  let valor = Number(span.dataset.valor || "10");

  if (btn.classList.contains("btn-mas")) valor += 0.1;
  if (btn.classList.contains("btn-menos")) valor -= 0.1;

  if (valor > 10) valor = 10;
  if (valor < 0) valor = 0;
  valor = Math.round(valor * 10) / 10;

  estado.set(nombre, valor);
  span.dataset.valor = String(valor);
  span.textContent = valor;
  bump(span);
  efectoColorDelContador(span, valor);
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

// --------- Bootstrap ---------
// Opción A (recomendada en local con live server): intenta cargar nombres.txt
// Opción B: si falla, el usuario puede usar “Cargar archivo local”
cargarNombresDesdeTxt("nombres.txt").catch(() => {
  setEstado("Consejo: coloca un nombres.txt junto a esta página o usa 'Cargar archivo local'.");
});


