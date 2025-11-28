<script lang="ts">
  export interface Producto {
    nombre: string;
    precio: number;
    unidades?: number;
  }

  let productos: Producto[] = [
    { nombre: "Ratón", precio: 20, unidades: 5 },
    { nombre: "Teclado", precio: 40, unidades: 8 },
    { nombre: "Pantalla", precio: 120, unidades: 3 }
  ];

  $: ventas = productos.map(p => p.precio * (p.unidades ?? 0));
  $: total = ventas.reduce((a, b) => a + b, 0);
  $: media = ventas.length ? total / ventas.length : 0;

  function addProducto() {
    productos = [...productos, { nombre: "Nuevo", precio: 10, unidades: 1 }];
    persist();
  }

  function persist() {
    localStorage.setItem("productos", JSON.stringify(productos));
  }

  const guardado = localStorage.getItem("productos");
  if (guardado) {
    try { productos = JSON.parse(guardado); } catch {}
  }
</script>

<main class="p-6 max-w-2xl mx-auto">
  <h1 class="text-2xl font-bold mb-4">Dashboard de Ventas — Svelte + TS</h1>

  <section class="card">
    <p><strong>Total:</strong> {total.toFixed(2)}</p>
    <p><strong>Media:</strong> {media.toFixed(2)}</p>
  </section>

  <section class="card">
    <h2 class="font-semibold mb-2">Productos</h2>
    <ul class="space-y-2">
      {#each productos as p, i}
        <li class="flex gap-2 items-center">
          <input class="border rounded px-2 py-1 w-40" bind:value={p.nombre} on:change={persist} />
          <input class="border rounded px-2 py-1 w-24" type="number" step="0.01" bind:value={p.precio} on:change={persist} />
          <input class="border rounded px-2 py-1 w-24" type="number" bind:value={p.unidades} on:change={persist} />
          <button class="ml-auto px-2 py-1 border rounded" on:click={() => { productos = productos.toSpliced(i,1); persist(); }}>Eliminar</button>
        </li>
      {/each}
    </ul>
    <button class="mt-3 px-3 py-1 border rounded" on:click={addProducto}>Añadir</button>
  </section>
</main>

