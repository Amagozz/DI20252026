Aquí tienes un **README.md** listo para el repo de la práctica. Explica qué problema aborda cada parte del código y cómo se resuelve.

---

# Práctica: Contadores de Clase (JS + CSS)

Repaso de **DOM**, **eventos**, **estilos**, **acceso a datos** y primeras nociones de **estado**, **reactividad** y **concurrencia**.

## Estructura

```
/ (raíz)
├─ index.html
├─ styles.css
├─ script.js
└─ nombres.txt   (ejemplo de datos)
```

---

## Objetivos de aprendizaje

1. **DOM y eventos**: seleccionar nodos, crear elementos, manejar clics.
2. **Estilos y UX**: layout responsive, feedback visual, accesibilidad mínima.
3. **Acceso a datos**: leer nombres desde archivo (`fetch`) o entrada local (`<input type="file">`).
4. **Estado y reactividad**: una fuente de verdad (Map) → render del DOM.
5. **Concurrencia (semilla)**: qué pasaría si varios usuarios modifican el mismo estado.
6. **Escalabilidad**: delegación de eventos, separación de responsabilidades.

---

## Puesta en marcha

* Recomendado servir en local:

  * Python: `python -m http.server 5500` → `http://localhost:5500`
  * VS Code: extensión **Live Server**
* Alternativa: botón **“Cargar archivo local”** para abrir `nombres.txt`/`.json`.

---

## ¿Qué problema resuelve cada parte?

### 1) `index.html`

* **Problema**: Estructurar la interfaz y habilitar puntos de entrada para JS y CSS.
* **Cómo se resuelve**:

  * Contiene la **topbar** con botones de acción y el `<input type="file">` (carga manual de datos).
  * Define un `<template id="tpl-persona">` para **instanciar tarjetas** de alumnos sin duplicar HTML.
  * Incluye `script.js` como **módulo** para organizar mejor el código.

**Piezas clave:**

```html
<button id="btn-cargar-nombres">Cargar nombres (nombres.txt)</button>
<input type="file" id="input-archivo" accept=".txt,.json" />
<template id="tpl-persona"> … </template>
<section id="lista" class="grid"></section>
```

* Facilita **acceso a datos** (botón y file input), **renderizado dinámico** (template) y **organización** (contenedor `#lista`).

---

### 2) `styles.css`

* **Problema**: Hacer la interfaz **clara, usable y consistente**.
* **Cómo se resuelve**:

  * Paleta y variables CSS (`:root`) para consistencia.
  * **Grid responsive** para la lista de personas.
  * **Feedback visual** en botones y contador (clase `.bump`) → **respuesta del UI**.

**Piezas clave:**

```css
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:1rem; }
.contador { transition: transform .15s ease, color .15s ease; }
.contador.bump { transform: scale(1.08); color: var(--accent); }
```

* La animación del contador comunica **cambio de estado** (reactividad percibida).

---

### 3) `script.js` — Estado y Reactividad

* **Problema**: ¿Dónde vive el valor de cada contador? ¿Cómo sincronizar UI y datos?
* **Cómo se resuelve**:

  * `const estado = new Map();` es la **fuente de la verdad** (clave = nombre, valor = contador).
  * `renderLista()` reconstruye la UI **a partir del estado**.
  * `renderPersona(nombre, valor)` crea cada tarjeta usando el `<template>`.
  * `bump(el)` añade feedback visual al **cambiar** un valor.

**Piezas clave:**

```js
const estado = new Map(); // estado centralizado

function renderPersona(nombre, valor = 10) { /* instancia tarjeta desde <template> */ }

function renderLista() {
  lista.innerHTML = "";
  // Ordenación por nombre “normalizado” (sin tildes)
  const nombres = Array.from(estado.keys()).sort((a,b) =>
    normalizaNombre(a).localeCompare(normalizaNombre(b))
  );
  for (const n of nombres) lista.appendChild(renderPersona(n, estado.get(n) ?? 10));
}
```

* Patrón **estado → DOM** que luego encaja con frameworks reactivos (Svelte/React).

---

### 4) `script.js` — Delegación de eventos

* **Problema**: Muchos botones (+/–) implican muchos listeners y problemas de rendimiento/gestión.
* **Cómo se resuelve**:

  * Un **único** listener en `#lista` captura clics y decide qué hacer: **delegación**.

**Pieza clave:**

```js
lista.addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const card = btn.closest(".persona");
  const nombre = card.dataset.nombre;
  let valor = Number(card.querySelector(".contador").dataset.valor || "10");

  if (btn.classList.contains("btn-mas")) valor += 1;
  if (btn.classList.contains("btn-menos")) valor -= 1;

  estado.set(nombre, valor);
  // Reactualiza la UI del nodo afectado (reactividad local)
});
```

* Permite **escalabilidad** y simplifica el código.

---

### 5) `script.js` — Acceso a datos (archivos)

