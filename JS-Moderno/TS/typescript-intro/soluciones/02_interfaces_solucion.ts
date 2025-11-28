// 02_interfaces_solucion.ts

export interface Producto {
  nombre: string;
  precio: number;
  categoria?: string;
}

export const catalogo: Producto[] = [
  { nombre: "Ratón", precio: 20 },
  { nombre: "Teclado", precio: 40, categoria: "Periféricos" },
  { nombre: "Pantalla", precio: 120, categoria: "Monitores" }
];

export function filtrarPorCategoria(cat?: string): Producto[] {
  if (!cat) return catalogo;
  return catalogo.filter(p => p.categoria === cat);
}

export type ProductoConId = {
  readonly id: number;
  nombre: string;
  precio: number;
};

export function aplicarDescuento(p: ProductoConId, porcentaje: number): ProductoConId {
  const factor = 1 - porcentaje / 100;
  return { ...p, precio: +(p.precio * factor).toFixed(2) };
}
