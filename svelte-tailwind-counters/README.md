# Svelte + Tailwind · Contadores Responsive

Plantilla mínima para explicar **Svelte** con **Tailwind**: 3 contadores en grid responsive,
props, eventos hijo→padre y reactividad con `$:`. Ideal para una demo de 10–20 minutos.

## Requisitos
- Node 18+

## Arranque
```bash
npm install
npm run dev
```
Abre la URL de Vite (p.ej. http://localhost:5173).

## Qué enseñar
- **Props**: `title`, `start`, `step`, `color` en `Counter.svelte`.
- **Eventos**: el hijo emite `change` → el padre actualiza el total.
- **Reactividad**: `$: total` en `App.svelte` y `$: isEven` en `Counter.svelte`.
- **Responsive**: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3`.
- **Tailwind dinámico**: clases con color dinámico (safelist en `tailwind.config.cjs`).

---
*Generado el 2025-11-13.*
