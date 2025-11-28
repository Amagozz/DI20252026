<script>
  import './global.css';
  import Intro from './components/Intro.svelte';
  import Game from './components/Game.svelte';
  import HUD from './components/HUD.svelte';
  import { started } from './lib/state.js';
</script>

<div class="container">
  <header style="display:flex; justify-content:space-between; align-items:center;">
    <h1 style="margin:.5rem 0 0; font-weight:800;">Ascensor Social — Platformer por Fases</h1>
    <HUD />
  </header>

  {#if $started}
    <Game />
  {:else}
    <Intro />
  {/if}
</div>
