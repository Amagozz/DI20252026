<script>
  import { game, phase } from '../lib/store.js';
  import { barrios } from '../lib/data.js';
  import { get } from 'svelte/store';
  let items = barrios();
  let choice = null;

  function next(){
    if(!choice) return;
    game.update(g => {
      const scoreGain = Math.round((choice.renta / 30000) * 20) - Math.round((choice.ratio - 18));
      return { ...g, barrio: choice.name, rentaBarrio: choice.renta, ratio: choice.ratio, score: Math.max(0, g.score + Math.max(5, scoreGain)) };
    });
    phase.set(2);
  }
</script>

<div class="card">
  <h2 style="margin-top:0;">Fase 1 · Colegio de barrio</h2>
  <p class="muted">Elige tu barrio de crecimiento: renta media y ratio profesor/alumno influyen en tus oportunidades.</p>
  <div class="grid" style="margin-top:.5rem">
    {#each items as b}
      <button class="card btn secondary" on:click={() => choice = b} aria-pressed={choice && choice.name===b.name}>
        <strong>{b.name}</strong><br/>
        Renta media: {b.renta} € · Ratio: {b.ratio}
      </button>
    {/each}
  </div>
  <div class="row" style="margin-top:1rem">
    <button class="btn" on:click={next} disabled={!choice}>Continuar</button>
  </div>
</div>
