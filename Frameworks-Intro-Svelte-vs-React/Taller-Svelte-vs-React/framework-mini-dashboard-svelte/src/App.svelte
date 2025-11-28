<script>
  import "./app.css";
  import { onMount } from "svelte";

  const TAGS_INICIALES = ["Frontend", "Gamer", "Data", "FP DAM/DAW"];

  // tarjeta
  let likes = 0;
  let darkMode = true;
  let tagActivo = "Frontend";

  // datos
  let juegos = [];
  let busqueda = "";
  let plataformaFiltro = "Todas";
  let cargando = false;
  let error = null;

  $: clasesApp = darkMode ? "app app--dark" : "app app--light";

  function parseCSV(texto) {
    const lineas = texto.trim().split("\n");
    const [cabecera, ...filas] = lineas;
    const columnas = cabecera.split(",").map((c) => c.trim());

    return filas.map((linea) => {
      const valores = linea.split(",");
      const obj = {};
      columnas.forEach((col, i) => {
        obj[col] = valores[i] ? valores[i].trim() : "";
      });
      if (obj.horas) obj.horas = Number(obj.horas);
      return obj;
    });
  }

  onMount(async () => {
    try {
      cargando = true;
      error = null;
      const res = await fetch("/juegos.csv");
      if (!res.ok) throw new Error("No se pudo cargar juegos.csv");
      const texto = await res.text();
      juegos = parseCSV(texto);
    } catch (e) {
      console.error(e);
      error = e.message;
    } finally {
      cargando = false;
    }
  });

  // plataformas disponibles
  $: plataformas = ["Todas", ...new Set(juegos.map((j) => j.plataforma))];

  // filtrado
  $: juegosFiltrados = juegos.filter((j) => {
    const q = busqueda.toLowerCase();
    const coincideTexto =
      j.titulo.toLowerCase().includes(q) ||
      j.genero.toLowerCase().includes(q);
    const coincidePlataforma =
      plataformaFiltro === "Todas" || j.plataforma === plataformaFiltro;
    return coincideTexto && coincidePlataforma;
  });

  // agregación para gráfico
  $: horasPorGenero = (() => {
    const mapa = new Map();
    for (const j of juegosFiltrados) {
      const genero = j.genero || "Sin género";
      const horas = Number(j.horas) || 0;
      mapa.set(genero, (mapa.get(genero) || 0) + horas);
    }
    return Array.from(mapa.entries())
      .map(([genero, horas]) => ({ genero, horas }))
      .sort((a, b) => b.horas - a.horas);
  })();

  $: maxHoras = horasPorGenero[0]?.horas || 1;
</script>

<div class={clasesApp}>
  <div class="layout layout--dashboard">
   

    <!-- Panel dashboard -->
    <div class="panel panel--dashboard">
      <div class="panel__header">
        <h2>Juegos desde juegos.csv</h2>
        <span class="pill">
          {juegosFiltrados.length} / {juegos.length} juegos
        </span>
      </div>

      <div class="panel__controls panel__controls--grid">
        <input
          type="text"
          placeholder="Buscar por título o género..."
          bind:value={busqueda}
        />

        <select bind:value={plataformaFiltro}>
          {#each plataformas as p}
            <option value={p}>{p}</option>
          {/each}
        </select>
      </div>

      {#if cargando}
        <p>Cargando datos...</p>
      {:else if error}
        <p style="color: salmon">Error: {error}</p>
      {:else}
        <div class="dashboard-grid">
          <!-- Gráfico de barras -->
          <div class="chart">
            <h3>Horas jugadas por género</h3>
            {#if horasPorGenero.length === 0}
              <p>No hay datos para los filtros actuales.</p>
            {:else}
              <div class="chart__body">
                {#each horasPorGenero as item}
                  <div class="chart__row">
                    <span class="chart__label">{item.genero}</span>
                    <div class="chart__bar-container">
                      <!-- svelte-ignore element_invalid_self_closing_tag -->
                      <div class="chart__bar"
                        style={`width: ${(item.horas / maxHoras) * 100}%`}
                      />
                    </div>
                    <span class="chart__value">{item.horas} h</span>
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Tabla -->
          <div class="panel__table-wrapper">
            <h3>Listado de juegos</h3>
            <table class="tabla">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Género</th>
                  <th>Plataforma</th>
                  <th>Horas</th>
                </tr>
              </thead>
              <tbody>
                {#each juegosFiltrados as juego (juego.id)}
                  <tr>
                    <td>{juego.titulo}</td>
                    <td>{juego.genero}</td>
                    <td>{juego.plataforma}</td>
                    <td>{juego.horas}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
