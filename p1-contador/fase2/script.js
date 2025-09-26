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

function actualizarColorSuspenso(card, valor) {
  if (valor < 5) {
    card.classList.add("suspenso");
  } else {
    card.classList.remove("suspenso");
  }
}

// Modifica renderPersona para aplicar color al cargar
function renderPersona(nombre, valor = 10) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.nombre = nombre;
  node.querySelector(".nombre").textContent = nombre;
  const span = node.querySelector(".contador");
  span.textContent = valor;
  span.dataset.valor = String(valor);
  actualizarColorSuspenso(node, valor);
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

// --- Ranking ---
function renderRanking() {
  let tabla = document.getElementById("tabla-ranking");
  if (!tabla) {
    tabla = document.createElement("table");
    tabla.id = "tabla-ranking";
    tabla.innerHTML = `
      <thead>
        <tr>
          <th>Puesto</th>
          <th>Nombre</th>
          <th>Nota</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    // Insertar la tabla después de la lista
    lista.parentNode.appendChild(tabla);
  }
  const tbody = tabla.querySelector("tbody");
  tbody.innerHTML = "";

  // Obtener y ordenar los alumnos por nota descendente
  const ranking = Array.from(estado.entries())
    .map(([nombre, valor]) => ({ nombre, valor }))
    .sort((a, b) => b.valor - a.valor);

  ranking.forEach((alumno, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${alumno.nombre}</td>
      <td>${alumno.valor}</td>
    `;
    // Medallas: oro, plata, bronce
    if (i === 0) tr.classList.add("oro");
    if (i === 1) tr.classList.add("plata");
    if (i === 2) tr.classList.add("bronce");
    tbody.appendChild(tr);
  });
}

// Llama a renderRanking cada vez que cambie el estado
function renderListaYRanking() {
  renderLista();
  renderRanking();
}

// Reemplaza renderLista por renderListaYRanking en los sitios clave:
function setEstado(msg) {
  estadoUI.textContent = msg ?? "";
  renderRanking();
}

// Cambia todas las llamadas a renderLista() por renderListaYRanking()
btnReset.addEventListener("click", () => {
  for (const n of estado.keys()) estado.set(n, 10);
  renderListaYRanking();
  setEstado("Todos los contadores han sido reiniciados a 10.");
});

btnCargar.addEventListener("click", async () => {
  try {
    await cargarNombresDesdeTxt("nombres.txt");
    renderRanking();
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
    renderRanking();
  } catch (err) {
    console.error(err);
    setEstado("No se pudo leer el archivo local.");
  } finally {
    inputArchivo.value = "";
  }
});

// Llama a renderRanking después de cada cambio de nota
function actualizarDespuesDeCambio() {
  renderRanking();
}

// Añade renderRanking en los lugares donde se modifica la nota:
lista.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const card = btn.closest(".persona");
  if (!card) return;

  const nombre = card.dataset.nombre;
  if (!estado.has(nombre)) return;

  const span = card.querySelector(".contador");
  let valor = Number(span.dataset.valor || "10");

  if (btn.classList.contains("btn-mas")) {
    valor = Math.min(10, valor + 0.1);
  }
  if (btn.classList.contains("btn-menos")) {
    valor = valor - 0.1;
  }
  // Redondea a un decimal
  valor = Number(valor.toFixed(1));
  estado.set(nombre, valor);
  span.dataset.valor = String(valor);
  span.textContent = valor;
  bump(span);

  // Actualiza color suspenso
  actualizarColorSuspenso(card, valor);
  actualizarDespuesDeCambio();
});

