// src/gestor.ts
// Clase que gestiona el ciclo de vida de las tareas

import { Tarea /*, crearTarea */ } from "./tarea";

export class GestorTareas {
  private tareas: Tarea[] = [];

  agregar(/* titulo: string */): Tarea {
    // const nueva = crearTarea(titulo);
    // this.tareas.push(nueva);
    // return nueva;
    return {} as any; // <-- reemplazar
  }

  completar(/* id: number */): boolean {
    // const t = this.tareas.find(x => x.id === id);
    // if (!t) return false;
    // t.completada = true;
    // return true;
    return false; // <-- reemplazar
  }

  listar(): Tarea[] {
    // return [...this.tareas];
    return []; // <-- reemplazar
  }
}
