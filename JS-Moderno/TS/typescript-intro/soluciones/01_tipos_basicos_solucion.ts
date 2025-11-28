// 01_tipos_basicos_solucion.ts

const nombre: string = "Aída";
let unidades: number = 3;
let enStock: boolean = true;

export function calcularPrecioConIVA(precio: number, iva: number = 0.21): number {
  return precio * (1 + iva);
}

export function toUpperSafe(x: unknown): string {
  if (typeof x === "string") return x.toUpperCase();
  throw new Error("Se esperaba un string");
}

type Moneda = "EUR" | "USD" | "JPY";
export function formatea(cantidad: number, moneda: Moneda): string {
  return `${cantidad.toFixed(2)} ${moneda}`;
}
