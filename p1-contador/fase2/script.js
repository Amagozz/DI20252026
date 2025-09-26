// Estado simple en memoria: { nombre: valor }
const estado = new Map();
const lista = document.getElementById("lista");
const estadoUI = document.getElementById("estado");
const btnCargar = document.getElementById("btn-cargar-nombres");
const btnReset = document.getElementById("btn-reset");
const inputArchivo = document.getElementById("input-archivo");
const tpl = document.getElementById("tpl-persona");

// Variables para controles globales
const controlesGlobales = document.getElementById("controles-globales");
const contadorSeleccionados = document.getElementById("contador-seleccionados");
const btnGlobalMas = document.getElementById("btn-global-mas");
const btnGlobalMenos = document.getElementById("btn-global-menos");
const inputGlobal = document.getElementById("input-global");
const inputValorManual = document.getElementById("input-valor-manual");
const btnAplicarManual = document.getElementById("btn-aplicar-manual");
const btnGlobalCerrar = document.getElementById("btn-global-cerrar");

// --------- Utilidades ---------
function normalizaNombre(s) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

function renderPersona(nombre, valor = 10) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.nombre = nombre;
  node.dataset.seleccionada = "false";
  node.querySelector(".nombre").textContent = nombre;
  const input = node.querySelector(".contador");
  input.value = valor;
  input.dataset.valor = String(valor);
  
  return node;
}

function bump(el) {
  el.classList.add("bump");
  setTimeout(() => el.classList.remove("bump"), 160);
}

// Render completo desde estado
function renderLista() {
  // Guardar estado de selección antes de limpiar
  const seleccionados = new Set();
  document.querySelectorAll(".persona.seleccionada").forEach(card => {
    seleccionados.add(card.dataset.nombre);
  });

  lista.innerHTML = "";
  const nombres = Array.from(estado.keys()).sort((a, b) =>
    normalizaNombre(a).localeCompare(normalizaNombre(b))
  );
  for (const n of nombres) {
    const v = estado.get(n) ?? 10;
    const node = renderPersona(n, v);
    lista.appendChild(node);
    
    // Restaurar estado de selección
    if (seleccionados.has(n)) {
      node.classList.add("seleccionada");
      node.dataset.seleccionada = "true";
    }
  }
  
  // Actualizar controles globales después de renderizar
  actualizarControlesGlobales();
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
// Variables para funcionalidad de mantener presionado
let intervalId = null;
let timeoutId = null;

// Función para actualizar contador con efectos visuales
function actualizarContador(card, nuevoValor, tipoAccion = 'auto') {
  const nombre = card.dataset.nombre;
  const input = card.querySelector(".contador");
  const valorAnterior = Number(input.dataset.valor || "10");
  
  estado.set(nombre, nuevoValor);
  input.dataset.valor = String(nuevoValor);
  input.value = nuevoValor;
  bump(input);
  
  // Efecto de color según el cambio de valor
  if (tipoAccion === 'auto') {
    if (nuevoValor > valorAnterior) {
      card.classList.add("increment-flash");
      setTimeout(() => card.classList.remove("increment-flash"), 500);
    } else if (nuevoValor < valorAnterior) {
      card.classList.add("decrement-flash");
      setTimeout(() => card.classList.remove("decrement-flash"), 500);
    }
  } else if (tipoAccion === 'increment' && nuevoValor > valorAnterior) {
    card.classList.add("increment-flash");
    setTimeout(() => card.classList.remove("increment-flash"), 500);
  } else if (tipoAccion === 'decrement' && nuevoValor < valorAnterior) {
    card.classList.add("decrement-flash");
    setTimeout(() => card.classList.remove("decrement-flash"), 500);
  }
}

// Función para incrementar/decrementar valor
function cambiarValor(card, incremento) {
  const input = card.querySelector(".contador");
  let valor = Number(input.dataset.valor || "10");
  
  valor += incremento;
  
  // Aplicar límites
  if (valor > 10) valor = 10;
  if (valor < 0) valor = 0;
  
  // Redondear para evitar problemas de precisión de punto flotante
  valor = Math.round(valor * 10) / 10;
  
  const tipoAccion = incremento > 0 ? 'increment' : 'decrement';
  actualizarContador(card, valor, tipoAccion);
}

// Función para iniciar cambio continuo
function iniciarCambioContinuo(card, incremento) {
  // Primer cambio inmediato
  cambiarValor(card, incremento);
  
  // Delay inicial antes de empezar el cambio continuo
  timeoutId = setTimeout(() => {
    intervalId = setInterval(() => {
      cambiarValor(card, incremento);
    }, 100); // Cambio cada 100ms
  }, 500); // Esperar 500ms antes de empezar el cambio continuo
}

// Función para detener cambio continuo
function detenerCambioContinuo() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}

