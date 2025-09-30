let contador = 10;
const spanContador = document.getElementById("contador");
const btnMas = document.getElementById("btn-mas");
const btnMenos = document.getElementById("btn-menos");
const mensajeDelEvento = document.getElementById("mensajeDelEvento")

function actualizarContador() {
<<<<<<< HEAD
  spanContador.textContent = Number.isInteger(contador) ? contador : contador.toFixed(1);
;
=======
  spanContador.textContent = parseFloat(contador).toFixed(1);
>>>>>>> origin

  // Efecto visual para marcar el cambio
  spanContador.classList.add("changed");
  setTimeout(() => spanContador.classList.remove("changed"), 350);
  efectoColorDelContador();
}
function efectoColorDelContador() {
  if(contador > 8) {
    spanContador.style.color = "green";
  } else if(contador > 5) {
    spanContador.style.color = "orange";
  } else if(contador > 3) {
    spanContador.style.color = "red";
  }

}

btnMas.addEventListener("click", () => {
<<<<<<< HEAD
  if (contador < 10) {
      contador+=0.1;
      mensajeDelEvento.textContent = "";
  } else {
    mensajeDelEvento.textContent = "La nota máxima es 10, no puedes pasarte";
  }
=======
  if(contador > 9.9) return;
  contador += 0.1;
>>>>>>> origin
  actualizarContador();
});

btnMenos.addEventListener("click", () => {
<<<<<<< HEAD
  if (contador >=0) {
    contador-=0.1;
    mensajeDelEvento.textContent = "";
  } else {
    mensajeDelEvento.textContent = "La nota minima es 0, no puedes quitarle más";
  }
  
=======
  if(contador < 0.1) return;
  contador -= 0.1;
>>>>>>> origin
  actualizarContador();
});

// Inicialización
actualizarContador();
