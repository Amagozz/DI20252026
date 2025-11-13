<script>
  import { createEventDispatcher, onMount } from 'svelte';
  const dispatch = createEventDispatcher();

  export let title = 'Counter';
  export let start = 0;
  export let step = 1;      // puede ser negativo
  export let color = 'sky'; // 'sky' | 'emerald' | 'fuchsia'

  let count = start;
  $: isEven = count % 2 === 0;

  function inc()   { count = count + Math.abs(step); dispatch('change', count); }
  function dec()   { count = count + (step < 0 ? step : -Math.abs(step)); dispatch('change', count); }
  function reset() { count = start; dispatch('change', count); }

  onMount(() => dispatch('change', count));

  $: btnSolid = `bg-${color}-600 hover:bg-${color}-700 focus:ring-${color}-400`;
  $: badgeBg  = `bg-${color}-100 text-${color}-700`;
</script>

<div class="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
  <div class="flex items-center justify-between">
    <h3 class="font-semibold">{title}</h3>
    <span class={"px-2 py-0.5 rounded-full text-xs font-medium " + badgeBg}>
      {isEven ? 'par' : 'impar'}
    </span>
  </div>

  <div class="text-4xl font-extrabold tabular-nums text-slate-900">{count}</div>

  <div class="flex gap-2">
    <button
      class={"px-3 py-2 text-sm rounded-lg text-white transition focus:outline-none focus:ring-2 " + btnSolid}
      on:click={inc} aria-label="Incrementar">+{Math.abs(step)}</button>

    <button
      class="px-3 py-2 text-sm rounded-lg bg-slate-200 hover:bg-slate-300 transition focus:outline-none focus:ring-2 focus:ring-slate-400"
      on:click={dec} aria-label="Decrementar">-{Math.abs(step)}</button>

    <button
      class="ml-auto px-3 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-slate-400"
      on:click={reset}>Reset</button>
  </div>

  <p class="text-xs text-slate-500">Paso: {step} · Inicio: {start}</p>
</div>
