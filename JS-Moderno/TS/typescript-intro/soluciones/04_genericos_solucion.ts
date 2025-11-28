// 04_genericos_solucion.ts

export function primero<T>(arr: T[]): T | undefined {
  return arr.length ? arr[0] : undefined;
}

export class Repositorio<T extends { id: number }> {
  private datos: T[] = [];
  crear(item: T): T {
    this.datos.push(item);
    return item;
  }
  obtener(id: number): T | undefined {
    return this.datos.find(x => x.id == id);
  }
  listar(): T[] {
    return [...this.datos];
  }
  actualizar(id: number, parcial: Partial<T>): T | undefined {
    const idx = this.datos.findIndex(x => x.id === id);
    if (idx === -1) return undefined;
    this.datos[idx] = { ...this.datos[idx], ...parcial };
    return this.datos[idx];
  }
  borrar(id: number): boolean {
    const lenAntes = this.datos.length;
    this.datos = this.datos.filter(x => x.id !== id);
    return this.datos.length < lenAntes;
  }
}

type Resultado<T, E> =
  | { tipo: "ok"; valor: T }
  | { tipo: "err"; error: E };

export function dividir(a: number, b: number): Resultado<number, string> {
  if (b === 0) return { tipo: "err", error: "División por cero" };
  return { tipo: "ok", valor: a / b };
}
