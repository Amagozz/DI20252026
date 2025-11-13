<script>
  import ContactList from './lib/ContactList.svelte';
  import ContactForm from './lib/ContactForm.svelte';
  import FilterBar from './lib/FilterBar.svelte';

  let contacts = [
    { id: 1, name: 'Ada Lovelace', email: 'ada@analytical.io', phone: '600111222', status: 'activo' },
    { id: 2, name: 'Alan Turing', email: 'alan@enigma.uk', phone: '600333444', status: 'potencial' },
    { id: 3, name: 'Grace Hopper', email: 'grace@navy.us', phone: '600555666', status: 'inactivo' }
  ];

  let search = '';
  let statusFilter = 'todos';

  const addContact = (contact) => {
    contacts = [...contacts, { ...contact, id: Date.now() }];
    // Persistencia sencilla
    localStorage.setItem('contacts', JSON.stringify(contacts));
  };

  const removeContact = (id) => {
    contacts = contacts.filter(c => c.id !== id);
    localStorage.setItem('contacts', JSON.stringify(contacts));
  };

  const updateStatusFilter = (value) => { statusFilter = value; };
  const updateSearch = (value) => { search = value; };

  // Cargar desde localStorage si existe
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('contacts');
    if (saved) contacts = JSON.parse(saved);
  }

  $: filteredContacts = contacts.filter(contact => {
    const q = search.toLowerCase();
    const matchSearch = contact.name.toLowerCase().includes(q) || contact.email.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'todos' ? true : contact.status === statusFilter;
    return matchSearch && matchStatus;
  });
</script>

<div class="min-h-screen bg-slate-100 flex justify-center px-4 py-8">
  <div class="w-full max-w-5xl space-y-6">
    <header class="flex flex-col gap-1">
      <h1 class="text-3xl font-bold text-slate-900">Mini-CRM de contactos</h1>
      <p class="text-slate-600">Añade, filtra y gestiona contactos con Svelte + Tailwind.</p>
    </header>

    <FilterBar
      {search}
      {statusFilter}
      on:changeSearch={(e) => updateSearch(e.detail)}
      on:changeStatus={(e) => updateStatusFilter(e.detail)}
    />

    <div class="grid md:grid-cols-2 gap-6">
      <section class="bg-white rounded-xl shadow p-4 md:col-span-1">
        <h2 class="text-lg font-semibold mb-3">Nuevo contacto</h2>
        <ContactForm on:addContact={(e) => addContact(e.detail)} />
      </section>

      <section class="bg-white rounded-xl shadow p-4 md:col-span-1 md:row-span-2">
        <h2 class="text-lg font-semibold mb-3">Contactos ({filteredContacts.length})</h2>
        <ContactList {filteredContacts} on:removeContact={(e) => removeContact(e.detail)} />
      </section>
    </div>
  </div>
</div>
