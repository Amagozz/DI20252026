<script>
  import { started } from '../lib/state.js';
</script>

<div class="card">
  <h2 style="margin-top:0;">Cómo se juega</h2>
  <p>Supera 4 fases (Colegio → Secundaria → FP/Universidad → Mercado laboral). Cada fase genera <em>obstáculos</em> según datos de contexto (renta de barrio, ratio profesor/alumno, beca, etc.).</p>
  <p>Controles: <kbd>←</kbd><kbd>→</kbd> moverse · <kbd>Espacio</kbd> saltar.</p>
  <button class="btn" on:click={() => started.set(true)}>Empezar</button>
</div>
