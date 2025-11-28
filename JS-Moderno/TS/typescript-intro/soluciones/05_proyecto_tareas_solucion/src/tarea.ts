// src/tarea.ts (solución)

export interface Tarea {
  id: number;
  titulo: string;
  completada: boolean;
}

export function crearTarea(titulo: string): Tarea {
  return { id: Date.now(), titulo, completada: false };
}
