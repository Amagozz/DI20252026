# Mini-CRM Svelte + Tailwind

Plantilla mínima para un **CRM de contactos** con Svelte 4 + Vite + Tailwind 3.

## 🚀 Arranque rápido

1. **Instala dependencias** (Node 18+):
```bash
npm install
```

2. **Modo desarrollo**:
```bash
npm run dev
```
Abre la URL que muestre Vite (normalmente `http://localhost:5173`).

3. **Build de producción**:
```bash
npm run build
npm run preview
```

## 📦 Qué incluye

- Svelte 4 con Vite
- Tailwind CSS configurado (PostCSS + Autoprefixer)
- Componentes de ejemplo:
  - `ContactForm` (crear contacto)
  - `ContactList` (listar/eliminar)
  - `FilterBar` (buscar/filtrar)
- Persistencia básica con `localStorage`

## 🧩 Estructura

```
svelte-tailwind-crm/
├─ public/
├─ src/
│  ├─ lib/
│  │  ├─ ContactForm.svelte
│  │  ├─ ContactList.svelte
│  │  └─ FilterBar.svelte
│  ├─ App.svelte
│  ├─ app.css
│  └─ main.js
├─ index.html
├─ package.json
├─ postcss.config.cjs
├─ tailwind.config.cjs
└─ vite.config.js
```

## 🧠 Siguientes pasos sugeridos (para clase)

- Añadir edición de contacto
- Paginación
- Validación avanzada de formularios
- Guardar/leer desde una API Express
- Roles/estados extra (badge de colores con Tailwind)
- Tests básicos de componentes

---

*Generado el 2025-11-13.*
