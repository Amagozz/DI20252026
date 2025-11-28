<script>
  import { game, phase } from '../lib/store.js';
  import { get } from 'svelte/store';
  let path = 'FP'; // or Universidad

  function next(){
    game.update(g => ({
      ...g,
      nivelFinal: path,
      score: g.score + (path === 'universidad' ? 25 : 15)
    }));
    phase.set(4);
  }
</script>

<div class="card">
  <h2 style="margin-top:0;">Fase 3 · Decisión: FP o Universidad</h2>
  <p class="muted">El camino que elijas impacta en salarios futuros y tiempo de formación.</p>
  <div class="row">
    <label><input type="radio" name="path" value="FP" bind:group={path}> FP</label>
    <label><input type="radio" name="path" value="universidad" bind:group={path}> Universidad</label>
  </div>
  <div class="row" style="margin-top:1rem">
    <button class="btn" on:click={next}>Ir al mercado laboral</button>
  </div>
</div>
