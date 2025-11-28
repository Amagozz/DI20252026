

```js
const estado = new Map();
```

y no un simple objeto `{}` o un array `[]`. La elección de `Map` resuelve ciertos **problemas de gestión de estado**:

---

### 1. **Claves flexibles**

* Con un objeto, las claves siempre se convierten en `string`.
* Con un `Map`, la clave puede ser **cualquier valor** (string, número, objeto).
* Para este ejercicio usamos nombres (`"Ana"`, `"Lucía"`), pero más adelante podríamos usar **objetos completos de alumno** como clave.

```js
const m = new Map();
m.set("Ana", 10);
m.set({id:1, nombre:"Lucía"}, 12); // posible en Map, no en {}
```

---

### 2. **Orden de inserción garantizado**

* `Map` mantiene el **orden en que añadiste las claves**.
* En un objeto `{}`, aunque la mayoría de navegadores modernos respetan cierto orden, no está tan garantizado ni es tan claro.
* Esto hace más predecible el renderizado.

---

### 3. **Métodos útiles y expresivos**

En lugar de jugar con `Object.keys`, `Object.values`, `Object.entries`, `Map` trae sus propios métodos:

* `estado.set(nombre, valor)` → añade/actualiza.
* `estado.get(nombre)` → consulta.
* `estado.has(nombre)` → verifica.
* `estado.delete(nombre)` → elimina.
* Iteración directa con `for...of`.

Ejemplo:

```js
for (const [nombre, valor] of estado) {
  console.log(nombre, valor);
}
```

Con un objeto tendrías que hacer `Object.entries(estado)` primero.

---

### 4. **Escalabilidad hacia problemas de concurrencia**

Piensa en el futuro:

* Si pasamos a un **estado global sincronizado en tiempo real** (ej. un store de Svelte o Redux), `Map` es una estructura natural para representar entidades tipo “diccionario de usuarios”.
* Permite operaciones atómicas más limpias (`set`, `get`, `delete`), lo que ayuda a razonar sobre **conflictos de estado** en concurrencia.

---

### 5. **Claridad semántica**

Al decir `const estado = new Map();` estás transmitiendo explícitamente: *“esto es un diccionario de pares clave-valor mutable”*.
Un objeto `{}` en JavaScript puede ser cualquier cosa: estructura de datos, prototipo, incluso clase.
Con `Map`, el lector entiende rápido la intención.

---

👉 Resumen en corto:

* `Map` es más seguro y expresivo para **colecciones de pares clave–valor dinámicas**.
* Es más robusto para crecer hacia **problemas de reactividad y concurrencia**.
* Aquí usamos nombres como claves, pero podrías evolucionar a IDs únicos, e incluso a objetos complejos.

---

Genial, aquí va una **comparativa didáctica** entre usar un objeto `{}` y un `Map` en el contexto de nuestra práctica de contadores.

---

## 1. Declaración e inserción

### Con `{}`:

```js
const estado = {};
estado["Ana"] = 10;
estado["Pedro"] = 12;
```

### Con `Map`:

```js
const estado = new Map();
estado.set("Ana", 10);
estado.set("Pedro", 12);
```

👉 Diferencia: en `{}` las claves siempre son strings. En `Map` podrías usar números, objetos, etc.

---

## 2. Lectura de valores

### Con `{}`:

```js
console.log(estado["Ana"]);  // 10
console.log("Ana" in estado); // true
```

### Con `Map`:

```js
console.log(estado.get("Ana")); // 10
console.log(estado.has("Ana")); // true
```

👉 `Map` tiene métodos más expresivos (`get`, `has`).

---

## 3. Iteración sobre claves y valores

### Con `{}`:

```js
for (const [nombre, valor] of Object.entries(estado)) {
  console.log(nombre, valor);
}
```

### Con `Map`:

```js
for (const [nombre, valor] of estado) {
  console.log(nombre, valor);
}
```

👉 En `Map` no necesitas `Object.entries`, ya está preparado para iterar.

---

## 4. Tamaño (cuántos elementos hay)

### Con `{}`:

```js
const numElementos = Object.keys(estado).length;
```

### Con `Map`:

```js
const numElementos = estado.size;
```

👉 Más directo y legible en `Map`.

---

## 5. Borrado

### Con `{}`:

```js
delete estado["Ana"];
```

### Con `Map`:

```js
estado.delete("Ana");
```

👉 Con `Map` la intención de borrar está clara.

---

## 6. Ejemplo aplicado: reiniciar todos los contadores a 10

### Con `{}`:

```js
for (const nombre of Object.keys(estado)) {
  estado[nombre] = 10;
}
```

### Con `Map`:

```js
for (const nombre of estado.keys()) {
  estado.set(nombre, 10);
}
```

👉 De nuevo, `Map` tiene su propio iterador de claves.

---

## 7. Caso avanzado (claves que no son strings)

### Con `{}`:

```js
const estado = {};
const alumno = { id: 1, nombre: "Ana" };
estado[alumno] = 10;  // ❌ en realidad la clave se convierte en "[object Object]"
console.log(estado);
```

Resultado:

```js
{ "[object Object]": 10 }
```

### Con `Map`:

```js
const estado = new Map();
const alumno = { id: 1, nombre: "Ana" };
estado.set(alumno, 10); // ✅ clave es realmente el objeto
console.log(estado.get(alumno)); // 10
```

👉 Aquí se ve la gran ventaja: `Map` puede usar **cualquier cosa** como clave.

---

## Resumen para clase

* `{}` es suficiente para **casos sencillos** donde las claves son siempre strings fijas.
* `Map` es mejor cuando:

  * Necesitas un **diccionario dinámico** de valores.
  * Quieres claves no string (ej. objetos).
  * Te interesa **orden de inserción**.
  * Necesitas métodos más expresivos y legibles.
  * Estás pensando en **estado compartido y concurrencia**.

---

## Intenta modificar el código para usar {} en lugar de Map