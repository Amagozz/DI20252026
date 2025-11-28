<script>
    import { createEventDispatcher } from "svelte";
  
    // Props
    export let cells = 3;          // tamaño NxN
    export let secretCode = "4273";
    // Mapa de índices de ficha -> dígito visible cuando el puzzle está resuelto
    export let digits = { 1: "4", 3: "2", 5: "7", 7: "3" };
  
    const N = () => cells * cells;
    const dispatch = createEventDispatcher();
  
    let perm = Array.from({ length: N() }, (_, i) => i);
    let selectedPos = null;
    let moves = 0;
    let codeInput = "";
    let message = "";
    let messageClass = "";
  
    $: solved = perm.every((v, i) => v === i);
  
    function inversions(a) {
      let inv = 0;
      for (let i = 0; i < a.length; i++) {
        for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) inv++;
      }
      return inv;
    }
  
    function shuffle() {
      perm = Array.from({ length: N() }, (_, i) => i);
      for (let i = N() - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [perm[i], perm[j]] = [perm[j], perm[i]];
      }
      if (inversions(perm) % 2 === 1) [perm[0], perm[1]] = [perm[1], perm[0]];
      moves = 0;
      selectedPos = null;
      message = "Barajado. Intercambia dos fichas para ordenarlas.";
      messageClass = "";
      dispatch("reset");
    }
  
    function autoSolve() {
      perm = Array.from({ length: N() }, (_, i) => i);
      moves = 0;
      selectedPos = null;
      message = "Auto-resuelto para demo: mira el código 😉";
      messageClass = "ok";
    }
  
    function select(pos) {
      if (selectedPos === null) {
        selectedPos = pos;
        return;
      }
      if (selectedPos === pos) {
        selectedPos = null;
        return;
      }
      [perm[selectedPos], perm[pos]] = [perm[pos], perm[selectedPos]];
      selectedPos = null;
      moves++;
  
      if (solved) {
        message = "¡Resuelto! Observa el código oculto.";
        messageClass = "ok";
        dispatch("solved", { code: secretCode, moves });
      }
    }
  
    function checkCode() {
      if (!solved) {
        message = "Primero resuelve el rompecabezas.";
        messageClass = "ko";
        return;
      }
      if ((codeInput || "").trim() === secretCode) {
        message = "✅ Código correcto.";
        messageClass = "ok";
        dispatch("success");
      } else {
        message = "❌ Código incorrecto.";
        messageClass = "ko";
        dispatch("fail");
      }
    }
  
    // inicializa al montar
    shuffle();
  </script>
  
  <div class="wrap">
    <div class="board" class:solved={solved} data-cells={cells}>
      {#each Array.from({ length: N() }) as _, pos}
        {#key perm[pos]}
          <button
            type="button"
            class="tile"
            class:selected={selectedPos === pos}
            on:click={() => select(pos)}
            style={`--x:${perm[pos] % cells}; --y:${Math.floor(perm[pos] / cells)};`}
            data-digit={digits[perm[pos]]}
            aria-label={`Ficha ${perm[pos] + 1} en posición ${pos + 1}`}
            aria-description={`Ficha ${perm[pos] + 1} en posición ${pos + 1}`}
          />
        {/key}
      {/each}
    </div>
  
    <div class="hud">
      <button class="btn" on:click={shuffle}>Barajar</button>
      <button class="btn secondary" on:click={autoSolve}>Auto-resolver</button>
      <span>Movimientos: <strong>{moves}</strong></span>
    </div>
  
    <div class="hud">
      <input type="text" placeholder="Introduce el código" maxlength="4" bind:value={codeInput} />
      <button class="btn" on:click={checkCode}>Comprobar</button>
    </div>
  
    <div class="msg {messageClass}">{message}</div>
  </div>
  
  <style>
    :global(:root){
      --size: 420px;
      --gap: 6px;
    }
  
    .wrap{
      display: grid;
      gap: 16px;
      place-items: center;
      text-align: center;
      font-family: system-ui, sans-serif;
    }
  
    .board{
      --cells: 3;
      width: var(--size);
      height: var(--size);
      display: grid;
      grid-template-columns: repeat(var(--cells), 1fr);
      grid-template-rows: repeat(var(--cells), 1fr);
      gap: var(--gap);
      border-radius: 16px;
      padding: var(--gap);
      background:
        conic-gradient(from 45deg,
          #6b8cff 0 25%, #b3c2ff 0 50%, #6b8cff 0 75%, #b3c2ff 0 100%);
      box-shadow: 0 10px 30px rgba(30,50,100,.1);
    }
    .board.solved{ outline: 3px solid #1e2cff33; }
  
    .tile{
      border: none;
      border-radius: 10px;
      cursor: pointer;
      position: relative;
      background:
        repeating-conic-gradient(from 0deg at 50% 50%,
          rgba(255,255,255,.12) 0 10deg, rgba(255,255,255,0) 10deg 20deg),
        conic-gradient(from 45deg,
          #6b8cff 0 25%, #b3c2ff 0 50%, #6b8cff 0 75%, #b3c2ff 0 100%);
      background-size: calc(var(--size) - 2*var(--gap)) calc(var(--size) - 2*var(--gap));
      background-position:
        calc(var(--x) * (100% / (var(--cells) - 1)))
        calc(var(--y) * (100% / (var(--cells) - 1)));
      transition: transform .12s ease, outline-color .12s ease;
      outline: 2px solid transparent;
    }
    .tile:active{ transform: scale(.98); }
    .tile.selected{ outline-color: #1e2cff; }
  
    .tile::after{
      content: attr(data-digit);
      position: absolute;
      inset: auto 8px 8px auto;
      font-weight: 800;
      font-size: 1.1rem;
      color: #0b0e2a;
      background: rgba(255,255,255,.75);
      border-radius: 8px;
      padding: 4px 8px;
      opacity: 0;
      transform: translateY(4px);
      transition: opacity .25s ease, transform .25s ease;
    }
    .board.solved .tile[data-digit]::after{
      opacity: 1;
      transform: translateY(0);
    }
  
    .hud{
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
    }
  
    .btn{
      background: #1e2cff;
      color: white;
      border: none;
      padding: 10px 14px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn.secondary{
      background: #e7ebff;
      color: #1e2cff;
    }
  
    input[type="text"]{
      padding: 8px 10px;
      border-radius: 10px;
      border: 2px solid #cdd6ff;
      width: 140px;
      font-size: 16px;
    }
  
    .msg{ font-weight: 600; min-height: 1.2em; }
    .ok{ color: #0a8a3a; }
    .ko{ color: #9b1c1c; }
  </style>
  