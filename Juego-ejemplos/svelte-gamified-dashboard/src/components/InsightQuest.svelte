<script>
  import { createEventDispatcher } from 'svelte';
  import { getMobilityByPerfil } from '../lib/data.js';
  const dispatch = createEventDispatcher();
  let answer = '';
  let feedback = '';

  async function check(){
    const series = await getMobilityByPerfil();
    const maxPerfil = Object.entries(series).sort((a,b)=> b[1]-a[1])[0][0];
    if(answer.trim().toLowerCase().includes(maxPerfil)){
      feedback = '✅ ¡Correcto! Has identificado el perfil con mayor movilidad.';
      dispatch('completed');
    } else {
      feedback = '❌ No es exactamente ese. Observa el bar chart y vuelve a intentarlo.';
    }
  }
</script>

<h3 style="margin-top:0;">Reto: ¿Quién sube más el ascensor?</h3>
<p>Escribe qué perfil tiene **mayor movilidad social media** (basado en el gráfico de barras) y valida tu respuesta.</p>
<div class="flex">
  <input placeholder="p.ej. humilde-becado" bind:value={answer} style="flex:1; padding:.6rem 1rem; border-radius:12px; border:1px solid #2a3144; background:#0f1422; color:white;" />
  <button class="btn" on:click={check}>Validar</button>
</div>
<p>{feedback}</p>
