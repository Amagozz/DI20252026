export interface Producto {
  nombre: string;
  precio: number;
  unidades?: number;
}
export function totalStock(lista: Producto[]): number {
  return lista.reduce((acc, p) => acc + (p.unidades ?? 0) * p.precio, 0);
}

