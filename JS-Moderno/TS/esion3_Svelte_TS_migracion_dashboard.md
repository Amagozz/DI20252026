#  Sesión 3: Migración del dashboard a **Svelte + TypeScript** con `fetch`

Duración: **3 horas**  
Nivel: 2º DAM/DAW  
Objetivo: entender **qué aporta un framework** (Svelte) sobre el proyecto tipado en TypeScript: reactividad, componentes, stores y manejo de estado; conectando datos reales mediante `fetch` (Fake Store API).

> **Stack elegido:** Svelte (con Vite) + TypeScript.  
> **Datos:** https://fakestoreapi.com/products

---

## Objetivos de aprendizaje
- Migrar el modelo de datos TS al contexto de Svelte (`<script lang="ts">`).
- Crear y usar **stores** (`writable`, `derived`) con tipos.
- Consumir una API real en Svelte con estados `loading/error/success`.
- Implementar filtros reactivos y persistencia ligera en `localStorage`.
- Separar responsabilidades en **componentes**.

---

##  Estructura temporal (3 h)

| Bloque | Tiempo | Tema |
|:--|:--:|:--|
| 1 | 0:00 – 0:30 | ¿Por qué framework? Reactividad de Svelte en 10' |
| 2 | 0:30 – 1:15 | Stores tipados + `fetch` real con estados |
| 3 | 1:15 – 2:00 | Componentes: filtros, lista y métricas derivadas |
| 4 | 2:00 – 2:45 | Persistencia en `localStorage` y UX de errores |
| 5 | 2:45 – 3:00 | Cierre y avance (SvelteKit / despliegue) |

---

## 🔹 BLOQUE 1 — Por qué framework y reactividad básica 

 TS evita errores *de tipos*, Svelte evita errores *de DOM/estado manual*. Svelte compila a JS muy eficiente; su reactividad se activa con la sintaxis `$:`.

**Demostración rápida:**
```svelte
<!-- App.svelte -->
<script lang="ts">
  let a = 2, b = 3;
  $: suma = a + b;     // se recalcula cuando cambian a o b
</script>

<input type="number" bind:value={a} />
<input type="number" bind:value={b} />
<p>Resultado: {suma}</p>
```

 Con Svelte no necesitas manipular el DOM; declaras *relaciones* y Svelte mantiene el UI sincronizado.

---

## 🔹 BLOQUE 2 — Stores tipados y `fetch` con estados 

 Los stores centralizan el estado. Aquí, `productos`, `estado` y `error`. Tipamos el modelo con la misma `interface` de la sesión 2.

**Estructura:**
```
src/
├── App.svelte
├── components/
│   ├── Stats.svelte
│   └── ProductList.svelte
└── stores/
    └── products.ts
```

**`stores/products.ts`:**
```ts
import { writable, derived } from 'svelte/store';

export interface Producto {
  id: number;
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

type Estado = 'idle' | 'loading' | 'error' | 'success';

export const productos = writable<Producto[]>([]);
export const estado = writable<Estado>('idle');
export const errorMsg = writable<string | null>(null);

export async function cargarProductos() {
  estado.set('loading');
  errorMsg.set(null);
  try {
    const r = await fetch('https://fakestoreapi.com/products');
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const datos = await r.json() as Producto[];
    productos.set(datos);
    estado.set('success');
  } catch (err) {
    estado.set('error');
    errorMsg.set(err instanceof Error ? err.message : 'Error desconocido');
  }
}

// Métricas derivadas (siempre coherentes con productos)
export const total = derived(productos, ($p) => $p.reduce((acc, it) => acc + it.price, 0));
export const media = derived([total, productos], ([$total, $p]) => $p.length ? $total / $p.length : 0);

// Conjunto de categorías
export const categorias = derived(productos, ($p) => Array.from(new Set($p.map(x => x.category))).sort());
```

**`App.svelte`:**
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { productos, estado, errorMsg, cargarProductos, categorias } from './stores/products';
  import Stats from './components/Stats.svelte';
  import ProductList from './components/ProductList.svelte';

  let filtro: string = localStorage.getItem('categoria') ?? 'Todas';

  onMount(() => { cargarProductos(); });
  $: localStorage.setItem('categoria', filtro);
</script>