// Permitir seleccionar varias personas haciendo click en la tarjeta (no en los botones)
// y editar la nota haciendo click en el número
lista.addEventListener("click", (ev) => {
  // Si se hace clic en un botón, no seleccionar/deseleccionar
  if (ev.target.closest("button")) return;

  const card = ev.target.closest(".persona");
  if (!card) return;

  // Si se hace click en el span de la nota, permitir edición
  if (ev.target.classList.contains("contador")) {
    const span = ev.target;
    const valorAnterior = span.textContent;
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "10";
    input.step = "0.1";
    input.value = valorAnterior;
    input.style.width = "3.5ch";
    input.style.fontSize = "2.25rem";
    input.style.textAlign = "center";
    input.style.fontFamily = "inherit";
    input.style.border = "1px solid #aaa";
    input.style.borderRadius = "0.3em";
    input.style.margin = "0";
    input.style.padding = "0";
    span.replaceWith(input);
    input.focus();
    input.select();

    // Guardar cambios al perder foco o pulsar Enter
    function guardar() {
      let valor = parseFloat(input.value.replace(",", "."));
      if (isNaN(valor)) valor = Number(valorAnterior);
      if (valor > 10) valor = 10;
      if (valor < 0) valor = 0;
      valor = Number(valor.toFixed(1));
      const nuevoSpan = document.createElement("span");
      nuevoSpan.className = "contador";
      nuevoSpan.dataset.valor = String(valor);
      nuevoSpan.textContent = valor;
      input.replaceWith(nuevoSpan);

      // Actualiza estado y color
      const nombre = card.dataset.nombre;
      estado.set(nombre, valor);
      actualizarColorSuspenso(card, valor);
      bump(nuevoSpan);
      actualizarDespuesDeCambio();
    }

    input.addEventListener("blur", guardar);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        input.blur();
      }
      if (e.key === "Escape") {
        // Cancelar edición
        const nuevoSpan = document.createElement("span");
        nuevoSpan.className = "contador";
        nuevoSpan.dataset.valor = valorAnterior;
        nuevoSpan.textContent = valorAnterior;
        input.replaceWith(nuevoSpan);
      }
    });
    return; // No alternar selección si se edita la nota
  }

  // Selección múltiple: cada click alterna la selección de la casilla
  card.classList.toggle("seleccionada");
});

// Permitir subir/bajar nota con flechas para seleccionados
document.addEventListener("keydown", (ev) => {
  // Solo actuar si hay al menos una persona seleccionada
  const seleccionados = lista.querySelectorAll(".persona.seleccionada");
  if (!seleccionados.length) return;

  // Solo flecha arriba o abajo
  if (ev.key !== "ArrowDown" && ev.key !== "ArrowUp") return;

  // Evita scroll de la página
  ev.preventDefault();

  seleccionados.forEach(card => {
    const nombre = card.dataset.nombre;
    if (!estado.has(nombre)) return;

    const span = card.querySelector(".contador");
    let valor = Number(span.dataset.valor || "10");

    if (ev.key === "ArrowDown") {
      valor = valor - 0.1;
    }
    if (ev.key === "ArrowUp") {
      valor = Math.min(10, valor + 0.1);
    }

    // Redondea a un decimal
    valor = Number(valor.toFixed(1));
    // Limita el valor mínimo a 0
    if (valor < 0) valor = 0;

    estado.set(nombre, valor);
    span.dataset.valor = String(valor);
    span.textContent = valor;
    bump(span);

    // Actualiza color suspenso
    actualizarColorSuspenso(card, valor);
  });
  actualizarDespuesDeCambio();
});

btnReset.addEventListener("click", () => {
  for (const n of estado.keys()) estado.set(n, 10);
  renderListaYRanking();
  setEstado("Todos los contadores han sido reiniciados a 10.");
});

btnCargar.addEventListener("click", async () => {
  try {
    await cargarNombresDesdeTxt("nombres.txt");
    renderRanking();
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
    renderRanking();
  } catch (err) {
    console.error(err);
    setEstado("No se pudo leer el archivo local.");
  } finally {
    inputArchivo.value = "";
  }
});

// Añadir botón para nota aleatoria
const btnRandom = document.createElement("button");
btnRandom.id = "btn-random";
btnRandom.textContent = "Nota aleatoria";
btnRandom.style.marginLeft = "0.5rem";
document.querySelector(".acciones").appendChild(btnRandom);

btnRandom.addEventListener("click", () => {
  const seleccionados = lista.querySelectorAll(".persona.seleccionada");
  if (!seleccionados.length) {
    setEstado("Selecciona al menos una casilla para asignar nota aleatoria.");
    return;
  }
  seleccionados.forEach(card => {
    const nombre = card.dataset.nombre;
    if (!estado.has(nombre)) return;

    // Nota aleatoria entre 1.0 y 10.0, con un decimal
    let valor = Math.random() * 9 + 1;
    valor = Number(valor.toFixed(1));

    estado.set(nombre, valor);
    const span = card.querySelector(".contador");
    span.dataset.valor = String(valor);
    span.textContent = valor;
    bump(span);

    // Actualiza color suspenso
    actualizarColorSuspenso(card, valor);
  });
  setEstado("Nota aleatoria asignada a la selección.");
  actualizarDespuesDeCambio();
});

