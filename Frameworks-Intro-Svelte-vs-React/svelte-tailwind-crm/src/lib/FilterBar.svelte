<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  export let search = '';
  export let statusFilter = 'todos';

  export let aEstados = l;

  

  const onSearchChange = (value) => dispatch('changeSearch', value);
  const onStatusChange = (value) => dispatch('changeStatus', value);
</script>

<div class="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-3 md:items-end">
  <div class="flex-1 space-y-1">
    <label class="block text-sm font-medium text-slate-700">Buscar por nombre o email</label>
    <input class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
           bind:value={search} on:input={(e) => onSearchChange(e.target.value)} placeholder="Ej: Ada, alan@..." />
  </div>
  <div class="w-full md:w-52 space-y-1">
    <h1>Prueba Select</h1>
    

    <label class="block text-sm font-medium text-slate-700">Estado</label>
    <select class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            bind:value={statusFilter} on:change={(e) => onStatusChange(e.target.value)}>
              <option value="todos">Todos</option>
              {#each aEstados as estado}
                <option value="{estado}">Solo {estado}</option>
              {/each}
      
    </select>
  </div>
</div>
