// --- Selección de elementos ---
const inputArchivo = document.getElementById("input-archivo");
const listaContadores = document.getElementById("lista-contadores");
const btnResetTodos = document.getElementById("btn-reset-todos");
const inputPaso = document.getElementById("input-paso");
const btnSubir = document.querySelector(".btn-subir");


let paso = parseInt(inputPaso.value) || 1;

// --- Selección múltiple ---
let seleccionados = new Set();


function crearContador(nombre) {
  // Crear elementos
  const card = document.createElement("div");
  card.className = "contador-card";

  const nombreElem = document.createElement("div");
  nombreElem.className = "nombre";
  nombreElem.textContent = nombre;

  const spanContador = document.createElement("span");
  spanContador.className = "contador";
  spanContador.textContent = "10";
  spanContador.dataset.valor = "10";

  // Botones
  const btnMenos = document.createElement("button");
  btnMenos.textContent = `-${paso}`;
  btnMenos.className = "menos";
  const btnMas = document.createElement("button");
  btnMas.textContent = `+${paso}`;
  btnMas.className = "mas";
  const btnMenosDec = document.createElement("button");
  btnMenosDec.textContent = `-${(paso/10).toFixed(1)}`;
  btnMenosDec.className = "menosdec";
  const btnMasDec = document.createElement("button");
  btnMasDec.textContent = `+${(paso/10).toFixed(1)}`;
  btnMasDec.className = "masdec";

  // Botón reset
  const btnReset = document.createElement("button");
  btnReset.className = "reset-nuclear";
  const imgReset = document.createElement("img");
  imgReset.src = "img/monokuma-danganronpa.gif";
  imgReset.alt = "Reset";
  imgReset.className = "img-reset";
  btnReset.appendChild(imgReset);

  // Contenedor de botones
  const botones = document.createElement("div");
  botones.className = "contador-botones";
  botones.appendChild(btnMenos);
  botones.appendChild(btnMas);
  botones.appendChild(btnMenosDec);
  botones.appendChild(btnMasDec);

  // Añadir
  card.appendChild(nombreElem);
  card.appendChild(spanContador);
  card.appendChild(botones);
  card.appendChild(btnReset);

  // Botones
  let valor = 10;
  function actualizarVisual() {
    spanContador.textContent = (valor % 1 === 0) ? valor.toFixed(0) : valor.toFixed(1);
    spanContador.dataset.valor = valor;
    spanContador.classList.remove("color-rojo", "color-amarillo", "color-verde");
    if (valor >= 0 && valor <= 4.9) {
      spanContador.classList.add("color-rojo");
    } else if (valor >= 5 && valor <= 7.9) {
      spanContador.classList.add("color-amarillo");
    } else if (valor >= 8 && valor <= 10) {
      spanContador.classList.add("color-verde");
    }
    spanContador.classList.add("changed");
    setTimeout(() => spanContador.classList.remove("changed"), 200);
    btnMas.textContent = `+${paso}`;
    btnMenos.textContent = `-${paso}`;
    btnMasDec.textContent = `+${(paso/10).toFixed(1)}`;
    btnMenosDec.textContent = `-${(paso/10).toFixed(1)}`;
  }

  // --- Selección múltiple ---
  card.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON" || e.target.tagName === "IMG") return;
    if (card.classList.contains("selected")) {
      card.classList.remove("selected");
      seleccionados.delete(card);
    } else {
      card.classList.add("selected");
      seleccionados.add(card);
    }
  });

  // --- Botones que afectan a todos los seleccionados ---
  function paraSeleccionados(fn) {
    if (seleccionados.size > 0 && seleccionados.has(card)) {
      seleccionados.forEach(c => {
        if (c._actualizarValor) fn(c);
      });
    } else {
      fn(card);
    }
  }

  btnMas.addEventListener("click", (e) => {
    e.stopPropagation();
    paraSeleccionados(c => {
      c._valor = +(c._valor + paso).toFixed(1);
      if (c._valor > 10) c._valor = 10;
      c._actualizarValor();
    });
  });
  btnMenos.addEventListener("click", (e) => {
    e.stopPropagation();
    paraSeleccionados(c => {
      c._valor = +(c._valor - paso).toFixed(1);
      if (c._valor < 0) c._valor = 0;
      c._actualizarValor();
    });
  });
  btnMasDec.addEventListener("click", (e) => {
    e.stopPropagation();
    paraSeleccionados(c => {
      c._valor = +(c._valor + paso/10).toFixed(1);
      if (c._valor > 10) c._valor = 10;
      c._actualizarValor();
    });
  });
  btnMenosDec.addEventListener("click", (e) => {
    e.stopPropagation();
    paraSeleccionados(c => {
      c._valor = +(c._valor - paso/10).toFixed(1);
      if (c._valor < 0) c._valor = 0;
      c._actualizarValor();
    });
  });
btnReset.addEventListener("click", (e) => {
  e.stopPropagation();
  paraSeleccionados(c => {
    c._valor = 0; 
    c._actualizarValor();
  });
});

  // global
  inputPaso.addEventListener("input", () => {
    let nuevoPaso = parseInt(inputPaso.value);
    if (!isNaN(nuevoPaso) && nuevoPaso >= 1 && nuevoPaso <= 10) {
      paso = nuevoPaso;
      actualizarVisual();
    }
  });

  // selección múltiple
  card._valor = valor;
  card._actualizarValor = function() {
    valor = card._valor;
    actualizarVisual();
  };

  actualizarVisual();
  return card;
}

// --- Leer archivo de nombres ---
function cargarNombresDesdeArchivo(ruta) {
  fetch(ruta)
    .then(response => {
      if (!response.ok) throw new Error("No se pudo cargar nombres.txt");
      return response.text();
    })
    .then(texto => {
      seleccionados.clear();
      const nombres = texto.split(/\r?\n/).map(n => n.trim()).filter(n => n.length > 0);
      listaContadores.innerHTML = "";
      nombres.forEach(nombre => {
        const card = crearContador(nombre);
        listaContadores.appendChild(card);
      });
    })
    .catch(err => {
      console.warn("No se pudo cargar nombres.txt automáticamente:", err.message);
    });
}

// --- Al cargar la página, lee el archivo ---
window.addEventListener("DOMContentLoaded", () => {
  cargarNombresDesdeArchivo("nombres.txt");
});

// --- Subir archivo manualmente ---
inputArchivo.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    seleccionados.clear();
    const contenido = evt.target.result;
    const nombres = contenido.split(/\r?\n/).map(n => n.trim()).filter(n => n.length > 0);
    listaContadores.innerHTML = "";
    nombres.forEach(nombre => {
      const card = crearContador(nombre);
      listaContadores.appendChild(card);
    });
  };
  reader.readAsText(file);
  inputArchivo.value = "";
});

btnSubir.addEventListener("click", (e) => {
  inputArchivo.click();
});

// --- Resetear todos los contadores ---
btnResetTodos.addEventListener("click", () => {
  document.querySelectorAll(".contador-card .reset-nuclear").forEach(btn => btn.click());
});