// src/index.ts (solución)

import { GestorTareas } from "./gestor.js";

const gestor = new GestorTareas();

const t1 = gestor.agregar("Aprender TypeScript");
const t2 = gestor.agregar("Revisar proyecto Svelte");
gestor.completar(t1.id);
console.table(gestor.listar());
