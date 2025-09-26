let contador = 10;
const spanContador = document.getElementById("contador");
const btnMas = document.getElementById("btn-mas");
const btnMenos = document.getElementById("btn-menos");

function actualizarContador() {
  spanContador.textContent = parseFloat(contador).toFixed(1);

  // Efecto visual para marcar el cambio
  spanContador.classList.add("changed");
  setTimeout(() => spanContador.classList.remove("changed"), 350);
  efectoColorDelContador();
}
function efectoColorDelContador() {
  if (contador > 8) {
    spanContador.style.color = "green";
  } else if (contador > 5) {
    spanContador.style.color = "orange";
  } else if (contador > 3) {
    spanContador.style.color = "red";
  }
}

// Inicialización
actualizarContador();
