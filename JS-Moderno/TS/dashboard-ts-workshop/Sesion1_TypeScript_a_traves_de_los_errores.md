# Sesión 1 — TypeScript a través de los errores (3 h)

**Propósito:** enseñar TypeScript mostrando *errores reales de JavaScript* y cómo TS los previene antes de ejecutar. La sesión construye un mini **dashboard de ventas** primero en JS y luego en TS. En la siguiente sesión se migra a **Svelte + TS** para entender la reactividad y el valor de un framework.

---

## Objetivos de aprendizaje
- Identificar errores típicos de JS (coerción, parámetros ausentes, `undefined`/`null`, DOM nulo).
- Prevenirlos con TS: tipos básicos, funciones tipadas, `interface`/`type`, arrays de objetos.
- Preparar el terreno para Svelte + TS (reactividad y tipado en componentes).

## Estructura temporal (3 h)
- **Bloque 1 (30')** El caos amable de JS: errores en directo.
- **Bloque 2 (45')** Tipado básico y funciones seguras en TS.
- **Bloque 3 (45')** Modelos de datos con `interface` (dashboard de ventas).
- **Bloque 4 (45')** Dashboard mínimo: versión JS con errores → versión TS segura.
- **Cierre (15')** Conclusiones y puente hacia Svelte + TS.

---

## Bloque 1 — El caos de JavaScript (30')
**Conceptos:** tipado dinámico, coerción, `undefined`/`null`, errores en runtime.

**Demostración 1 (JS):**
```js
let ventas = [120, 200, "300", 400];
let total = 0;
for (let v of ventas) total += v;
console.log("Total:", total); // "120200300400" → concatenación
```

**Demostración 2 (JS):**
```js
function aplicarIVA(precio, iva) {
  return precio * (1 + iva);
}
console.log(aplicarIVA(100)); // NaN (iva es undefined)
```

**Mensaje clave:** JS te deja correr con los cordones desatados. TS te obliga a atártelos antes.

---

## Bloque 2 — Tipado básico y funciones seguras (45')
**Conceptos:** tipos primitivos, inferencia, parámetros opcionales y por defecto, `any` vs `unknown`.

**Versión TS (equivalente):**
```ts
function aplicarIVA(precio: number, iva: number = 0.21): number {
  return precio * (1 + iva);
}
console.log(aplicarIVA(100));
```

**Ejercicio rápido:**
- Implementa `media(valores: number[]): number`.
- Introduce un string en la lista y observa el error de compilación.

**`unknown` mejor que `any`:**
```ts
function toUpperSafe(x: unknown): string {
  if (typeof x === "string") return x.toUpperCase();
  throw new Error("No es string");
}
```

---

## Bloque 3 — Interfaces y modelos tipados (45')
**Conceptos:** `interface`/`type`, campos opcionales, arrays de objetos, `??` y `?.`.

**Modelo de datos:**
```ts
interface Producto {
  nombre: string;
  precio: number;
  unidades?: number;
}
const productos: Producto[] = [
  { nombre: "Ratón", precio: 20, unidades: 5 },
  { nombre: "Teclado", precio: 40, unidades: 8 }
];
```

**Ejercicio:** `totalStock(productos): number` usando `unidades ?? 0`.

---

## Bloque 4 — Dashboard mínimo (45')
**Objetivo:** página simple que lee datos, calcula totales y muestra resultados.

- **JS:** deja pasar errores (string en precios, DOM nulo).
- **TS:** fuerza a tipar datos y a pensar en DOM nulo (`!` o chequeo).

**Tipado DOM en TS:**
```ts
const el = document.getElementById("total");
if (el) el.textContent = total.toString();
```

---

## Cierre (15')
- TS falla en compilación; JS falla en ejecución.
- Próxima sesión: **Svelte + TS** (componentes, stores y reactividad) usando el mismo modelo `Producto`.
- Requisito de Node recomendado: **>= 22.12** para evitar incompatibilidades con tooling moderno.
