<script>
  const TAGS_INICIALES = ["Frontend", "Gamer", "Data", "FP DAM/DAW"];

  // estados reactivos simples
  let likes = 0;
  let darkMode = true;
  let tagActivo = "Frontend";

  $: clasesApp = darkMode ? "app app--dark" : "app app--light";
</script>

<div class={clasesApp}>
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
        Esta tarjeta está hecha con <strong>Svelte</strong>. Las variables del
        <code>&lt;script&gt;</code> son reactivas: cuando cambian, Svelte actualiza solo lo necesario en el DOM.
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
</div>
