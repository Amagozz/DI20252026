let contador = 10;
const spanContador = document.getElementById("contador");
const btnMas = document.getElementById("btn-mas");
const btnMenos = document.getElementById("btn-menos");

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
  } else {
    console.log("La nota maxima es 10")
  }
  actualizarContador();
});

btnMenos.addEventListener("click", () => {
  if (contador >=0) {
    contador-=0.1;
  } else {
    console.log("La nota minima es 0")
  }
  
  actualizarContador();
});

// Inicialización
actualizarContador();
