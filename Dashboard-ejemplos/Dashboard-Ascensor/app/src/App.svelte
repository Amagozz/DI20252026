<script>
  import CurvaNacional from "./lib/components/CurvaNacional.svelte";
  import RankingCCAA from "./lib/components/RankingCCAA.svelte";
</script>

<h1>Dashboard — Ascensor social</h1>

<main>
  <div class="graficas">
  <CurvaNacional />
  <RankingCCAA />
  </div>
</main>

<style>
  .graficas{
    display: flex;
    flex-direction: row;
    gap: 24px;
  }
</style>
