let contador = 10;
let contdec=0.1;
//AÑADIR COLORES AL BAJAR Y SUBIR NOTA (VERDE Y ROJO)
const spanContador = document.getElementById("contador");
const spanDecimal= document.getElementById("dec-valor");
const btnRandom = document.getElementById("random");
const btnRedondeo = document.getElementById("redondeo");
const btnMas = document.getElementById("btn-mas");
const btnMenos = document.getElementById("btn-menos");
const btn01Mas = document.getElementById("btn-01mas");
const btn01Menos = document.getElementById("btn-01menos");
const decMas = document.getElementById("dec-mas");
const decMenos = document.getElementById("dec-menos");
const btnzero = document.getElementById("btn-zero");
const contenedor = document.getElementById("contador-container");
const decimales = document.getElementById("decimales");

window.addEventListener("DOMContentLoaded", () => {
  decimales.selectedIndex = 0;
});

decimales.addEventListener("mouseleave", () => {
  decimales.blur();
  
});
decMas.addEventListener("click", () => {
  contdec=contdec+0.1;
  contdec=Number(contdec.toFixed(1));
  actualizarContador();
});
decMenos.addEventListener("click", () => {
  contdec=contdec-0.1;
  contdec=Number(contdec.toFixed(1));
  actualizarContador();
});


function actualizarContador() {  
  limitarContador();
  spanContador.textContent = contador.toFixed(1);
  spanDecimal.textContent = contdec;
  btn01Mas.textContent = `+${contdec}`;
   btn01Menos.textContent = `-${contdec}`;
  cambiarColorTexto();


  
  // Efecto visual para marcar el cambio
  spanContador.classList.add("changed");
  setTimeout(() => spanContador.classList.remove("changed"), 200);
}

function cambiarColorTexto() {
  if(contador==5){
    spanContador.style.color="#e27833";
  }else if(contador>5 && contador<=7){
    spanContador.style.color="#82aa36ff";
  }else if(contador>7 && contador<=10){
    spanContador.style.color="#53d35dff";
  }else if(contador<5 && contador>=3){
    spanContador.style.color="#b79d1aff";
  }else if(contador<3 && contador>0){ 
    spanContador.style.color="#e27833";
  }else if(contador==0){
    spanContador.style.color="#d63447ff";
  }

}

document.addEventListener("keydown", (event) => {
  if (contenedor.mouseover || contenedor.matches(':hover')) {
    switch (event.key) {
      case "ArrowUp":
        contador++;
        actualizarContador();
        break;
      case "ArrowDown":
        contador--;
        actualizarContador();
        break;
      case "ArrowRight":
        contador=contador + contdec;
        actualizarContador();
        break;
      case "ArrowLeft":
        contador=contador - contdec;
        actualizarContador();
        break;
      case "0":
        contador = 0;
        actualizarContador();
        break;
    }
  }
});

btnRandom.addEventListener("click", () => {
  contador = Math.random() * 10;
  contador=Number(contador.toFixed(1));
  actualizarContador();
});

btnRedondeo.addEventListener("click", () => {

  let num= Math.trunc(contador);
  let random= Math.random();
  contador = Math.trunc(contador);
  if (random < 0.5) {
    contador = num;
  } else {
    contador = num + 1;
  }
  actualizarContador();
});

btnMas.addEventListener("click", () => {
  contador++;
  actualizarContador();
});

btnMenos.addEventListener("click", () => {
  contador--;
  actualizarContador();
});
btn01Mas.addEventListener("click", () => {
  contador=contador + contdec;
  actualizarContador();
});

btn01Menos.addEventListener("click", () => {
  contador=contador - contdec;
  actualizarContador();
});
btnzero.addEventListener("click", () => {
  contador= 0;
  actualizarContador();
});




function limitarContador() {
  btnMas.disabled = false;
  btnMenos.disabled = false;
  btn01Mas.disabled = false;
  btn01Menos.disabled = false;
  decMas.disabled = false;
  decMenos.disabled = false;
  if (contador <=0){
    contador=0;
    btnMas.disabled = false;
    btn01Mas.disabled = false;
    btnMenos.disabled = true;
    btn01Menos.disabled = true;
  }else if (contador >=10){
    contador=10;
    btnMas.disabled = true;
    btn01Mas.disabled = true;
    btnMenos.disabled = false;
    btn01Menos.disabled = false;
  }
  if (contdec<=0.1){
    contdec=0.1;
    decMas.disabled = false;
    decMenos.disabled = true;
  }else if (contdec>=1.0){
    contdec=0.9;
    decMas.disabled = true;
    decMenos.disabled = false;
  }
}

// Inicialización
actualizarContador();
