

// Obtener referencias a los elementos del DOM
const btnReset = document.getElementById("btn-reset"); // Botón para reiniciar todos los contadores
const cardsContainer = document.getElementById("cards-container"); // Contenedor de tarjetas
const addStudentForm = document.getElementById("add-student-form"); // Formulario para agregar estudiantes
const studentNameInput = document.getElementById("student-name"); // Input del nombre

// Array para guardar las tarjetas de los estudiantes
let students = [];

// Limita el valor del contador entre 0 y 10
function limitarContador(valor) {
  if (valor < 0) return 0;
  if (valor > 10) return 10;
  return valor;
}

// Crea una tarjeta de estudiante con su contador y botones
function crearTarjetaEstudiante(nombre) {
  const card = document.createElement("div"); // Tarjeta principal
  card.className = "student-card";

  const title = document.createElement("h2"); // Nombre del estudiante
  title.textContent = nombre;
  card.appendChild(title);

  const spanContador = document.createElement("span"); // Contador visual
  spanContador.className = "contador";
  spanContador.textContent = "10";
  card.appendChild(spanContador);


  const botonesDiv = document.createElement("div");
botonesDiv.className = "botones";

// Botones negativos
const grupoNegativo = document.createElement("div");
grupoNegativo.className = "grupo-negativo";
const btnMenos = document.createElement("button");
btnMenos.textContent = "-1";
const btnMenosDecimal = document.createElement("button");
btnMenosDecimal.textContent = "-0.1";
grupoNegativo.appendChild(btnMenos);
grupoNegativo.appendChild(btnMenosDecimal);

// Botones positivos
const grupoPositivo = document.createElement("div");
grupoPositivo.className = "grupo-positivo";
const btnMas = document.createElement("button");
btnMas.textContent = "+1";
const btnMasDecimal = document.createElement("button");
btnMasDecimal.textContent = "+0.1";
grupoPositivo.appendChild(btnMas);
grupoPositivo.appendChild(btnMasDecimal);

// Agrega los elementos al contenedor de botones en este orden:
botonesDiv.appendChild(grupoNegativo);
botonesDiv.appendChild(spanContador); // El número va en el centro
botonesDiv.appendChild(grupoPositivo);

card.appendChild(botonesDiv);

  let contador = 10; // Valor inicial del contador

  // Actualiza el valor mostrado del contador
  function actualizarContador() {
    spanContador.textContent = Number.isInteger(contador) ? contador : contador.toFixed(1);
    // Efecto visual al cambiar
    spanContador.classList.add("changed");
    setTimeout(() => spanContador.classList.remove("changed"), 200);
    // Quita clases anteriores de nivel
    card.classList.remove("nivel-bajo", "nivel-medio", "nivel-alto");
    // Asigna clase según el valor
    // Cambia el color de fondo según el valor
if (contador <= 3) {
  card.style.background = '#ffeaea'; // rojo muy suave
} else if (contador <= 7) {
  card.style.background = '#fffbe6'; // amarillo muy suave
} else {
  card.style.background = '#eaffea'; // verde muy suave
}
  }

  // Modo selecion de botones
  card.addEventListener("click", function() {
  if (window.modoSeleccionTarjeta) {
    card.classList.toggle("seleccionada");
  }
  });

  // Eventos de los botones para modificar el contador
  btnMas.addEventListener("click", () => {
    contador = limitarContador(contador + 1);
    actualizarContador();
  });
  btnMenos.addEventListener("click", () => {
    contador = limitarContador(contador - 1);
    actualizarContador();
  });
  btnMasDecimal.addEventListener("click", () => {
    contador = limitarContador(Math.round((contador + 0.1) * 10) / 10);
    actualizarContador();
  });
  btnMenosDecimal.addEventListener("click", () => {
    contador = limitarContador(Math.round((contador - 0.1) * 10) / 10);
    actualizarContador();
  });

  // Método para reiniciar el contador a 10 si es menor
  card.resetContador = function() {
    if (contador < 10) {
      contador = 10;
      actualizarContador();
    }
  };

  return card;
}

// Evento para agregar un nuevo estudiante al enviar el formulario
addStudentForm.addEventListener("submit", function(e) {
  e.preventDefault(); // Evita recargar la página
  const nombre = studentNameInput.value.trim();
  if (nombre) {
    const card = crearTarjetaEstudiante(nombre); // Crea la tarjeta
    cardsContainer.appendChild(card); // La añade al contenedor
    students.push(card); // La guarda en el array
    studentNameInput.value = ""; // Limpia el input
  }
});

// Modo selección de tarjetas
window.modoSeleccionTarjeta = false;
const btnEliminarTarjeta = document.getElementById("btn-eliminar-tarjeta");
const btnConfirmarEliminar = document.getElementById("btn-confirmar-eliminar");

btnEliminarTarjeta.addEventListener("click", function() {
  window.modoSeleccionTarjeta = true;
  btnConfirmarEliminar.style.display = "inline-block";
  btnEliminarTarjeta.disabled = true;
});

btnConfirmarEliminar.addEventListener("click", function() {
  // Elimina las tarjetas seleccionadas
  const seleccionadas = Array.from(document.querySelectorAll('.student-card.seleccionada'));
  seleccionadas.forEach(card => {
    card.remove();
    students = students.filter(c => c !== card);
  });
  window.modoSeleccionTarjeta = false;
  btnConfirmarEliminar.style.display = "none";
  btnEliminarTarjeta.disabled = false;
});

// Evento para reiniciar todos los contadores
btnReset.addEventListener("click", () => {
  students.forEach(card => card.resetContador());
});
