let contador = 10;
const spanContador = document.getElementById("contador");
const btnMas = document.getElementById("btn-mas");
const btnMenos = document.getElementById("btn-menos");

function actualizarContador() {
  spanContador.textContent = parseFloat(contador).toFixed(1);
  // Efecto visual para marcar el cambio
  spanContador.classList.add("changed");
  setTimeout(() => spanContador.classList.remove("changed"), 200);
}

btnMas.addEventListener("click", () => {
  if (contador < 10.0) {
  contador = contador + 0.1;
  }
  actualizarContador();
});

btnMenos.addEventListener("click", () => {
  if (contador => 0.1){
   contador = contador - 0.1;
  }
  actualizarContador();
});

// Inicialización
actualizarContador();
