// 01_tipos_basicos.ts
// Objetivo: practicar tipos básicos, inferencia, parámetros opcionales y 'unknown' vs 'any'.
//
// Tareas:
// 1) Declara variables con tipos explícitos e inferidos (string, number, boolean).
// 2) Implementa 'calcularPrecioConIVA(precio, iva?)' con valores por defecto y tipos correctos.
// 3) Escribe 'toUpperSafe(x)' que reciba 'unknown' y devuelva string en mayúsculas o lance Error.
// 4) Declara un tipo literal 'Moneda = "EUR" | "USD" | "JPY"' y úsalo en una función 'formatea'.
//
// Recomendación: compila y corrige los errores que marque TS.

// 1) Variables
const nombre /*: string*/ = "Aída";
let unidades /*: number*/ = 3;
let enStock /*: boolean*/ = true;

// 2) Función con tipos e IVA por defecto al 21%
export function calcularPrecioConIVA(/* precio: number, iva?: number */) /*: number*/ {
  // pista: usa un valor por defecto para 'iva' si no viene
  // return precio * (1 + (iva ?? 0.21));
  return 0 as unknown as number; // <-- reemplazar
}

// 3) unknown vs any
export function toUpperSafe(/* x: unknown */) /*: string*/ {
  // si x es string, devuelve x.toUpperCase(); si no, lanza Error
  // tip: usa 'typeof x === "string"'
  return "" as string; // <-- reemplazar
}

// 4) tipos literales
// type Moneda = "EUR" | "USD" | "JPY";
export function formatea(/* cantidad: number, moneda: Moneda */) /*: string*/ {
  // devuelve algo como "123.45 EUR"
  return "" as string; // <-- reemplazar
}
