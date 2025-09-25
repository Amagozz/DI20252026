let contador = 10;
const spanContador = document.getElementById("contador");
const btnMas = document.getElementById("btn-mas");
const btnMenos = document.getElementById("btn-menos");
const mensajeDelEvento = document.getElementById("mensajeDelEvento")

function actualizarContador() {
  spanContador.textContent = Number.isInteger(contador) ? contador : contador.toFixed(1);
;

  // Efecto visual para marcar el cambio
  spanContador.classList.add("changed");
  setTimeout(() => spanContador.classList.remove("changed"), 200);
}

btnMas.addEventListener("click", () => {
  if (contador < 10) {
      contador+=0.1;
      mensajeDelEvento.textContent = "";
  } else {
    mensajeDelEvento.textContent = "La nota máxima es 10, no puedes pasarte";
  }
  actualizarContador();
});

btnMenos.addEventListener("click", () => {
  if (contador >=0) {
    contador-=0.1;
    mensajeDelEvento.textContent = "";
  } else {
    mensajeDelEvento.textContent = "La nota minima es 0, no puedes quitarle más";
  }
  
  actualizarContador();
});

// Inicialización
actualizarContador();
