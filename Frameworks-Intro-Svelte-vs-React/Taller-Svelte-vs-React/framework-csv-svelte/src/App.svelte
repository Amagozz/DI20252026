<script>
  import "./app.css";

  const TAGS_INICIALES = ["Frontend", "Gamer", "Data", "FP DAM/DAW"];

  // estados de la tarjeta
  let likes = 0;
  let darkMode = true;
  let tagActivo = "Frontend";

  // estados de datos
  let juegos = [];
  let busqueda = "";
  let cargando = false;
  let error = null;

  $: clasesApp = darkMode ? "app app--dark" : "app app--light";

  // parser CSV básico
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
      return obj;
    });
  }

  import { onMount } from "svelte";

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

  // derivado: filtro de juegos
  $: juegosFiltrados = juegos.filter((j) => {
    const q = busqueda.toLowerCase();
    return (
      j.titulo?.toLowerCase().includes(q) ||
      j.genero?.toLowerCase().includes(q)
    );
  });
</script>

<div class={clasesApp}>
  <div class="layout">
    <!-- Tarjeta de perfil -->
    <div class="card">
      <header class="card__header">
        <img
          class="card__avatar"
          src="https://avatars.githubusercontent.com/u/9919?s=200&v=4"
          alt="Avatar"
        />
        <div>
          <h1 class="card__title">Dev Student</h1>
          <p class="card__subtitle">Proyecto: ¿React o Svelte?</p>
        </div>
      </header>

      <section class="card__body">
        <p>
          Esta tarjeta está hecha con <strong>Svelte</strong>. Abajo usamos
          <code>onMount</code> y reactividad para cargar y mostrar un CSV.
        </p>

        <div class="tags">
          {#each TAGS_INICIALES as tag}
            <button
              class={"tag" + (tag === tagActivo ? " tag--active" : "")}
              on:click={() => (tagActivo = tag)}
            >
              {tag}
            </button>
          {/each}
        </div>

        <p class="tag-info">
          Tag seleccionado: <strong>{tagActivo}</strong>
        </p>
      </section>

      <footer class="card__footer">
        <button class="btn" on:click={() => (likes += 1)}>
          ❤️ Likes: {likes}
        </button>

        <button class="btn btn--ghost" on:click={() => (darkMode = !darkMode)}>
          Tema: {darkMode ? "Oscuro" : "Claro"}
        </button>
      </footer>
    </div>

    <!-- Panel de datos CSV -->
    <div class="panel">
      <h2>Juegos desde juegos.csv</h2>

      <div class="panel__controls">
        <input
          type="text"
          placeholder="Buscar por título o género..."
          bind:value={busqueda}
        />
      </div>

      {#if cargando}
        <p>Cargando datos...</p>
      {:else if error}
        <p style="color: salmon">Error: {error}</p>
      {:else}
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
      {/if}
    </div>
  </div>
</div>
