<script>
  let apiBase = import.meta.env.VITE_API_BASE || "http://localhost:5174";
</script>

<div class="container">
  <h1>Dashboard Starter</h1>
  <p>Tu API está en: <code>{apiBase}</code></p>
  <p>
    Ahora añade componentes, conecta endpoints y construye tu dashboard poco a poco 🚀
  </p>
</div>

<style>
  .container {
    padding: 2rem;
    font-family: system-ui, sans-serif;
    color: #e6f1ff;
    background: #0b0f14;
    min-height: 100vh;
  }
  code {
    background: rgba(255,255,255,0.15);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
  }
</style>
