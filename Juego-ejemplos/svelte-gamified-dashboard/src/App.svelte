<script>
  import './global.css';
  import PersonaPicker from './components/PersonaPicker.svelte';
  import ScoreBar from './components/ScoreBar.svelte';
  import MobilityBarChart from './components/MobilityBarChart.svelte';
  import ScatterChart from './components/ScatterChart.svelte';
  import InsightQuest from './components/InsightQuest.svelte';
  import {  perfiles, loadCSV, getData } from './lib/data.js';
  import { onMount } from 'svelte';

  let ready = false;
  let selected = 'humilde';
  let score = 0;
  let goals = [
    { id: 'g1', text: 'Encuentra el perfil con mayor movilidad media', done: false, points: 20 },
    { id: 'g2', text: 'Filtra por “becados” y comenta un insight', done: false, points: 20 },
    { id: 'g3', text: 'Detecta la relación entre estudios y salario', done: false, points: 20 }
  ];

  function complete(id){
    const g = goals.find(x => x.id === id);
    if(g && !g.done){ g.done = true; score += g.points; }
    localStorage.setItem('score', score);
    localStorage.setItem('goals', JSON.stringify(goals));
  }

  onMount(async () => {
    const persistedScore = +localStorage.getItem('score') || 0;
    score = persistedScore;
    const persistedGoals = localStorage.getItem('goals');
    if(persistedGoals) goals = JSON.parse(persistedGoals);
    await loadCSV('/ascensor_social_dataset.csv');
    ready = true;
  });
</script>

<div class="container">
  <header class="flex" style="justify-content: space-between;">
    <h1 style="margin:.5rem 0 0; font-weight:800;">Ascensor Social — Dashboard Gamificado</h1>
    <div class="flex"><span class="tag">Svelte</span><span class="tag">Chart.js</span><span class="tag">Data Story</span></div>
  </header>

  <div class="card" style="margin-top:1rem;">
    <PersonaPicker bind:selected />
    <ScoreBar {score} total={100} />
    <p style="opacity:.8; margin-top:.5rem;">Completa los retos analizando el dataset. Cada logro suma puntos.</p>
  </div>

  {#if ready}
  <section class="grid" style="margin-top:1rem;">
    <div class="card">
      <MobilityBarChart {selected} on:completed={() => complete('g1')} />
    </div>
    <div class="card">
      <ScatterChart {selected} />
    </div>
  </section>

  <section class="card" style="margin-top:1rem;">
    <InsightQuest on:completed={() => complete('g2')} />
  </section>
  {/if}
</div>