<main class="p-6 max-w-4xl mx-auto">
  <h1 class="text-2xl font-bold mb-4">Dashboard de Productos — Svelte + TS</h1>

  {#if $estado === 'loading'}
    <p>Cargando…</p>
  {:else if $estado === 'error'}
    <p style="color:#a00">Error: {$errorMsg}</p>
    <button on:click={cargarProductos}>Reintentar</button>
  {:else}
    <div class="toolbar" style="display:flex; gap:8px; align-items:center; margin-bottom:1rem">
      <label>Categoría:</label>
      <select bind:value={filtro}>
        <option>Todas</option>
        {#each $categorias as c}
          <option>{c}</option>
        {/each}
      </select>
      <button on:click={cargarProductos}>Recargar</button>
    </div>

    <Stats />
    <ProductList {filtro} />
  {/if}
</main>
```

Explica `$store` (auto-suscripción en componentes), y cómo `derived` garantiza que `total` y `media` siempre estén sincronizados.

---

## 🔹 BLOQUE 3 — Componentes: filtros, lista y métricas 

**`components/Stats.svelte`:**
```svelte
<script lang="ts">
  import { productos, total, media } from '../stores/products';
</script>

<section class="card" style="border:1px solid #ddd; border-radius:12px; padding:12px; margin-bottom:12px;">
  <p><strong>Productos:</strong> {$productos.length}</p>
  <p><strong>Total:</strong> {$total.toFixed(2)} €</p>
  <p><strong>Media:</strong> {$media.toFixed(2)} €</p>
</section>
```

**`components/ProductList.svelte`:**
```svelte
<script lang="ts">
  import type { Producto } from '../stores/products';
  import { productos } from '../stores/products';
  export let filtro: string = 'Todas';

  $: filtrados = $productos.filter(p => filtro === 'Todas' ? true : p.category === filtro);
</script>

<ul class="grid" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:12px;">
  {#each filtrados as p (p.id)}
    <li style="border:1px solid #eee; border-radius:12px; padding:12px;">
      <img src={p.image} alt={p.title} width="80" height="80" style="object-fit:contain; display:block; margin-bottom:8px;" />
      <strong>{p.title}</strong>
      <div style="opacity:.7; font-size:.9em; margin:.25rem 0">{p.category}</div>
      <div><strong>{p.price.toFixed(2)} €</strong></div>
    </li>
  {/each}
</ul>
```

Pide que cambien `p.price` por `p.precio` (error intencionado) y que vean cómo el compilador guía la corrección.

---

## 🔹 BLOQUE 4 — Persistencia y UX de errores

**Objetivos:**
- Persistir el filtro en `localStorage` (ya lo hicimos con `$: localStorage.setItem('categoria', filtro);`).
- Mejorar UX en `error`: botón Reintentar, mensaje más claro.
- Añadir un **skeleton loader** simple durante `loading` (opc.).

**Sugerencia de skeleton minimal:**
```svelte
{#if $estado === 'loading'}
  <div class="skeleton" style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px;">
    {#each Array(6) as _}
      <div style="height:120px; background:linear-gradient(90deg,#eee,#f6f6f6,#eee); animation:pulse 1.2s infinite;"></div>
    {/each}
  </div>
{/if}

<style>
  @keyframes pulse {
    0% { filter: brightness(1); }
    50% { filter: brightness(1.05); }
    100% { filter: brightness(1); }
  }
</style>
```

**Errores a provocar:**
- Forzar un fallo de red cambiando la URL → comprobar que la UI muestra el estado `error`.  
- Quitar el `on:click={cargarProductos}` del botón Reintentar para ver que el error persiste → restaurarlo.

---

## 🔹 BLOQUE 5 — Cierre y próximos pasos 

**Debate breve:**
- ¿Qué complejidad nos ahorra Svelte respecto a manipular DOM a mano?
- ¿Cómo nos ayuda TypeScript dentro de Svelte (props tipadas, stores tipados)?
- ¿Qué tal si en la sesión 4 pasamos a **SvelteKit** (rutas + SSR) o añadimos **gráficos** (Recharts/D3)?

**Para ti:** subraya que **Svelte y TypeScript no compiten**: se complementan. TS asegura contratos; Svelte sincroniza estado y UI.

---

## 🛠️ Setup rápido del proyecto (Vite + Svelte + TS)

```bash
# Crear proyecto si no existe
npm create vite@latest svelte-ts-dashboard -- --template svelte-ts
cd svelte-ts-dashboard
npm install

# Arrancar
npm run dev
```

> Si deseas Tailwind (opcional): instala `@tailwindcss/vite` y añade `@import "tailwindcss";` en `src/app.css` o `styles.css`.

---

## 🧰 Recursos
- Svelte Docs: https://svelte.dev/docs
- TypeScript en Svelte: https://svelte.dev/docs/typescript
- Fake Store API: https://fakestoreapi.com/

---

- Si hay problemas de Node, usa **Node ≥ 22.12** para tooling moderno.
