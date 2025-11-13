<script>
  import Counter from './lib/Counter.svelte';

  let values = { a: 0, b: 0, c: 0 };
  $: total = values.a + values.b + values.c;

  const updateValue = (key) => (e) => {
    values = { ...values, [key]: e.detail };
  };
</script>

<div class="min-h-screen bg-slate-100 text-slate-900">
  <header class="max-w-5xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold">Svelte + Tailwind · Contadores</h1>
    <p class="text-slate-600">Props, eventos y reactividad ($:), en un layout responsive.</p>
  </header>

  <main class="max-w-5xl mx-auto px-4 space-y-6">
    <div class="bg-white rounded-xl shadow p-4 flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold">Total</h2>
        <p class="text-slate-600 text-sm">Suma de los 3 contadores (valor calculado en el padre)</p>
      </div>
      <span class="text-3xl font-extrabold tabular-nums">{total}</span>
    </div>

    <section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <Counter title="Clicks" start={0}  step={1}  color="sky"     on:change={updateValue('a')} />
      <Counter title="Puntos" start={10} step={5}  color="emerald" on:change={updateValue('b')} />
      <Counter title="Vidas"  start={3}  step={-1} color="fuchsia" on:change={updateValue('c')} />
    </section>
  </main>
</div>
