<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { getMobilityByPerfil } from '../lib/data.js';
  const dispatch = createEventDispatcher();
  export let selected = 'humilde';
  let canvas;

  let chart;
  async function render(){
    const { default: Chart } = await import('chart.js/auto');
    const series = await getMobilityByPerfil();
    const labels = Object.keys(series);
    const values = labels.map(k => Math.round(series[k]));
    const colors = labels.map((_,i)=> `hsl(${(i*70)%360} 80% 55%)`);

    if(chart){ chart.destroy(); }
    chart = new Chart(canvas, {
      type: 'bar',
      data: { labels, datasets: [{ label: '€ movilidad media', data: values, backgroundColor: colors }]},
      options: {
        onClick: (_, elems) => { if(elems?.length){ dispatch('completed'); } },
        plugins: { legend: { display:false } },
        scales: { y: { title: { display: true, text: '€' } } }
      }
    });
  }

  onMount(render);
</script>

<h3 style="margin-top:0;">Movilidad media por perfil</h3>
<canvas bind:this={canvas} aria-label="Bar chart movilidad por perfil"></canvas>
