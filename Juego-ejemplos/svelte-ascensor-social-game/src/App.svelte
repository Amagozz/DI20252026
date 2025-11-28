<script>
  import './global.css';
  import { game, scorePct, phase } from './lib/store.js';
  import Intro from './components/Intro.svelte';
  import Phase1 from './components/Phase1.svelte';
  import Phase2 from './components/Phase2.svelte';
  import Phase3 from './components/Phase3.svelte';
  import Phase4 from './components/Phase4.svelte';
  import Endings from './components/Endings.svelte';
</script>

<div class="container">
  <header class="row" style="justify-content: space-between;">
    <h1 style="margin:.5rem 0 0; font-weight:800;">El Ascensor Social — Juego por Fases</h1>
    <div class="row">
      <div class="bar" style="width:220px">
        <div class="bar__fill" style="width: {$scorePct}%"></div>
      </div>
      <strong style="min-width:3ch; text-align:right;">{$scorePct}%</strong>
    </div>
  </header>

  <main style="margin-top:1rem">
    {#if $phase === 0}
      <Intro />
    {:else if $phase === 1}
      <Phase1 />
    {:else if $phase === 2}
      <Phase2 />
    {:else if $phase === 3}
      <Phase3 />
    {:else if $phase === 4}
      <Phase4 />
    {:else}
      <Endings />
    {/if}
  </main>
</div>