// Crear y añadir el botón para bajar 0.5 a la nota de las seleccionadas
const btnBajar05 = document.createElement("button");
btnBajar05.id = "btn-bajar-05";
btnBajar05.textContent = "Bajar 0.5";
btnBajar05.style.marginLeft = "0.5rem";
document.querySelector(".acciones").appendChild(btnBajar05);

btnBajar05.addEventListener("click", () => {
  const seleccionados = lista.querySelectorAll(".persona.seleccionada");
  if (!seleccionados.length) {
    setEstado("Selecciona al menos una casilla para bajar 0.5.");
    return;
  }
  seleccionados.forEach(card => {
    const nombre = card.dataset.nombre;
    if (!estado.has(nombre)) return;

    const span = card.querySelector(".contador");
    let valor = Number(span.dataset.valor || "10");
    valor = valor - 0.5;
    if (valor < 0) valor = 0;
    valor = Number(valor.toFixed(1));
    estado.set(nombre, valor);
    span.dataset.valor = String(valor);
    span.textContent = valor;
    bump(span);

    // Actualiza color suspenso
    actualizarColorSuspenso(card, valor);
  });
  setEstado("Se ha bajado 0.5 a la selección.");
  actualizarDespuesDeCambio();
});

// Al editar la nota manualmente
lista.addEventListener("click", (ev) => {
  if (ev.target.closest("button")) return;
  const card = ev.target.closest(".persona");
  if (!card) return;
  if (ev.target.classList.contains("contador")) {
    const span = ev.target;
    const valorAnterior = span.textContent;
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "10";
    input.step = "0.1";
    input.value = valorAnterior;
    input.style.width = "3.5ch";
    input.style.fontSize = "2.25rem";
    input.style.textAlign = "center";
    input.style.fontFamily = "inherit";
    input.style.border = "1px solid #aaa";
    input.style.borderRadius = "0.3em";
    input.style.margin = "0";
    input.style.padding = "0";
    span.replaceWith(input);
    input.focus();
    input.select();

    function guardar() {
      let valor = parseFloat(input.value.replace(",", "."));
      if (isNaN(valor)) valor = Number(valorAnterior);
      if (valor > 10) valor = 10;
      if (valor < 0) valor = 0;
      valor = Number(valor.toFixed(1));
      const nuevoSpan = document.createElement("span");
      nuevoSpan.className = "contador";
      nuevoSpan.dataset.valor = String(valor);
      nuevoSpan.textContent = valor;
      input.replaceWith(nuevoSpan);

      const nombre = card.dataset.nombre;
      estado.set(nombre, valor);
      actualizarColorSuspenso(card, valor);
      bump(nuevoSpan);
      actualizarDespuesDeCambio();
    }

    input.addEventListener("blur", guardar);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
      if (e.key === "Escape") {
        const nuevoSpan = document.createElement("span");
        nuevoSpan.className = "contador";
        nuevoSpan.dataset.valor = valorAnterior;
        nuevoSpan.textContent = valorAnterior;
        input.replaceWith(nuevoSpan);
      }
    });
    return;
  }
  card.classList.toggle("seleccionada");
});

// Render ranking al cargar lista
function renderLista() {
  lista.innerHTML = "";
  const nombres = Array.from(estado.keys()).sort((a, b) =>
    normalizaNombre(a).localeCompare(normalizaNombre(b))
  );
  for (const n of nombres) {
    const v = estado.get(n) ?? 10;
    lista.appendChild(renderPersona(n, v));
  }
  renderRanking();
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

  const span = card.querySelector(".contador");
  let valor = Number(span.dataset.valor || "10");

  if (btn.classList.contains("btn-mas")) {
    valor = Math.min(10, valor + 0.1);
  }
  if (btn.classList.contains("btn-menos")) {
    valor = valor - 0.1;
  }
  // Redondea a un decimal
  valor = Number(valor.toFixed(1));
  estado.set(nombre, valor);
  span.dataset.valor = String(valor);
  span.textContent = valor;
  bump(span);

  // Actualiza color suspenso
  actualizarColorSuspenso(card, valor);
  actualizarDespuesDeCambio();
});

