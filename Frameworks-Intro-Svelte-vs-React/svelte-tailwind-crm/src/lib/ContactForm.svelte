<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let aEstados;
  let name = '';
  let email = '';
  let phone = '';
  let status = 'activo';

  const handleSubmit = () => {
    if (!name || !email) {
      alert('Nombre y email son obligatorios');
      return;
    }
    dispatch('addContact', { name, email, phone, status });
    name = ''; email = ''; phone = ''; status = 'activo';
  };
</script>

<form class="space-y-4" on:submit|preventDefault={handleSubmit}>
  <div class="space-y-1">
    <label class="block text-sm font-medium text-slate-700">Nombre *</label>
    <input class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
           bind:value={name} placeholder="Ej: Ada Lovelace" />
  </div>

  <div class="space-y-1">
    <label class="block text-sm font-medium text-slate-700">Email *</label>
    <input type="email" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
           bind:value={email} placeholder="ada@ejemplo.com" />
  </div>

  <div class="space-y-1">
    <label class="block text-sm font-medium text-slate-700">Teléfono</label>
    <input class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
           bind:value={phone} placeholder="600123456" />
  </div>

  <div class="space-y-1">
    <label class="block text-sm font-medium text-slate-700">Estado</label>
    <select class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            bind:value={status}>
      {#each aEstados as estado}
        <option value="{estado}">{estado}</option>
      {/each}
    </select>
  </div>

  <button type="submit" class="w-full rounded-lg bg-sky-600 text-white text-sm font-semibold py-2 hover:bg-sky-700 transition">
    Guardar contacto
  </button>
</form>
