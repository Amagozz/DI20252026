<script>
  import { onMount } from 'svelte';
  import { getSummary, getPoints } from './lib/api';
  import BarChart from './lib/components/BarChart.svelte';
  import ScatterPlot from './lib/components/ScatterPlot.svelte';

  let loading = true;
  let error = '';
  let summary = null;
  let points = [];

  onMount(async ()=>{
    try{
      summary = await getSummary();
      points = await getPoints(800);
    }catch(e){
      error = e.message || 'Error cargando datos';
    }finally{
      loading = false;
    }
  });
</script>

<div class="max-w-6xl mx-auto p-6 space-y-6">
  <header class="flex items-end justify-between">
    <div>
      <h1 class="text-2xl font-bold">Ascensor Social — Dashboard</h1>
      <p class="text-slate-600">Svelte + D3 + Tailwind &middot; API: <code>{typeof __API_URL__ !== 'undefined' ? __API_URL__ : 'http://localhost:3000'}</code></p>
    </div>
  </header>

  {#if loading}
    <div class="animate-pulse text-slate-500">Cargando datos...</div>
  {:else if error}
    <div class="text-red-600">⚠ {error}</div>
  {:else}
    <section class="grid md:grid-cols-3 gap-4">
      <div class="bg-white p-4 rounded-2xl shadow">
        <div class="text-slate-500 text-sm">muestras</div>
        <div class="text-3xl font-semibold">{summary.n}</div>
      </div>
      <div class="bg-white p-4 rounded-2xl shadow">
        <div class="text-slate-500 text-sm">correlación (ingresos padres-hijo)</div>
        <div class="text-3xl font-semibold">{summary.corr}</div>
      </div>
      <div class="bg-white p-4 rounded-2xl shadow">
        <div class="text-slate-500 text-sm">regiones</div>
        <div class="text-3xl font-semibold">{summary.regionMobility.length}</div>
      </div>
    </section>

    <section class="grid md:grid-cols-2 gap-6">
      <div class="bg-white p-4 rounded-2xl shadow">
        <BarChart  title="Índice simple de movilidad por región"
          data={summary.regionMobility.map(d=>({label:d.region, value:d.movilidad}))} />
      </div>

      <div class="bg-white p-4 rounded-2xl shadow">
        <ScatterPlot title="Ingresos: padres vs hijo (con regresión)"
          data={points} />
      </div>
    </section>

    <footer class="text-sm text-slate-500">
      Dataset sintético para docencia; sustituye la API por tus datos reales cuando quieras.
    </footer>
  {/if}
</div>
