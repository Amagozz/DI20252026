<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  export let filteredContacts = [];

  const statusClasses = (status) => {
    if (status === 'activo') return 'bg-green-100 text-green-700';
    if (status === 'potencial') return 'bg-amber-100 text-amber-700';
    return 'bg-slate-200 text-slate-700';
  };

  const remove = (id) => dispatch('removeContact', id);
</script>

{#if filteredContacts.length === 0}
  <p class="text-sm text-slate-500">No hay contactos que coincidan con el filtro.</p>
{:else}
  <ul class="space-y-2 max-h-[420px] overflow-auto pr-1">
    {#each filteredContacts as contact}
      <li class="border border-slate-200 rounded-lg p-3 flex items-start justify-between gap-3">
        <div>
          <p class="font-semibold text-slate-900">{contact.name}</p>
          <p class="text-xs text-slate-600">{contact.email}</p>
          {#if contact.phone}
            <p class="text-xs text-slate-500 mt-1">📞 {contact.phone}</p>
          {/if}
          <span class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${statusClasses(contact.status)}`}>
            {contact.status}
          </span>
        </div>
        <button class="text-xs text-red-600 hover:text-red-700" on:click={() => remove(contact.id)}>
          Eliminar
        </button>
      </li>
    {/each}
  </ul>
{/if}
