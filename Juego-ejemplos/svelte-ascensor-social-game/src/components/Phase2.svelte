<script>
  import { game, phase } from '../lib/store.js';
  import { get } from 'svelte/store';
  let answer = '';
  let feedback = '';

  function check(){
    const g = get(game);
    const ok = (g.becado || g.rentaBarrio > 18000);
    if(answer.trim().length < 10){ feedback = 'Escribe una breve justificación (≥10 caracteres).'; return; }
    game.update(g0 => ({ ...g0, score: g0.score + (ok ? 20 : 10) }));
    feedback = ok ? '✅ Buen razonamiento: tus condiciones favorecen continuidad.' : '⚠️ Es posible, pero hay más riesgo.';
  }
  function next(){ phase.set(3); }
</script>

<div class="card">
  <h2 style="margin-top:0;">Fase 2 · Secundaria</h2>
  <p>¿Qué factores crees que te ayudarán a **no abandonar**? Justifica brevemente.</p>
  <textarea bind:value={answer} rows="4" style="width:100%; border-radius:12px; padding:.7rem; background:#0f1422; color:white; border:1px solid #2a3144;"></textarea>
  <div class="row" style="margin-top:.5rem">
    <button class="btn" on:click={check}>Validar</button>
    <span>{feedback}</span>
  </div>
  <div class="row" style="margin-top:1rem">
    <button class="btn" on:click={next}>Siguiente fase</button>
  </div>
</div>
