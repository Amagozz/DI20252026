// Estado simple en memoria: { nombre: valor }
const estado = new Map();
const lista = document.getElementById("lista");
const estadoUI = document.getElementById("estado");
const btnCargar = document.getElementById("btn-cargar-nombres");
const btnReset = document.getElementById("btn-reset");
const inputArchivo = document.getElementById("input-archivo");
const tpl = document.getElementById("tpl-persona");
<<<<<<< HEAD
const btnSubirSeleccionados = document.getElementById("btn-subir-seleccionados");
const btnBajarSeleccionados = document.getElementById("btn-bajar-seleccionados");

=======
>>>>>>> 9c08cf45e0774f149536d15f91dee3875f081b07

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
  if (!btn) return;
  const card = btn.closest(".persona");
  if (!card) return;

  const nombre = card.dataset.nombre;
  if (!estado.has(nombre)) return;
<<<<<<< HEAD

  const span = card.querySelector(".contador");
  let valor = Number(span.dataset.valor || "10");

  if (btn.classList.contains("btn-mas")) {
    if (valor < 10) {
      valor += 0.1;
      valor = Math.min(valor, 10);
      setEstado("");
    } else {
      setEstado("No puedes poner más nota.");
      return;
    }
  }

  if (btn.classList.contains("btn-menos")) {
    if (valor > 0) {
      valor -= 0.1;
      valor = Math.max(0, valor);
      setEstado("");
    } else {
      setEstado("Ya no puedes quitarle más nota.");
      return;
    }
  }
  if (btn.classList.contains("btn-reset-individual")) {
    valor = 0;
    setEstado(`La nota de ${nombre} se ha puesto en 0.`);
  }
  estado.set(nombre, valor);
  span.dataset.valor = String(valor);
  span.textContent = Number.isInteger(valor) ? valor : valor.toFixed(1);
  bump(span);
});




function modificarSeleccionados(delta) {
  const seleccionados = lista.querySelectorAll(".persona .seleccion:checked");
  if (seleccionados.length === 0) {
    setEstado("No hay alumnos seleccionados.");
    return;
  }

  let cambios = 0;

  seleccionados.forEach(checkbox => {
    const card = checkbox.closest(".persona");
    const nombre = card.dataset.nombre;
    const span = card.querySelector(".contador");
    let valor = Number(span.dataset.valor || "10");

    valor += delta;
    valor = Math.max(0, Math.min(10, valor));

    estado.set(nombre, valor);
    span.dataset.valor = String(valor);
    span.textContent = Number.isInteger(valor) ? valor : valor.toFixed(1);;
    bump(span);
    cambios++;
  });

  setEstado(`Se modificó la nota de ${cambios} alumno(s).`);
}

btnSubirSeleccionados.addEventListener("click", () => modificarSeleccionados(0.1));
btnBajarSeleccionados.addEventListener("click", () => modificarSeleccionados(-0.1));

=======

  const span = card.querySelector(".contador");
  let valor = Number(span.dataset.valor || "10");

  if (btn.classList.contains("btn-mas")) valor += 1;
  if (btn.classList.contains("btn-menos")) valor -= 1;
>>>>>>> 9c08cf45e0774f149536d15f91dee3875f081b07

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
<<<<<<< HEAD

    inputArchivo.value = "";
    }
    });

    // --------- Bootstrap ---------
    // Opción A (recomendada en local con live server): intenta cargar nombres.txt
    // Opción B: si falla, el usuario puede usar “Cargar archivo local”
    cargarNombresDesdeTxt("nombres.txt").catch(() => {
      setEstado("Consejo: coloca un nombres.txt junto a esta página o usa 'Cargar archivo local'.");
    });

    // Permitir marcar el checkbox al hacer clic en la tarjeta
    document.getElementById('lista').addEventListener('click', function (e) {
      const card = e.target.closest('.persona');
      if (!card || !this.contains(card)) return;
      if (
        e.target.matches('input.seleccion') ||
        e.target.closest('button')
      ) {
        return;
      }
      const checkbox = card.querySelector('input.seleccion');
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
=======
    inputArchivo.value = "";
  }
});

// --------- Bootstrap ---------
// Opción A (recomendada en local con live server): intenta cargar nombres.txt
// Opción B: si falla, el usuario puede usar “Cargar archivo local”
cargarNombresDesdeTxt("nombres.txt").catch(() => {
  setEstado("Consejo: coloca un nombres.txt junto a esta página o usa 'Cargar archivo local'.");
});
>>>>>>> 9c08cf45e0774f149536d15f91dee3875f081b07
