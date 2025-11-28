<script>
  import { levelIndex, score, lives, scorePct, maxLevels } from '../lib/state.js';
  $: lvl = $levelIndex + 1;
</script>

<div style="display:flex; gap:1rem; align-items:center;">
  <div>Nivel: <strong>{lvl}/{maxLevels}</strong></div>
  <div>Puntos: <strong>{$score}</strong></div>
  <div>Vidas: <strong>{$lives}</strong></div>
  <div style="width:160px; height:12px; background:#1a2133; border-radius:999px; overflow:hidden">
    <div style="height:100%; width: {$scorePct}%; background: var(--accent)"></div>
  </div>
</div>
