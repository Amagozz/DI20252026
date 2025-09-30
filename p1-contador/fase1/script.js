let contadores = [10, 10, 10, 10];
let holdInterval;
let seleccionadas = [];

let modoFiesta = false;
let fiestaInterval;
let velocidad = 1;
let colorHue = 0;
let shakeStep = 0;
let contadoresBackup = [];

const cajas = [
  document.getElementById("caja0"),
  document.getElementById("caja1"),
  document.getElementById("caja2"),
  document.getElementById("caja3")
];

const spansContador = [
  document.getElementById("contador0"),
  document.getElementById("contador1"),
  document.getElementById("contador2"),
  document.getElementById("contador3")
];

const btnMas = document.getElementById("btn-mas");
const btnMenos = document.getElementById("btn-menos");
const btn0 = document.getElementById("btn-0");
const inputPasos = document.getElementById("pasos");
const botones = [btnMas, btnMenos, btn0];
const labelPasos = document.querySelector("label[for='pasos']");
const audioFiesta = document.getElementById("audio-fiesta");

// --- Seleccion multi-alumno ---
cajas.forEach((caja, index) => {
  caja.addEventListener("click", () => {
    if (seleccionadas.includes(index)) {
      seleccionadas = seleccionadas.filter(i => i !== index);
      caja.classList.remove("seleccionada");
    } else {
      seleccionadas.push(index);
      caja.classList.add("seleccionada");
    }
  });
});

// --- Actualizar contadores con color según acción ---
function actualizarContadores(tipo) {
  seleccionadas.forEach(i => {
    contadores[i] = Math.round(contadores[i] * 10) / 10;
    const span = spansContador[i];
    span.textContent = contadores[i];

    // Quitar clases anteriores
    span.classList.remove("changed-suma", "changed-resta", "changed-reset");

    // Agregar clase segun tipo
    if (tipo === "suma") span.classList.add("changed-suma");
    else if (tipo === "resta") span.classList.add("changed-resta");
    else if (tipo === "reset") span.classList.add("changed-reset");
  });
}

// --- Quitar efecto visual ---
function quitarEfecto() {
  seleccionadas.forEach(i => {
    const span = spansContador[i];
    span.classList.remove("changed-suma", "changed-resta", "changed-reset");
  });
}

//FLECHAS
document.addEventListener("keydown", (event) => {
  if (seleccionadas.length === 0) return;

  switch (event.key) {
    case "ArrowUp":
      // Subir contador
      seleccionadas.forEach(i => {
        contadores[i] += getPasos();
        if (contadores[i] > 10) contadores[i] = 10;
      });
      actualizarContadores("suma");
      break;

    case "ArrowDown":
      // Bajar contador
      seleccionadas.forEach(i => {
        contadores[i] -= getPasos();
        if (contadores[i] < 0) contadores[i] = 0;
      });
      actualizarContadores("resta");
      break;

    case "x":
      seleccionadas.forEach(i => contadores[i] = 0);
      actualizarContadores("reset");
      break;

    case "f":

      break;
  }
});

// --- Botón MAS ---
btnMas.addEventListener("mousedown", () => {
  doActionBtnMas();
  holdInterval = setInterval(doActionBtnMas, 200);
});
btnMas.addEventListener("mouseup", quitarIntervalo);
btnMas.addEventListener("mouseleave", quitarIntervalo);

function doActionBtnMas() {
  seleccionadas.forEach(i => {
    contadores[i] += getPasos();
    if (contadores[i] > 10) contadores[i] = 10;
  });
  actualizarContadores("suma");
}

// --- Botón MENOS ---
btnMenos.addEventListener("mousedown", () => {
  doActionBtnMenos();
  holdInterval = setInterval(doActionBtnMenos, 200);
});
btnMenos.addEventListener("mouseup", quitarIntervalo);
btnMenos.addEventListener("mouseleave", quitarIntervalo);

function doActionBtnMenos() {
  seleccionadas.forEach(i => {
    contadores[i] -= getPasos();
    if (contadores[i] < 0) contadores[i] = 0;
  });
  actualizarContadores("resta");
}

// --- Boton RESET ---
btn0.addEventListener("click", () => {
  seleccionadas.forEach(i => contadores[i] = 0);
  actualizarContadores("reset");
});

// --- Funcion de finalizacion de hold ---
function quitarIntervalo() {
  clearInterval(holdInterval);
  quitarEfecto();
}

// --- Obtener paso ---
function getPasos() {
  return parseFloat(inputPasos.value) || 0.1;
}

// Inicialización
actualizarContadores("reset");












document.addEventListener("keydown", (event) => {
  if (event.key === "f" || event.key === "F") {
    if (!modoFiesta) {
      activarModoFiesta();
    } else {
      desactivarModoFiesta();
    }
  }
});

function activarModoFiesta() {
  modoFiesta = true;
  velocidad = 1;
  shakeStep = 0;
  contadoresBackup = [...contadores];

  audioFiesta.play();

  const h1 = document.querySelector("h1");
  h1.classList.add("h1-fiesta");

  document.body.style.backgroundImage = "url('ditto.gif')";
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundRepeat = "no-repeat";

  spansContador.forEach(span => span.classList.add("span-fiesta"));

  labelPasos.style.display = "none";
  inputPasos.classList.add("input-fiesta");

  botones.forEach(btn => {
    btn.style.display = "none";
  });

  fiestaInterval = setInterval(() => {
    velocidad += 0.02;

    for (let i = 0; i < contadores.length; i++) {
      contadores[i] += getPasos() * velocidad;
      spansContador[i].textContent = Math.round(contadores[i] * 10) / 10;
    }

    cajas.forEach((caja, i) => {
      const scale = 1 + Math.sin(Date.now() / 200 + i) * 0.5;
      caja.style.transform = `scale(${scale})`;
      const hue = (Math.random() * 360) % 360;
      caja.style.backgroundColor = `hsl(${hue}, 80%, 70%)`;
    });

    botones.forEach(btn => {
      const contenedor = document.getElementById("contador-container");
      const maxX = contenedor.clientWidth - btn.offsetWidth;
      const maxY = contenedor.clientHeight - btn.offsetHeight;
      btn.style.left = Math.random() * maxX + "px";
      btn.style.top = Math.random() * maxY + "px";
    });

  }, 100);
}

function desactivarModoFiesta() {
  modoFiesta = false;
  clearInterval(fiestaInterval);

  audioFiesta.pause();

  contadores = [...contadoresBackup];
  spansContador.forEach((span, i) => {
    span.textContent = Math.round(contadores[i] * 10) / 10;
    span.classList.remove("span-fiesta");
    span.style.color = "";
  });

  cajas.forEach(caja => {
    caja.style.transform = "";
    caja.style.backgroundColor = "#d3d3d3";
  });

  labelPasos.style.display = "";
  inputPasos.classList.remove("input-fiesta");
  inputPasos.style.color = "";
  inputPasos.style.transform = "";

  const h1 = document.querySelector("h1");
  h1.classList.remove("h1-fiesta");

  botones.forEach(btn => {
    btn.style.display = "";
    btn.style.position = "";
    btn.style.top = "";
    btn.style.left = "";
    btn.style.zIndex = "";
  });

  document.body.style.backgroundImage = "";
  document.body.style.transform = "";


}