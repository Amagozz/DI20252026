// src/gestor.ts (solución)

import { Tarea, crearTarea } from "./tarea.js";

export class GestorTareas {
  private tareas: Tarea[] = [];

  agregar(titulo: string): Tarea {
    const nueva = crearTarea(titulo);
    this.tareas.push(nueva);
    return nueva;
  }

  completar(id: number): boolean {
    const t = this.tareas.find(x => x.id === id);
    if (!t) return false;
    t.completada = true;
    return true;
  }

  listar(): Tarea[] {
    return [...this.tareas];
  }
}
