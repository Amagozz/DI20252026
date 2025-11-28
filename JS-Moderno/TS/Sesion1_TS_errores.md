#  Sesión 1: TypeScript a través de los errores de JavaScript

Duración: **3 horas**  
Nivel: 2º DAM/DAW  
Objetivo: Comprender *por qué* usar TypeScript, experimentando con errores típicos de JavaScript.

---

## 🔹 Introducción 
 
JavaScript es dinámico y permisivo, lo cual lo hace flexible, pero también peligroso en proyectos grandes.




> "TypeScript no evita errores mágicamente. Simplemente los hace visibles *antes* de ejecutar el código."

---

##  BLOQUE 1 — El caos de JavaScript 
### Conceptos a repasar
- Tipado dinámico  
- Coerción  
- `undefined` / `null`  
- Errores en tiempo de ejecución

### Demostración en vivo
**Archivo:** `errores.js`
```js
let ventas = [120, 200, "300", 400];
let total = 0;
for (let v of ventas) total += v;
console.log("Total:", total); // "120200300400"
```


> “¿Por qué no da error? ¿Qué esperábamos que hiciera?”

**Otro ejemplo:**
```js
function aplicarIVA(precio, iva) {
  return precio * (1 + iva);
}
console.log(aplicarIVA(100)); // NaN
```



---

## 🧠 BLOQUE 2 — De JS a TS
### Conceptos a repasar
- Tipos básicos (`string`, `number`, `boolean`)  
- Inferencia y tipado explícito  
- Parámetros opcionales y valores por defecto  
- `any` vs `unknown`  
- Tipado de funciones

### Ejemplo comparativo
**Archivo:** `errores.ts`
```ts
function aplicarIVA(precio: number, iva: number = 0.21): number {
  return precio * (1 + iva);
}

console.log(aplicarIVA(100));        // OK
console.log(aplicarIVA("100", 0.21)); // ❌ Error en compilación
```


TypeScript te obliga a pensar en los tipos.  
En VS Code cómo el autocompletado cambia cuando añades tipos.

### Ejercicio rápido
1. Implementar:
   ```ts
   function media(valores: number[]): number {
     return valores.reduce((a, b) => a + b) / valores.length;
   }
   ```
2. Probar:
   ```ts
   console.log(media([1, 2, "3", 4]));
   ```
   → Error de compilación.

---

## ⚙️ BLOQUE 3 — Interfaces y modelos 
### Conceptos a repasar
- `interface` y `type`
- Campos opcionales
- Tipado de arrays de objetos
- Operadores `??` y `?.`

### Ejemplo de código
**Archivo:** `productos.ts`
```ts
interface Producto {
  nombre: string;
  precio: number;
  unidades?: number;
}

const productos: Producto[] = [
  { nombre: "Ratón", precio: 20, unidades: 5 },
  { nombre: "Teclado", precio: 40, unidades: 8 },
  // { nombre: "Pantalla" } // Prueba: error si falta "precio"
];

function totalStock(lista: Producto[]): number {
  return lista.reduce((acc, p) => acc + (p.unidades ?? 0) * p.precio, 0);
}

console.log(totalStock(productos));
```

TS detecta propiedades ausentes.  
Qutad un campo o cambien un tipo a propósito para ver los errores.

---

## 📊 BLOQUE 4 — Mini dashboard
### Objetivo
Construir una página simple que muestra totales y medias de ventas.

### Archivos
**index.html**
```html
<h1>Dashboard de Ventas</h1>
<p>Total: <span id="total">–</span></p>
<p>Media: <span id="media">–</span></p>
<script type="module" src="./main.ts"></script>
```

**main.ts**
```ts
const ventas: number[] = [100, 200, 300, 400];

const total = ventas.reduce((a, b) => a + b, 0);
const media = total / ventas.length;

const elTotal = document.getElementById("total");
const elMedia = document.getElementById("media");

if (elTotal && elMedia) {
  elTotal.textContent = total.toString();
  elMedia.textContent = media.toString();
}
```

### Ejercicio 
- Convertir los datos en objetos (`Producto` con `precio` y `unidades`).
- Reutilizar la función `totalStock`.
- Introducir un error intencionado (por ejemplo, un string en el precio).
- Observar cómo TS lo señala antes de compilar.

---

## 💬 BLOQUE 5 — Cierre y reflexión 

- ¿Qué errores de JS os ha evitado TS hoy?
- ¿Qué ventajas tiene tipar los datos en equipos grandes?
- ¿Creéis que TS hace más lento el desarrollo o más seguro?

**Resumen para proyectar:**
| JS | TS |
|----|----|
| Falla en ejecución | Falla en compilación |
| No valida tipos | Comprueba tipos |
| Propenso a errores | Autocompletado y seguridad |
| Flexible pero caótico | Estricto pero predecible |

**SIguiente paso:**  
Usar Svelte + TypeScript para mostrar cómo los frameworks también aplican paradigmas que evitan errores (reactividad, encapsulación y stores).

---


## 🧰 Herramientas sugeridas
- **VS Code** con extensión oficial de TypeScript.  
- **TypeScript Playground:** [https://www.typescriptlang.org/play](https://www.typescriptlang.org/play)  
- **Node 22.12+** para evitar problemas con dependencias modernas.  

---
