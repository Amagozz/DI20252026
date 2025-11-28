// 03_clases_solucion.ts

interface ConIdentificador { id: number }

export class Empleado implements ConIdentificador {
  constructor(public id: number, public nombre: string, private salario: number) {}
  getSalario(): number { return this.salario; }
}

export class Gerente extends Empleado {
  bonus(): number { return this.getSalario() * 0.2; }
}

// Prueba rápida
const g = new Gerente(1, "Aída", 3000);
console.log("Bonus gerente:", g.bonus());
