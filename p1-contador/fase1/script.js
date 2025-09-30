let contador = 10;
const spanContador = document.getElementById("contador");
const btnMas = document.getElementById("btn-mas");
const btnMenos = document.getElementById("btn-menos");

function actualizarContador() {

  spanContador.textContent = contador.toFixed(1);

  spanContador.classList.add("changed");
  
  setTimeout(() => spanContador.classList.remove("changed"), 200);
  
}

btnMas.addEventListener("click", () => {

  if (contador < 10){
    contador += 1;
  if (contador > 10.0) contador = 10;

  actualizarContador();
}});

btnMenos.addEventListener("click", () => {

   if (contador > 0) {
    contador -= 0.1;
    if (contador < 0) contador = 0;
   
  actualizarContador();
}});

// Inicialización
actualizarContador();
