let contador = 10;
const spanContador = document.getElementById("contador");
const btnMas = document.getElementById("btn-mas");
const btnMenos = document.getElementById("btn-menos");

function actualizarContador() {
  spanContador.textContent = contador.toFixed(2);

  // Efecto visual para marcar el cambio
  spanContador.classList.add("changed");
  setTimeout(() => spanContador.classList.remove("changed"), 200);
}

btnMas.addEventListener("click", () => {
  if (contador < 10) {
    contador = Math.min(10, contador + 0.10);
    actualizarContador();
  }
});

btnMenos.addEventListener("click", () => {
  contador = Math.max(0, contador - 0.10);
  actualizarContador();
});

// Inicialización
actualizarContador();