// --------- Selección múltiple ---------
function actualizarControlesGlobales() {
  const seleccionadas = document.querySelectorAll(".persona.seleccionada");
  const cantidad = seleccionadas.length;
  
  contadorSeleccionados.textContent = `${cantidad} seleccionado${cantidad !== 1 ? 's' : ''}`;
  
  if (cantidad > 0) {
    controlesGlobales.classList.remove("hidden");
  } else {
    controlesGlobales.classList.add("hidden");
  }
}

function aplicarCambioGlobal(incremento) {
  const seleccionadas = document.querySelectorAll(".persona.seleccionada");
  if (seleccionadas.length === 0) return;
  
  let hayIncremento = false;
  let hayDecremento = false;
  
  seleccionadas.forEach(card => {
    const input = card.querySelector(".contador");
    let valor = Number(input.dataset.valor || "10");
    const valorAnterior = valor;
    
    valor += incremento;
    
    // Aplicar límites
    if (valor > 10) valor = 10;
    if (valor < 0) valor = 0;
    
    // Redondear para evitar problemas de precisión
    valor = Math.round(valor * 10) / 10;
    
    // Actualizar solo si cambió
    if (valor !== valorAnterior) {
      actualizarContador(card, valor, 'none'); // Sin efecto individual
      if (valor > valorAnterior) hayIncremento = true;
      if (valor < valorAnterior) hayDecremento = true;
    }
  });
  
  // Efecto de página completa
  if (hayIncremento && !hayDecremento) {
    document.body.classList.add("page-increment-flash");
    setTimeout(() => document.body.classList.remove("page-increment-flash"), 800);
  } else if (hayDecremento && !hayIncremento) {
    document.body.classList.add("page-decrement-flash");
    setTimeout(() => document.body.classList.remove("page-decrement-flash"), 800);
  }
}

function aplicarValorManual() {
  const seleccionadas = document.querySelectorAll(".persona.seleccionada");
  if (seleccionadas.length === 0) return;
  
  let nuevoValor = parseFloat(inputValorManual.value);
  if (isNaN(nuevoValor)) {
    alert("Por favor, ingresa un valor válido");
    return;
  }
  
  // Aplicar límites
  if (nuevoValor > 10) nuevoValor = 10;
  if (nuevoValor < 0) nuevoValor = 0;
  
  // Redondear a 1 decimal
  nuevoValor = Math.round(nuevoValor * 10) / 10;
  
  let hayIncremento = false;
  let hayDecremento = false;
  
  seleccionadas.forEach(card => {
    const input = card.querySelector(".contador");
    const valorAnterior = Number(input.dataset.valor || "10");
    
    // Actualizar solo si cambió
    if (nuevoValor !== valorAnterior) {
      actualizarContador(card, nuevoValor, 'none'); // Sin efecto individual
      if (nuevoValor > valorAnterior) hayIncremento = true;
      if (nuevoValor < valorAnterior) hayDecremento = true;
    }
  });
  
  // Efecto de página completa
  if (hayIncremento && !hayDecremento) {
    document.body.classList.add("page-increment-flash");
    setTimeout(() => document.body.classList.remove("page-increment-flash"), 800);
  } else if (hayDecremento && !hayIncremento) {
    document.body.classList.add("page-decrement-flash");
    setTimeout(() => document.body.classList.remove("page-decrement-flash"), 800);
  }
  
  // Limpiar el input después de aplicar
  inputValorManual.value = "";
}