// Permitir seleccionar varias personas haciendo click en la tarjeta (no en los botones)
// y editar la nota haciendo click en el número
lista.addEventListener("click", (ev) => {
  // Si se hace clic en un botón, no seleccionar/deseleccionar
  if (ev.target.closest("button")) return;

  const card = ev.target.closest(".persona");
  if (!card) return;

  // Si se hace click en el span de la nota, permitir edición
  if (ev.target.classList.contains("contador")) {
    const span = ev.target;
    const valorAnterior = span.textContent;
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "10";
    input.step = "0.1";
    input.value = valorAnterior;
    input.style.width = "3.5ch";
    input.style.fontSize = "2.25rem";
    input.style.textAlign = "center";
    input.style.fontFamily = "inherit";
    input.style.border = "1px solid #aaa";
    input.style.borderRadius = "0.3em";
    input.style.margin = "0";
    input.style.padding = "0";
    span.replaceWith(input);
    input.focus();
    input.select();

    // Guardar cambios al perder foco o pulsar Enter
    function guardar() {
      let valor = parseFloat(input.value.replace(",", "."));
      if (isNaN(valor)) valor = Number(valorAnterior);
      if (valor > 10) valor = 10;
      if (valor < 0) valor = 0;
      valor = Number(valor.toFixed(1));
      const nuevoSpan = document.createElement("span");
      nuevoSpan.className = "contador";
      nuevoSpan.dataset.valor = String(valor);
      nuevoSpan.textContent = valor;
      input.replaceWith(nuevoSpan);

      // Actualiza estado y color
      const nombre = card.dataset.nombre;
      estado.set(nombre, valor);
      actualizarColorSuspenso(card, valor);
      bump(nuevoSpan);
      actualizarDespuesDeCambio();
    }

    input.addEventListener("blur", guardar);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        input.blur();
      }
      if (e.key === "Escape") {
        // Cancelar edición
        const nuevoSpan = document.createElement("span");
        nuevoSpan.className = "contador";
        nuevoSpan.dataset.valor = valorAnterior;
        nuevoSpan.textContent = valorAnterior;
        input.replaceWith(nuevoSpan);
      }
    });
    return; // No alternar selección si se edita la nota
  }

  // Selección múltiple: cada click alterna la selección de la casilla
  card.classList.toggle("seleccionada");
});

// Permitir subir/bajar nota con flechas para seleccionados
document.addEventListener("keydown", (ev) => {
  // Solo actuar si hay al menos una persona seleccionada
  const seleccionados = lista.querySelectorAll(".persona.seleccionada");
  if (!seleccionados.length) return;

  // Solo flecha arriba o abajo
  if (ev.key !== "ArrowDown" && ev.key !== "ArrowUp") return;

  // Evita scroll de la página
  ev.preventDefault();

  seleccionados.forEach(card => {
    const nombre = card.dataset.nombre;
    if (!estado.has(nombre)) return;

    const span = card.querySelector(".contador");
    let valor = Number(span.dataset.valor || "10");

    if (ev.key === "ArrowDown") {
      valor = valor - 0.1;
    }
    if (ev.key === "ArrowUp") {
      valor = Math.min(10, valor + 0.1);
    }

    // Redondea a un decimal
    valor = Number(valor.toFixed(1));
    // Limita el valor mínimo a 0
    if (valor < 0) valor = 0;

    estado.set(nombre, valor);
    span.dataset.valor = String(valor);
    span.textContent = valor;
    bump(span);

    // Actualiza color suspenso
    actualizarColorSuspenso(card, valor);
  });
  actualizarDespuesDeCambio();
});

btnReset.addEventListener("click", () => {
  for (const n of estado.keys()) estado.set(n, 10);
  renderListaYRanking();
  setEstado("Todos los contadores han sido reiniciados a 10.");
});

btnCargar.addEventListener("click", async () => {
  try {
    await cargarNombresDesdeTxt("nombres.txt");
    renderRanking();
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
    renderRanking();
  } catch (err) {
    console.error(err);
    setEstado("No se pudo leer el archivo local.");
  } finally {
    inputArchivo.value = "";
  }
});

// Añadir botón para nota aleatoria
const btnRandom = document.createElement("button");
btnRandom.id = "btn-random";
btnRandom.textContent = "Nota aleatoria";
btnRandom.style.marginLeft = "0.5rem";
document.querySelector(".acciones").appendChild(btnRandom);

