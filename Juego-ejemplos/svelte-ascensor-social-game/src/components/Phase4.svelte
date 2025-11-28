<script>
  import { game, phase } from '../lib/store.js';
  import { sampleByPerfil } from '../lib/data.js';
  import { get } from 'svelte/store';

  let summary = '';
  function rollJob(){
    const g = get(game);
    const row = sampleByPerfil(g.perfil) || {};
    const ingreso = Number(row.IngresoActual || 20000);
    const movil = Number(row.MovilidadSocial || (ingreso - (g.ingresosFamilia || 20000)));
    game.update(g0 => ({ ...g0, ingresoActual: ingreso, movilidad: movil, ingresosFamilia: row.IngresosFamiliares || 20000, contrato: row.Contrato || 'temporal' , score: g0.score + (movil > 0 ? 30 : 10) }));
    summary = `Contrato: ${row.Contrato || 'temporal'} · Ingreso: ${ingreso.toLocaleString('es-ES')} € · Movilidad: ${movil.toLocaleString('es-ES')} €`;
  }
  function finish(){ phase.set(5); }
</script>

<div class="card">
  <h2 style="margin-top:0;">Fase 4 · Mercado laboral</h2>
  <p>Genera tu primera oferta laboral basada en tu perfil y observa la movilidad social resultante.</p>
  <div class="row" style="margin-top:.5rem">
    <button class="btn" on:click={rollJob}>Generar oferta</button>
    <span>{summary}</span>
  </div>
  <div class="row" style="margin-top:1rem">
    <button class="btn" on:click={finish}>Ver resultado</button>
  </div>
</div>
