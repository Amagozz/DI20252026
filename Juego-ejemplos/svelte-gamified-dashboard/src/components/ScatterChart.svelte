<script>
  import { onMount } from 'svelte';
  import { getScatterByPerfil } from '../lib/data.js';
  export let selected = 'humilde';
  let canvas, chart;

  async function render(){
    const { default: Chart } = await import('chart.js/auto');
    const datasets = await getScatterByPerfil(selected);
    if(chart) chart.destroy();
    chart = new Chart(canvas, {
      type: 'scatter',
      data: { datasets: datasets },
      options: {
        scales: {
          x: { title: { display: true, text: 'Ingresos familiares (€)' } },
          y: { title: { display: true, text: 'Ingreso actual (€)' } }
        }
      }
    });
  }

  $: selected, render();
  onMount(render);
</script>

<h3 style="margin-top:0;">Dispersión Ingresos familiares vs Ingreso actual</h3>
<canvas bind:this={canvas}></canvas>
