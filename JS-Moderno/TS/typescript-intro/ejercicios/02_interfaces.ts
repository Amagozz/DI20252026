// 02_interfaces.ts
// Objetivo: modelado de objetos con interface y diferencias con type.
//
// Tareas:
// 1) Define 'interface Producto' con nombre, precio y categoria opcional.
// 2) Crea 'catalogo: Producto[]' y una función 'filtrarPorCategoria(cat?: string): Producto[]'.
// 3) Marca 'id' como 'readonly' en 'ProductoConId' y crea una función 'aplicarDescuento'.

export interface Producto {
  // nombre: string;
  // precio: number;
  // categoria?: string;
}

export const catalogo /*: Producto[]*/ = [
  // { nombre: "Ratón", precio: 20 },
  // { nombre: "Teclado", precio: 40, categoria: "Periféricos" },
];

export function filtrarPorCategoria(/* cat?: string */) /*: Producto[]*/ {
  // si 'cat' está definido, devuelve solo los de esa categoría; si no, todos
  return []; // <-- reemplazar
}

// readonly y type vs interface
export type ProductoConId = /* {
  readonly id: number;
  nombre: string;
  precio: number;
} */ unknown;

export function aplicarDescuento(/* p: ProductoConId, porcentaje: number */) /*: ProductoConId*/ {
  // devuelve un nuevo objeto con el precio reducido
  return {} as ProductoConId; // <-- reemplazar
}