btnRandom.addEventListener("click", () => {
  const seleccionados = lista.querySelectorAll(".persona.seleccionada");
  if (!seleccionados.length) {
    setEstado("Selecciona al menos una casilla para asignar nota aleatoria.");
    return;
  }
  seleccionados.forEach(card => {
    const nombre = card.dataset.nombre;
    if (!estado.has(nombre)) return;

    // Nota aleatoria entre 1.0 y 10.0, con un decimal
    let valor = Math.random() * 9 + 1;
    valor = Number(valor.toFixed(1));

    estado.set(nombre, valor);
    const span = card.querySelector(".contador");
    span.dataset.valor = String(valor);
    span.textContent = valor;
    bump(span);

    // Actualiza color suspenso
    actualizarColorSuspenso(card, valor);
  });
  setEstado("Nota aleatoria asignada a la selección.");
  actualizarDespuesDeCambio();
});

// Crear y añadir el botón para bajar 0.5 a la nota de las seleccionadas
const btnBajar05 = document.createElement("button");
btnBajar05.id = "btn-bajar-05";
btnBajar05.textContent = "Bajar 0.5";
btnBajar05.style.marginLeft = "0.5rem";
document.querySelector(".acciones").appendChild(btnBajar05);

btnBajar05.addEventListener("click", () => {
  const seleccionados = lista.querySelectorAll(".persona.seleccionada");
  if (!seleccionados.length) {
    setEstado("Selecciona al menos una casilla para bajar 0.5.");
    return;
  }
  seleccionados.forEach(card => {
    const nombre = card.dataset.nombre;
    if (!estado.has(nombre)) return;

    const span = card.querySelector(".contador");
    let valor = Number(span.dataset.valor || "10");
    valor = valor - 0.5;
    if (valor < 0) valor = 0;
    valor = Number(valor.toFixed(1));
    estado.set(nombre, valor);
    span.dataset.valor = String(valor);
    span.textContent = valor;
    bump(span);

    // Actualiza color suspenso
    actualizarColorSuspenso(card, valor);
  });
  setEstado("Se ha bajado 0.5 a la selección.");
  actualizarDespuesDeCambio();
});

// Al editar la nota manualmente
lista.addEventListener("click", (ev) => {
  if (ev.target.closest("button")) return;
  const card = ev.target.closest(".persona");
  if (!card) return;
  if (ev.target.classList.contains("contador")) {
    const span = ev.target;
    const valorAnterior = span.textContent;
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "10";
    input.step = "0.1";
    input.value = valorAnterior;
    input.style.width = "3.5ch";
    input.style.fontSize = "2.25rem";
    input.style.textAlign = "center";
    input.style.fontFamily = "inherit";
    input.style.border = "1px solid #aaa";
    input.style.borderRadius = "0.3em";
    input.style.margin = "0";
    input.style.padding = "0";
    span.replaceWith(input);
    input.focus();
    input.select();

    function guardar() {
      let valor = parseFloat(input.value.replace(",", "."));
      if (isNaN(valor)) valor = Number(valorAnterior);
      if (valor > 10) valor = 10;
      if (valor < 0) valor = 0;
      valor = Number(valor.toFixed(1));
      const nuevoSpan = document.createElement("span");
      nuevoSpan.className = "contador";
      nuevoSpan.dataset.valor = String(valor);
      nuevoSpan.textContent = valor;
      input.replaceWith(nuevoSpan);

      const nombre = card.dataset.nombre;
      estado.set(nombre, valor);
      actualizarColorSuspenso(card, valor);
      bump(nuevoSpan);
      actualizarDespuesDeCambio();
    }

    input.addEventListener("blur", guardar);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.blur();
      if (e.key === "Escape") {
        const nuevoSpan = document.createElement("span");
        nuevoSpan.className = "contador";
        nuevoSpan.dataset.valor = valorAnterior;
        nuevoSpan.textContent = valorAnterior;
        input.replaceWith(nuevoSpan);
      }
    });
    return;
  }
  card.classList.toggle("seleccionada");
});

// Render ranking al cargar lista
function renderLista() {
  lista.innerHTML = "";
  const nombres = Array.from(estado.keys()).sort((a, b) =>
    normalizaNombre(a).localeCompare(normalizaNombre(b))
  );
  for (const n of nombres) {
    const v = estado.get(n) ?? 10;
    lista.appendChild(renderPersona(n, v));
  }
  renderRanking();
}

// --------- Bootstrap ---------
// Opción A (recomendada en local con live server): intenta cargar nombres.txt
// Opción B: si falla, el usuario puede usar “Cargar archivo local”
cargarNombresDesdeTxt("nombres.txt").catch(() => {
  setEstado("Consejo: coloca un nombres.txt junto a esta página o usa 'Cargar archivo local'.");
});