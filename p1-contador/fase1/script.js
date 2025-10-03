let contador = 10; // Variable que guarda el valor actual del contador
// Referencias a los elementos del DOM
const spanContador = document.getElementById("contador");
const btnMas = document.getElementById("btn-mas");
const btnMenos = document.getElementById("btn-menos");
<<<<<<< HEAD
const btnMasdec = document.getElementById("btn-masdec");
const btnMenosdec = document.getElementById("btn-menosdec");
const btnReset = document.getElementById("btn-reset");
const inputPaso = document.getElementById("input-paso");
let paso = parseInt(inputPaso.value) || 1;

function actualizarContador() {
  // Mostrar sin decimales si es entero, con un decimal si no lo es
  spanContador.textContent = (contador % 1 === 0) ? contador.toFixed(0) : contador.toFixed(1);
  console.log("mensaje");
=======
const btnRedondeadoMenos = document.getElementById("btn-redondeado-menos");
const btnRedondeadoMas = document.getElementById("btn-redondeado-mas");
const btnMuerte = document.getElementById("btn-muerte");
const btnMagico = document.getElementById("btn-magico");

function actualizarContador() {

  // toFixed(1) obliga a redondear y formatear el número a un solo decimal
  spanContador.textContent = contador.toFixed(1);
  console.log("mensaje");// Mensaje de depuración en la consola

  // Cambiar color según rango
  if (contador >= 9) {
    spanContador.style.color = "green";
  } else if (contador >=7) {
    spanContador.style.color = "greenyellow";
  } else if (contador === 6){
    spanContador.style.color = "yellow";
  } else if(contador === 5){
    spanContador.style.color = "orange";
  } else{spanContador.style.color="red";}

>>>>>>> 3145f5dc2788541f5efeb27ba54a9204943ae98a
  // Efecto visual para marcar el cambio
  spanContador.classList.add("changed");
   // Después de 200ms se quita la clase para que pueda repetirse el efecto
  setTimeout(() => spanContador.classList.remove("changed"), 200);
<<<<<<< HEAD
  actualizarBotones();

  // Cambiar color del contador

  //Eliminar color
  spanContador.classList.remove("color-rojo", "color-amarillo", "color-verde");

  //Añadir color
  if (contador >= 0 && contador <= 4.9) {
    spanContador.classList.add("color-rojo");
  } else if (contador >= 5 && contador <= 7.9) {
    spanContador.classList.add("color-amarillo");
  } else if (contador >= 8 && contador <= 10) {
    spanContador.classList.add("color-verde");
  }


}

// Redondear a un decimal después de cada suma/resta
btnMas.addEventListener("click", () => {
  contador = +(contador + paso).toFixed(1);
  if (contador > 10) {
    contador = 10;
  }
=======

}

btnRedondeadoMas.addEventListener("click", () => {
  contador+=0.1;
  if(contador>10) contador=10;
  actualizarContador();
});

btnMas.addEventListener("click", () => {

  contador+=1;
  if(contador>10) contador=10;
  actualizarContador();
});

btnRedondeadoMenos.addEventListener("click", () => {
  contador-=0.1;
  if(contador<0) contador=0;

>>>>>>> 3145f5dc2788541f5efeb27ba54a9204943ae98a
  actualizarContador();
});

btnMenos.addEventListener("click", () => {
<<<<<<< HEAD
  contador = +(contador - paso).toFixed(1);
  if (contador < 0) {
    contador = 0;
  }
=======

  contador-=1;
  if(contador<0) contador=0;
  actualizarContador();
});

btnMuerte.addEventListener("click", () => {
  contador = 0;
  actualizarContador();
});

btnMagico.addEventListener("click", () => {
  contador= Number((Math.random()*10).toFixed(1));

>>>>>>> 3145f5dc2788541f5efeb27ba54a9204943ae98a
  actualizarContador();
});

btnMasdec.addEventListener("click", () => {
  contador = +(contador + paso/10).toFixed(1); // Redondear a un decimal
  if (contador > 10) {
    contador = 10;
  }
  actualizarContador();
});

btnMenosdec.addEventListener("click", () => {
  contador = +(contador - paso/10).toFixed(1); // Redondear a un decimal
  if (contador < 0) {
    contador = 0;
  }
  actualizarContador();
});


// Manejo de teclas
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      if (contador < 10) {
        contador = +(contador + 1).toFixed(1);
        if (contador > 10) contador = 10;
        actualizarContador();
      }
      break;
    case "ArrowDown":
      if (contador > 0) {
        contador = +(contador - 1).toFixed(1);
        if (contador < 0) contador = 0;
        actualizarContador();
      }
      break;
    case "ArrowRight":
      if (contador < 10) {
        contador = +(contador + 0.1).toFixed(1);
        if (contador > 10) contador = 10;
        actualizarContador();
      }
      break;
    case "ArrowLeft":
      if (contador > 0) {
        contador = +(contador - 0.1).toFixed(1);
        if (contador < 0) contador = 0;
        actualizarContador();
      }
      break;
  }
});

// Inicialización
//Llamada inicial para mostrar el contador en pantalla al cargar
actualizarContador();

//Desactivar botones
function actualizarBotones() {
  btnMas.disabled = contador >= 10;
  btnMenos.disabled = contador <= 0;
  btnMasdec.disabled = contador >= 10;
  btnMenosdec.disabled = contador <= 0;
}


//Boton para resetear el contador
btnReset.addEventListener("click", () => {
  contador = 0;
  actualizarContador();
});


//Cambiar los botones
function actualizarBotonesPaso() {
  btnMas.textContent = `+${paso}`;
  btnMenos.textContent = `-${paso}`;
  btnMasdec.textContent = `+${(paso / 10).toFixed(1)}`;
  btnMenosdec.textContent = `-${(paso / 10).toFixed(1)}`;
}

inputPaso.addEventListener("input", () => {
  let nuevoPaso = parseInt(inputPaso.value);
  if (!isNaN(nuevoPaso) && nuevoPaso >= 1 && nuevoPaso <= 10) {
    paso = nuevoPaso;
    actualizarBotonesPaso();
  }
});
