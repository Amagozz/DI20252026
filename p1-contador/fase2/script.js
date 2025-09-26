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
const btnGlobalCerrar = document.getElementById("btn-global-cerrar");

// --------- Utilidades ---------
function normalizaNombre(s) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

function renderPersona(nombre, valor = 10) {
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.nombre = nombre;
  node.querySelector(".nombre").textContent = nombre;
  const input = node.querySelector(".contador");
  input.value = valor;
  input.dataset.valor = String(valor);
  
  // Configurar checkbox con ID único
  const checkboxId = `checkbox-${nombre.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const checkbox = node.querySelector(".checkbox-persona");
  const label = node.querySelector(".checkbox-label");
  checkbox.id = checkboxId;
  label.setAttribute('for', checkboxId);
  
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
  document.querySelectorAll(".checkbox-persona:checked").forEach(checkbox => {
    const card = checkbox.closest(".persona");
    if (card) {
      seleccionados.add(card.dataset.nombre);
    }
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
      const checkbox = node.querySelector(".checkbox-persona");
      if (checkbox) {
        checkbox.checked = true;
      }
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
  const checkboxes = document.querySelectorAll(".checkbox-persona:checked");
  const cantidad = checkboxes.length;
  
  contadorSeleccionados.textContent = `${cantidad} seleccionado${cantidad !== 1 ? 's' : ''}`;
  
  if (cantidad > 0) {
    controlesGlobales.classList.remove("hidden");
    // Agregar clase a las tarjetas seleccionadas
    document.querySelectorAll(".persona").forEach(card => {
      const checkbox = card.querySelector(".checkbox-persona");
      if (checkbox.checked) {
        card.classList.add("seleccionada");
      } else {
        card.classList.remove("seleccionada");
      }
    });
  } else {
    controlesGlobales.classList.add("hidden");
    document.querySelectorAll(".persona").forEach(card => {
      card.classList.remove("seleccionada");
    });
  }
}

function aplicarCambioGlobal(incremento) {
  const checkboxes = document.querySelectorAll(".checkbox-persona:checked");
  if (checkboxes.length === 0) return;
  
  let hayIncremento = false;
  let hayDecremento = false;
  
  checkboxes.forEach(checkbox => {
    const card = checkbox.closest(".persona");
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

// Event listeners para checkboxes (selección múltiple)
lista.addEventListener("change", (ev) => {
  if (ev.target.classList.contains("checkbox-persona")) {
    console.log("Checkbox changed:", ev.target.checked); // Debug
    actualizarControlesGlobales();
  }
});

// También escuchar clics en los labels para mayor compatibilidad
lista.addEventListener("click", (ev) => {
  if (ev.target.classList.contains("checkbox-label")) {
    const checkbox = ev.target.previousElementSibling;
    if (checkbox && checkbox.classList.contains("checkbox-persona")) {
      // Cambio manual si es necesario (aunque debería funcionar automáticamente)
      setTimeout(() => {
        console.log("Label clicked, checkbox state:", checkbox.checked); // Debug
        actualizarControlesGlobales();
      }, 10);
    }
  }
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

btnGlobalCerrar.addEventListener("click", () => {
  // Deseleccionar todos los checkboxes
  document.querySelectorAll(".checkbox-persona:checked").forEach(checkbox => {
    checkbox.checked = false;
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