* **Problema**: Cargar los nombres desde un archivo externo, y manejar restricciones de navegador (CORS al abrir `file://`).
* **Cómo se resuelve**:

  * `cargarNombresDesdeTxt("nombres.txt")` usa `fetch` (requiere servidor local).
  * `cargarDesdeArchivoLocal(file)` usa `FileReader` implícito mediante `file.text()` para evitar CORS.
  * Soporta **.txt** (una línea por nombre) y **.json** (array de strings).
  * Manejo de errores y mensajes en `#estado`.

**Piezas clave:**

```js
async function cargarNombresDesdeTxt(url="nombres.txt") { /* fetch + parse + estado + render */ }
async function cargarDesdeArchivoLocal(file) { /* lectura local + parse + estado + render */ }

btnCargar.addEventListener("click", () => cargarNombresDesdeTxt().catch(/* fallback */));
inputArchivo.addEventListener("change", (e) => cargarDesdeArchivoLocal(e.target.files[0]));
```

* Presenta **dos vías** para datos: servidor o archivo local, con **mensajes de estado**.

---

### 6) `script.js` — UX y Accesibilidad mínima

* **Problema**: El usuario necesita feedback y lectores de pantalla deben enterarse de cambios.
* **Cómo se resuelve**:

  * `setEstado(msg)` escribe en `#estado` con `aria-live="polite"`.
  * Botones con `aria-label`.
  * Animación `.bump` como feedback visual no intrusivo.

**Piezas clave:**

```html
<section id="estado" aria-live="polite"></section>
<button class="btn redondeado btn-menos" aria-label="Restar uno">−1</button>
```

---

### 7) `script.js` — Reinicio masivo

* **Problema**: Necesitamos un control global de estado (reset para toda la clase).
* **Cómo se resuelve**:

  * `btnReset` recorre `estado` y reinicia todos a 10, seguido de `renderLista()`.

**Pieza clave:**

```js
btnReset.addEventListener("click", () => {
  for (const n of estado.keys()) estado.set(n, 10);
  renderLista();
  setEstado("Todos los contadores han sido reiniciados a 10.");
});
```

---

### 8) Concurrencia: qué está “simulado” aquí

* **Problema real**: Si varios usuarios modifican el mismo estado **a la vez** (equipos distintos), pueden ocurrir **condiciones de carrera**, **pérdida de actualizaciones** y **divergencia** del estado en cada cliente.
* **Cómo se aborda en esta práctica**:

  * Se usa un **estado local** por navegador. Esto **simula** el problema pero no lo resuelve entre clientes.
  * Sirve para introducir conceptos:

    * **Fuente de la verdad** (server).
    * **Sincronización** (WebSocket, SSE).
    * **Conflictos** (bloqueo optimista/pesimista, *merge* de eventos).
  * Próximo paso: un **servidor** que mantenga el contador global y **difunda cambios** a todos los clientes.

---

## Flujo de trabajo recomendado (en clase)

1. **Fase 1**: contador único en la página (DOM + eventos + estilos).
2. **Fase 2**: múltiples contadores desde archivo (acceso a datos + render dinámico + delegación).
3. **Refactor**: aislar **estado** y **render**; añadir feedback y accesibilidad.
4. **Discusión**: ¿cómo se rompe esto en multiusuario real?
5. **Fase 3 (próxima práctica)**: “store” global y, después, versión **tiempo real** con WebSocket.

---

## Comprobaciones técnicas

* **CORS**: si abres con `file://`, `fetch` fallará. Usa servidor local o el botón “Cargar archivo local”.
* **Encoding**: guarda `nombres.txt` como **UTF-8** (evita problemas con tildes).
* **Rutas**: si mueves el archivo a `data/`, ajusta `fetch("data/nombres.txt")`.
* **Ordenación**: se “normaliza” el nombre para ordenar sin afectar caracteres con tilde.

---

## Extensiones sugeridas

* **Límites** por contador (ej. 0–20).
* **Ranking** de interacciones (quién pulsa más).
* **Persistencia** en `localStorage`.
* **Tema oscuro** (toggle).
* **Pruebas**: testear `normalizaNombre`, suma/resta y reset.

---

## Archivos de ejemplo

### `nombres.txt`

```
Ana
Pedro
Lucía
María
Juan
Fátima
Héctor
```

### `nombres.json`

```json
["Ana","Pedro","Lucía","María","Juan","Fátima","Héctor"]
```

---

## Rubrica rápida de evaluación (opcional)

* **Funcional (40%)**: carga de datos, sumar/restar, reset.
* **Código (30%)**: uso de delegación, separación estado/render, manejo de errores.
* **UX (20%)**: feedback visual, accesibilidad básica, diseño responsive.
* **Discusión (10%)**: explicación de riesgos de concurrencia y propuesta de solución.

---

## Próximo paso

Implementar un **servidor mínimo** (Node/Express) que mantenga el estado global y una capa de **WebSocket** para sincronizar los contadores en tiempo real entre equipos.
