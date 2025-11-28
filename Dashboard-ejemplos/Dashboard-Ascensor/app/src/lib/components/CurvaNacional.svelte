<script>
  import { onMount } from "svelte";
  import { getCurvaNacional } from "../api.js";

  let datos = [];
  let loading = true;
  let error = null;

  // Filtros
  let sexo = "total";           // 'Hombres' | 'Mujeres' | 'total'
  let tipoRenta = "individual"; // 'Individual' | 'Hogar'

  async function cargar() {
    loading = true;
    error = null;
    try {
      datos = await getCurvaNacional(sexo, tipoRenta);
    } catch (e) {
      console.error(e);
      error = e.message || "Error cargando curva nacional";
    } finally {
      loading = false;
    }
  }

  onMount(cargar);

  // Dominio lógico (centiles 0–100)
  const MAX_X = 100;
  const MAX_Y = 100;

  // Margen dentro del SVG (en unidades del viewBox)
  const MARGIN_LEFT = 10;
  const MARGIN_BOTTOM = 10;
  const MARGIN_TOP = 5;
  const MARGIN_RIGHT = 5;

  const INNER_WIDTH = 100 - MARGIN_LEFT - MARGIN_RIGHT;
  const INNER_HEIGHT = 100 - MARGIN_TOP - MARGIN_BOTTOM;

  // Funciones de ayuda para transformar centiles a coordenadas del SVG
  function xCoord(centilPadres) {
    const t = centilPadres / MAX_X; // 0..1
    return MARGIN_LEFT + t * INNER_WIDTH;
  }

  function yCoord(centilHijo) {
    const t = centilHijo / MAX_Y; // 0..1
    // invertimos porque en SVG el 0 está arriba
    return MARGIN_TOP + (1 - t) * INNER_HEIGHT;
  }

  // Polyline
$: puntosSVG =
  curvaSuavizada.length > 1
    ? curvaSuavizada
        .map((d) => `${xCoord(d.centil_padres)},${yCoord(d.centil_hijo)}`)
        .join(" ")
    : "";


      // Agrupamos por centil_padres y calculamos la media de centil_hijo
$: curvaSuavizada = (() => {
  if (!datos.length) return [];

  const grupos = {};

  datos.forEach(d => {
    if (!grupos[d.centil_padres]) {
      grupos[d.centil_padres] = [];
    }
    grupos[d.centil_padres].push(d.centil_hijo);
  });

  const resultado = [];

  for (const centil in grupos) {
    const arr = grupos[centil];
    const media = arr.reduce((a, b) => a + b, 0) / arr.length;
    resultado.push({
      centil_padres: Number(centil),
      centil_hijo: media
    });
  }

  return resultado.sort((a, b) => a.centil_padres - b.centil_padres);
})();

  // Debug opcional
  $: console.log("CurvaNacional datos:", datos);
</script>

<section style="margin: 2rem 0;">
  <h2>Curva de movilidad nacional</h2>

  <div style="display:flex; gap:1rem; flex-wrap:wrap; align-items:flex-start;">
    <!-- Panel de filtros -->
    <div>
      <label>
        Sexo:
        <select bind:value={sexo}>
          <option value="total">Total</option>
          <option value="Hombres">Hombres</option>
          <option value="Mujeres">Mujeres</option>
        </select>
      </label>
      <br />

      <label>
        Tipo de renta:
        <select bind:value={tipoRenta}>
          <option value="individual">Individual</option>
          <option value="Hogar">Hogar</option>
        </select>
      </label>
      <br />

      <button on:click={cargar} style="margin-top:0.5rem;">
        Actualizar curva
      </button>

      {#if loading}
        <p>Cargando curva...</p>
      {:else if error}
        <p style="color:red;">{error}</p>
      {/if}
    </div>

    <!-- Gráfico -->
    {#if !loading && !error}
      <svg
        viewBox="0 0 110 110"
        style="width: min(100%, 600px); border: 1px solid #ccc; background: #fafafa;"
      >
        <!-- Ejes (usamos el área 0–100 del viewBox para dibujar) -->
        <!-- Eje X (centil padres) -->
        <line
          x1={MARGIN_LEFT}
          y1={100 - MARGIN_BOTTOM}
          x2={100 - MARGIN_RIGHT}
          y2={100 - MARGIN_BOTTOM}
          stroke="black"
          stroke-width="0.4"
        />

        <!-- Eje Y (centil hijos) -->
        <line
          x1={MARGIN_LEFT}
          y1={MARGIN_TOP}
          x2={MARGIN_LEFT}
          y2={100 - MARGIN_BOTTOM}
          stroke="black"
          stroke-width="0.4"
        />

        <!-- Ticks y etiquetas eje X -->
        {#each [0, 20, 40, 60, 80, 100] as t}
          <line
            x1={xCoord(t)}
            y1={100 - MARGIN_BOTTOM}
            x2={xCoord(t)}
            y2={100 - MARGIN_BOTTOM + 1.5}
            stroke="black"
            stroke-width="0.3"
          />
          <text
            x={xCoord(t)}
            y={100 - MARGIN_BOTTOM + 4}
            font-size="3"
            text-anchor="middle"
          >
            {t}
          </text>
        {/each}

        <!-- Ticks y etiquetas eje Y -->
        {#each [0, 20, 40, 60, 80, 100] as t}
          <line
            x1={MARGIN_LEFT}
            y1={yCoord(t)}
            x2={MARGIN_LEFT - 1.5}
            y2={yCoord(t)}
            stroke="black"
            stroke-width="0.3"
          />
          <text
            x={MARGIN_LEFT - 3}
            y={yCoord(t) + 1}
            font-size="3"
            text-anchor="end"
          >
            {t}
          </text>
        {/each}

        <!-- Etiqueta eje X -->
        <text
          x={(MARGIN_LEFT + (100 - MARGIN_RIGHT)) / 2}
          y="108"
          font-size="4"
          text-anchor="middle"
        >
          Centil padres
        </text>

        <!-- Etiqueta eje Y (rotada) -->
        <text
          x="-55"
          y="4"
          font-size="4"
          text-anchor="middle"
          transform="rotate(-90)"
        >
          Centil hijos
        </text>

        <!-- Diagonal de perfecta igualdad (hijo = padres) como referencia -->
        <line
          x1={xCoord(0)}
          y1={yCoord(0)}
          x2={xCoord(100)}
          y2={yCoord(100)}
          stroke="gray"
          stroke-width="0.4"
          stroke-dasharray="2 2"
        />

        <!-- Curva real -->
        {#if puntosSVG}
          <polyline
            fill="none"
            stroke="black"
            stroke-width="0.8"
            points={puntosSVG}
          />
        {/if}
      </svg>
    {/if}
  </div>

  {#if !loading && !error && datos.length}
    <details style="margin-top:1rem;">
      <summary>Ver datos (primeros 15 puntos)</summary>
      <ul>
        {#each datos.slice(0, 15) as d}
          <li>
            Padres {d.centil_padres} → Hijos {d.centil_hijo}
          </li>
        {/each}
      </ul>
    </details>
  {/if}
</section>
