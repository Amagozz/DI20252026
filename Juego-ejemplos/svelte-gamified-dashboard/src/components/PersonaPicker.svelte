<script>
  export let selected = 'humilde';
  const options = ['humilde','humilde-becado','rico-vago','rico-aplicado'];
</script>

<div class="flex" style="flex-wrap:wrap; gap:.5rem;">
  {#each options as o}
    <button class="btn" on:click={() => selected = o} aria-pressed={selected===o}>
      {o}
    </button>
  {/each}
</div>
