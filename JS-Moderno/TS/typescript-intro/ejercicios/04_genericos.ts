// 04_genericos.ts
// Objetivo: funciones y tipos genéricos, restricciones y utilidades.
//
// Tareas:
// 1) Implementa 'primero<T>(arr: T[]): T | undefined'.
// 2) Crea 'Repositorio<T extends { id: number }>' con métodos CRUD mínimos.
// 3) Declara un tipo 'Resultado<T, E>' como unión discriminada ('ok' | 'err') y úsalo.

export function primero /* <T> */(/* arr: T[] */) /*: T | undefined*/ {
  return undefined; // <-- reemplazar
}

export class Repositorio /* <T extends { id: number }> */ {
  // private datos: T[] = [];
  // crear(item: T): T { ... }
  // obtener(id: number): T | undefined { ... }
  // listar(): T[] { ... }
  // actualizar(id: number, parcial: Partial<T>): T | undefined { ... }
  // borrar(id: number): boolean { ... }
}

// type Resultado<T, E> =
//   | { tipo: "ok"; valor: T }
//   | { tipo: "err"; error: E };

// export function dividir(a: number, b: number): Resultado<number, string> {
//   // si b === 0 -> { tipo: "err", error: "División por cero" }
//   // si no -> { tipo: "ok", valor: a / b }
//   return { tipo: "ok", valor: 0 };
// }