// Delegación: un solo listener para todos los botones
lista.addEventListener("mousedown", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const card = btn.closest(".persona");
  if (!card) return;

  const nombre = card.dataset.nombre;
  if (!estado.has(nombre)) return;

  if (btn.classList.contains("btn-mas")) {
    iniciarCambioContinuo(card, 0.1);
  } else if (btn.classList.contains("btn-menos")) {
    iniciarCambioContinuo(card, -0.1);
  } else if (btn.classList.contains("btn-reset-individual")) {
    // Reset individual a 0
    actualizarContador(card, 0, 'decrement');
  }
});

// Detener cambio continuo al soltar el botón
lista.addEventListener("mouseup", detenerCambioContinuo);
lista.addEventListener("mouseleave", detenerCambioContinuo);

// También manejar eventos touch para dispositivos móviles
lista.addEventListener("touchstart", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const card = btn.closest(".persona");
  if (!card) return;

  const nombre = card.dataset.nombre;
  if (!estado.has(nombre)) return;

  if (btn.classList.contains("btn-mas")) {
    iniciarCambioContinuo(card, 0.1);
  } else if (btn.classList.contains("btn-menos")) {
    iniciarCambioContinuo(card, -0.1);
  } else if (btn.classList.contains("btn-reset-individual")) {
    actualizarContador(card, 0, 'decrement');
  }
});

lista.addEventListener("touchend", detenerCambioContinuo);
lista.addEventListener("touchcancel", detenerCambioContinuo);

// Manejar entrada manual en el input
lista.addEventListener("input", (ev) => {
  const input = ev.target;
  if (!input.classList.contains("contador")) return;
  
  const card = input.closest(".persona");
  if (!card) return;
  
  const nombre = card.dataset.nombre;
  if (!estado.has(nombre)) return;
  
  let nuevoValor = parseFloat(input.value) || 0;
  
  // Aplicar límites
  if (nuevoValor > 10) {
    nuevoValor = 10;
    input.value = nuevoValor;
  }
  if (nuevoValor < 0) {
    nuevoValor = 0;
    input.value = nuevoValor;
  }
  
  // Redondear a 1 decimal
  nuevoValor = Math.round(nuevoValor * 10) / 10;
  
  // Actualizar solo si el valor cambió realmente
  const valorAnterior = Number(input.dataset.valor || "10");
  if (nuevoValor !== valorAnterior) {
    actualizarContador(card, nuevoValor, 'auto');
  }
});

// Manejar cuando se pierde el foco del input
lista.addEventListener("blur", (ev) => {
  const input = ev.target;
  if (!input.classList.contains("contador")) return;
  
  // Asegurar que el valor mostrado coincida con el almacenado
  const valorAlmacenado = Number(input.dataset.valor || "10");
  input.value = valorAlmacenado;
}, true);

// Event listener para selección por clic en la tarjeta
lista.addEventListener("click", (ev) => {
  const card = ev.target.closest(".persona");
  if (!card) return;
  
  // No hacer nada si se hizo clic en un botón o input
  if (ev.target.tagName === 'BUTTON' || ev.target.tagName === 'INPUT') {
    return;
  }
  
  // Alternar selección
  const isSelected = card.classList.contains("seleccionada");
  if (isSelected) {
    card.classList.remove("seleccionada");
    card.dataset.seleccionada = "false";
  } else {
    card.classList.add("seleccionada");
    card.dataset.seleccionada = "true";
  }
  
  actualizarControlesGlobales();
});

// Event listeners para controles globales
btnGlobalMas.addEventListener("click", () => {
  const incremento = parseFloat(inputGlobal.value) || 0.1;
  aplicarCambioGlobal(incremento);
});

btnGlobalMenos.addEventListener("click", () => {
  const incremento = parseFloat(inputGlobal.value) || 0.1;
  aplicarCambioGlobal(-incremento);
});

btnAplicarManual.addEventListener("click", () => {
  aplicarValorManual();
});

// También permitir aplicar con Enter en el input manual
inputValorManual.addEventListener("keypress", (ev) => {
  if (ev.key === "Enter") {
    aplicarValorManual();
  }
});

btnGlobalCerrar.addEventListener("click", () => {
  // Deseleccionar todas las tarjetas
  document.querySelectorAll(".persona.seleccionada").forEach(card => {
    card.classList.remove("seleccionada");
    card.dataset.seleccionada = "false";
  });
  actualizarControlesGlobales();
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
