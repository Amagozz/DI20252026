# 🧑‍🏫 Guion docente — Sesión 2: Dashboard con TypeScript y `fetch`

Duración: **3 horas**  
Nivel: 2º DAM/DAW  
Objetivo: Consolidar el uso de TypeScript mediante la construcción de un **dashboard tipado y modular**, que obtenga datos reales desde una API (Fake Store API).

---

## Objetivos 
- Comprender cómo tipar respuestas de `fetch` con `Promise<T>`.
- Modularizar un proyecto TypeScript (`model`, `api`, `view`).
- Manejar errores y respuestas incompletas con seguridad.
- Visualizar datos de forma básica (DOM o consola).

---



## 🔹 BLOQUE 1

  - nueva meta: usar una API real.
- Introducir la Fake Store API → https://fakestoreapi.com/products

ç
> “Ahora no controlamos los datos: la API puede devolver campos inesperados. TypeScript será nuestro filtro de seguridad.”

**Ejemplo inicial (JS inseguro):**
```js
fetch("https://fakestoreapi.com/products")
  .then(r => r.json())
  .then(data => console.log(data[0].price.toFixed(2))); // 💥 Puede fallar si 'price' no existe
```

**Preguntas:**
- ¿Qué pasaría si la API cambia y envía el precio como string?
- ¿Cómo podríamos detectar eso *antes* de ejecutar?

---

## 🔹 BLOQUE 2 — Tipar respuestas de una API (45 min)

### Conceptos a repasar
- `interface` anidada  
- `Promise<T>` y `async/await`  
- Tipos de error (`unknown`, `Error`)  
- Narrowing de tipos

### Ejemplo de modelo tipado
**Archivo:** `model.ts`
```ts
export interface Producto {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
}
```

**Archivo:** `api.ts`
```ts
import type { Producto } from "./model";

export async function obtenerProductos(): Promise<Producto[]> {
  const respuesta = await fetch("https://fakestoreapi.com/products");
  if (!respuesta.ok) throw new Error("Error de red: " + respuesta.status);
  const datos = await respuesta.json();
  return datos as Producto[]; // tipado estático de la respuesta
}
```

### Demostración
```ts
import { obtenerProductos } from "./api";

obtenerProductos()
  .then((productos) => console.log("Productos:", productos.length))
  .catch((err) => console.error("Error:", err));
```


- El autocompletado reconoce las propiedades (`title`, `price`, etc.).  
- Introduce un error intencional: `producto.precio` (campo inexistente).  
  → El compilador lo marca antes de ejecutar.

---

## 🔹 BLOQUE 3 — Modularización y lógica del dashboard 

### Conceptos a repasar
- Separar responsabilidades (`model`, `api`, `dashboard`)
- Tipos derivados (`type Categoria = string`)
- Funciones puras con tipado explícito
- Uso de `Map` o `reduce` para estadísticas

### Estructura propuesta
```
src/
├── model.ts
├── api.ts
└── dashboard.ts
```

**Archivo:** `dashboard.ts`
```ts
import { Producto } from "./model";
import { obtenerProductos } from "./api";

async function iniciarDashboard() {
  try {
    const productos = await obtenerProductos();
    const total = productos.reduce((acc, p) => acc + p.price, 0);
    const media = total / productos.length;
    const porCategoria = agruparPorCategoria(productos);

    renderizarDashboard(productos, total, media, porCategoria);
  } catch (err: unknown) {
    const mensaje = err instanceof Error ? err.message : "Error desconocido";
    console.error(mensaje);
  }
}

function agruparPorCategoria(productos: Producto[]): Record<string, number> {
  const resumen: Record<string, number> = {};
  for (const p of productos) {
    resumen[p.category] = (resumen[p.category] ?? 0) + 1;
  }
  return resumen;
}

function renderizarDashboard(
  productos: Producto[],
  total: number,
  media: number,
  resumen: Record<string, number>
) {
  console.clear();
  console.log("📊 DASHBOARD DE PRODUCTOS");
  console.log("Total productos:", productos.length);
  console.log("Precio total:", total.toFixed(2));
  console.log("Precio medio:", media.toFixed(2));
  console.log("Por categoría:", resumen);
}

iniciarDashboard();
```


---

## 🔹 BLOQUE 4 — Representación visual 

### Conceptos a repasar
- Manipulación del DOM en TS (tipado de elementos)
- `!` (non-null assertion)
- Template literals con datos tipados

**Archivo:** `index.html`
```html
<body>
  <h1>Dashboard de Productos</h1>
  <div id="stats"></div>
  <div id="lista"></div>
  <script type="module" src="./dist/dashboard.js"></script>
</body>
```

**Extensión de `renderizarDashboard`:**
```ts
function renderizarDashboard(
  productos: Producto[],
  total: number,
  media: number,
  resumen: Record<string, number>
) {
  const stats = document.getElementById("stats")!;
  const lista = document.getElementById("lista")!;

  stats.innerHTML = `
    <p>Total productos: ${productos.length}</p>
    <p>Precio total: ${total.toFixed(2)} €</p>
    <p>Precio medio: ${media.toFixed(2)} €</p>
  `;

  lista.innerHTML = productos
    .map(p => `
      <div style="border:1px solid #ccc; margin:4px; padding:8px;">
        <img src="${p.image}" width="50" />
        <strong>${p.title}</strong> — ${p.price} €
      </div>
    `)
    .join("");
}
```

### Ejercicio 
- Añadir un filtro por categoría (menú `<select>`).  
- Mostrar solo los productos de la categoría seleccionada.  
- (Extra) Calcular el total y media solo de esa categoría.

**Errores típicos a provocar:**
- Escribir `p.precio` en vez de `p.price`.  
- Intentar acceder a `document.getElementById("stats").innerHTML` sin el `!` → TypeScript avisa que puede ser `null`.

---

## 🔹 BLOQUE 5 — Cierre y transición (15 min)

**Preguntas para debate:**
- ¿Qué ha hecho TypeScript por nosotros hoy?  
- ¿Qué ventajas tiene modularizar con tipos explícitos?  
- ¿Qué pasará cuando pasemos a Svelte? (spoiler: los componentes ya aplican este tipado automáticamente).

El tipado **no ralentiza**, sino que **protege la lógica del proyecto**.  

A partir de aquí,  con Svelte, el dashboard se convertirá en una aplicación reactiva con estado persistente.

---

## 🧰 Herramientas y recursos
- [Fake Store API](https://fakestoreapi.com/products)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [MDN Fetch API](https://developer.mozilla.org/es/docs/Web/API/Fetch_API)
- Extensión “Live Server” o `http-server` para servir la carpeta local.

---


