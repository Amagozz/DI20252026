<script>
  import { onMount } from 'svelte';
  import { Engine } from '../lib/engine.js';
  import { levelIndex, score, lives, started } from '../lib/state.js';
  import { getLevelConfig } from '../lib/levels.js';

  let canvas;
  let engine;

  function startLevel(i){
    const cfg = getLevelConfig(i);
    engine.start(cfg, () => {
      // on level complete
      levelIndex.update(x => x+1);
      if(i+1 >= 4){
        started.set(false); // end game -> back to intro
      } else {
        startLevel(i+1);
      }
    }, () => {
      // on life lost
      lives.update(v => Math.max(0, v-1));
      if($lives <= 0){
        started.set(false);
      } else {
        startLevel(i); // retry
      }
    });
  }

  onMount(() => {
    engine = new Engine(canvas, { onScore: (s)=> score.update(v=>v+s) });
    startLevel($levelIndex);
  });
</script>

<div class="card">
  <canvas bind:this={canvas} width="960" height="420" aria-label="Juego de plataformas"></canvas>
</div>
