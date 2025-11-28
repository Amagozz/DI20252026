<script>
  export let score = 0;
  export let total = 100;
  $: pct = Math.min(100, Math.round((score/total)*100));
</script>

<div class="flex">
  <div class="bar" style="flex:1;">
    <div class="bar__fill" style={`width:${pct}%`}></div>
  </div>
  <strong style="min-width:3ch; text-align:right;">{pct}%</strong>
</div>
