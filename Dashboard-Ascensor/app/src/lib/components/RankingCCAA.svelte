<script>
  import { onMount } from "svelte";
  import { getRankingCCAA } from "../api.js";

  let datos = [];
  let loading = true;
  let error = null;

  async function cargar() {
    loading = true;
    error = null;
    try {
      datos = await getRankingCCAA();
    } catch (e) {
      console.error(e);
      error = e.message || "Error cargando ranking CCAA";
    } finally {
      loading = false;
    }
  }

  onMount(cargar);

  $: maxValor = datos.length ? Math.max(...datos.map((d) => d.centil_hijo)) : 1;
</script>

<section style="margin: 2rem 0;">
  <h2>Ranking de CCAA (padres en centil 20)</h2>

  {#if loading}
    <p>Cargando ranking...</p>
  {:else if error}
    <p style="color:red;">{error}</p>
  {:else if !datos.length}
    <p>No hay datos.</p>
  {:else}
    <div style="max-width: 700px;">
      {#each datos as d}
        <div
          style="display:flex;align-items:center;margin:4px 0;font-size:0.9rem;"
        >
          <span style="width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            {d.ccaa}
          </span>
          <div style="flex:1;background:#eee;height:12px;margin:0 8px;position:relative;">
            <div
              style={`background:black;height:100%;width:${(d.centil_hijo / maxValor) *
                100}%;`}
            ></div>
          </div>
          <span style="width:3rem;text-align:right;">
            {d.centil_hijo.toFixed(1)}
          </span>
        </div>
      {/each}
    </div>
  {/if}
</section>
