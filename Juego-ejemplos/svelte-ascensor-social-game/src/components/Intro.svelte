<script>
  import { game, phase } from '../lib/store.js';
  import { ensureData } from '../lib/store.js';
  let ready = false;
  let perfil = 'humilde';
  let becado = false;

  ensureData().then(()=> ready = true);

  function start(){
    game.update(g => ({ ...g, perfil, becado }));
    phase.set(1);
  }
</script>

<div class="card">
  <h2 style="margin-top:0;">Elige tu punto de partida</h2>
  <div class="row">
    <label><input type="radio" name="perfil" value="humilde" bind:group={perfil}> humilde</label>
    <label><input type="radio" name="perfil" value="humilde-becado" bind:group={perfil}> humilde-becado</label>
    <label><input type="radio" name="perfil" value="rico-vago" bind:group={perfil}> rico-vago</label>
    <label><input type="radio" name="perfil" value="rico-aplicado" bind:group={perfil}> rico-aplicado</label>
  </div>
  <div class="row" style="margin-top:.5rem">
    <label><input type="checkbox" bind:checked={becado}> Recibo beca</label>
  </div>
  <div class="row" style="margin-top:1rem">
  <button class="btn" on:click={start} disabled={!ready}>Comenzar</button>
  {#if !ready}
    <span class="muted">Cargando datos…</span>
  {/if}
</div>

</div>
