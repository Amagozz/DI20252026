const btnMas = document.getElementById("btn-mas");
const btnMenos = document.getElementById("btn-menos");
const btnBoom = document.getElementById("btn-boom");
const btnDeselect = document.getElementById("btn-deselect");
const btnRandom = document.getElementById("btn-random");
const inputStep = document.getElementById("input-step");

const imgBoom = document.getElementById("img-boom");
const audioBoom = new Audio("explosion.ogg");

let numeroAlumnos = 3; //Change depending on how many alumnos you have

const alumnos = [];
const contadores = [];

for (let i = 1; i <= numeroAlumnos; i++)
{
  const alumnoElem = document.getElementById(`alumno${i}`);
  const contadorElem = document.getElementById(`contador-alumno${i}`);

  if (alumnoElem && contadorElem) // to avoid nulls
  {
    alumnos.push(alumnoElem);
    contadores.push({
      contador: parseInt(contadorElem.textContent), // value of the contador
      selected: false,
      span: contadorElem // span contador
    });

    alumnoElem.addEventListener("click", () => // selects or de selects
    {
      const alumnoData = contadores[i - 1];
      alumnoData.selected = !alumnoData.selected;
      alumnoElem.style.border = alumnoData.selected ? "2px solid black" : "2px solid transparent";
    });
  }
}

function actualizarContador() {
  contadores.forEach(contador => {
    contador.span.textContent = contador.contador;
    contador.span.classList.add("changed");
    setTimeout(() => contador.span.classList.remove("changed"), 200);
  });
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
    spanContador.style.color = "red";
  }

}

// + button
function plusButton()
{
  contadores.forEach(contador => {
    if (contador.selected) {
      contador.contador = Math.min(contador.contador + getSteps(), 10);
      contador.contador = Math.round(contador.contador * 10) / 10; // round to 1 decimal
    }
  });
  actualizarContador();
}

btnMas.addEventListener("click", () => {
  plusButton();
});

document.addEventListener("keydown", (event) =>
{
   switch(event.key) {
    case "ArrowUp":
    case "ArrowRight":
      plusButton();
      break;

    case "ArrowDown":
    case "ArrowLeft":
      minusButton();
      break;
  }
});

// - button
function minusButton()
{
  contadores.forEach(contador => {
    if (contador.selected) {
      contador.contador = Math.max(contador.contador - getSteps(), 0);
      contador.contador = Math.round(contador.contador * 10) / 10; // round to 1 decimal
    }
  });
  actualizarContador();
}

btnMenos.addEventListener("click", () => {
  minusButton();
});

// Boom button
btnBoom.addEventListener("click", () => {
  let hasExploded = false;

  contadores.forEach(contador => {
    if (contador.selected) {
      contador.contador = 0;
      hasExploded = true;
    }
  });

  if (hasExploded) {
    imgBoom.src = "blood.gif";
    imgBoom.style.zIndex = 9999;
    imgBoom.style.opacity = 1;
    audioBoom.play();

    setTimeout(() => {
      imgBoom.style.zIndex = "-9999";
      imgBoom.src = "";
      imgBoom.style.opacity = 0;
    }, 2000);
  }
  actualizarContador();
});

btnDeselect.addEventListener("click", () =>
{
  contadores.forEach((contador, index) =>
  {
    contador.selected = false;
    alumnos[index].style.border = "2px solid transparent";
  });
});

btnRandom.addEventListener("click", () =>
{
  contadores.forEach(contador =>
  {
    if (contador.selected)
    {
      contador.contador = Math.random() * (10 - 0.1) + 0.1;
      contador.contador = Math.round(contador.contador * 10) / 10; // round to 1 decimal
    }
  });
  actualizarContador();
});

function getSteps()
{
  let step = parseFloat(inputStep.value);
  step = Math.max(0.1, Math.min(step, 10));
  inputStep.value = step;
  return step;
}

// Update
actualizarContador();
