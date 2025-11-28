<script>
  import { game } from '../lib/store.js';
  import { get } from 'svelte/store';
  $: g = get(game);
  $: ending = g.movilidad > 0 ? 'Ascenso social' : (g.movilidad === 0 ? 'Estancamiento' : 'Descenso');
</script>

<div class="card">
  <h2 style="margin-top:0;">Resultado</h2>
  <p><strong>{ending}</strong></p>
  <p class="muted">Perfil: {g.perfil} · Beca: {g.becado ? 'sí' : 'no'} · Barrio: {g.barrio || '—'}</p>
  <p class="muted">Contrato: {g.contrato || '—'} · Ingreso actual: {g.ingresoActual?.toLocaleString('es-ES') || '—'} €</p>
  <p>Puntuación final: <strong>{g.score}</strong> / 100</p>
  <p style="opacity:.8">Tip: exporta esta pantalla como captura para la memoria del proyecto.</p>
</div>
