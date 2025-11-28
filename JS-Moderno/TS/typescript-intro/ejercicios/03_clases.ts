// 03_clases.ts
// Objetivo: clases, modificadores, herencia e interfaces con 'implements'.
//
// Tareas:
// 1) Crea clase 'Empleado' con 'nombre' (public) y 'salario' (private).
// 2) Crea 'Gerente' que extiende de 'Empleado' y añade método 'bonus()'.
// 3) Crea una interfaz 'ConIdentificador { id: number }' y haz que 'Empleado' la implemente.

// interface ConIdentificador { id: number }

// export class Empleado /* implements ConIdentificador */ {
//   // constructor(public nombre: string, private salario: number) {}
//   // getSalario(): number { return this.salario; }
// }

// export class Gerente /* extends Empleado */ {
//   // bonus(): number { return this.getSalario() * 0.2; }
// }

// Prueba rápida
// const g = new Gerente("Aída", 3000);
// console.log(g.bonus());
