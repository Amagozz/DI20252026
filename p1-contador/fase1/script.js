let contador = 5;
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
  if(contador > 8) {
    spanContador.style.color = "green";
  } else if(contador > 5) {
    spanContador.style.color = "orange";
  } else if(contador > 3) {
    spanContador.style.color = "red"; spanContador        
  }

}

btnMas.addEventListener("click", () => {
  if(contador > 9.9) return;
  contador += 0.1;
  actualizarContador();
});

btnMenos.addEventListener("click", () => {
  if(contador < 0.1) return;
  contador -= 0.1;
  actualizarContador();
});

// Inicialización
actualizarContador();
