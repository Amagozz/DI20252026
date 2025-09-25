let contador = 10;
const spanContador = document.getElementById("contador");
const btnMas = document.getElementById("btn-mas");
const btnMenos = document.getElementById("btn-menos");
const max = 10;
const min = 0;

function actualizarContador() {
  spanContador.textContent = contador;

  // Efecto visual para marcar el cambio
  spanContador.classList.add("changed");
  setTimeout(() => spanContador.classList.remove("changed"), 200);
}

btnMas.addEventListener("click", () => {
  contador = contador + 0.1;
  contador = Math.round(contador * 10)/10;
  actualizarContador();
});

btnMenos.addEventListener("click", () => {
  contador = contador - 0.1;
  contador = Math.round(contador * 10)/10;
  actualizarContador();
});

// Inicialización
actualizarContador();
