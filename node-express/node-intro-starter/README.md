# Node Intro Starter (CLI + API)

**Objetivo:** tener lo mínimo para entender Node: ejecutar JS en consola (CLI), 
montar un servidor HTTP nativo, y persistir en ficheros JSON.

## Requisitos
- Node 18+ (LTS). Comprueba con `node -v`.

## Instalación
```bash
npm i
```

## CLI (Hola + guardar nick)
```bash
npm run hello          # ejecuta con el nick por defecto (Gamer123)
node index.js TuNick   # o pasa el tuyo
```
El nick se guarda/actualiza en `datos.json`.

## API HTTP (sin frameworks)
```bash
npm run dev            # con autorecarga (nodemon)
# o
npm start              # sin nodemon
```
Abre:
- `http://localhost:3000/` → página base
- `http://localhost:3000/api/saludo` → JSON { msg }
- `http://localhost:3000/api/score?name=Pepe&pts=10` → suma puntos y devuelve marcador
- `http://localhost:3000/api/scoreboard` → marcador completo

> CORS activado (Access-Control-Allow-Origin: *). Puedes hacer fetch desde un front Svelte/Vite.

## Ejemplo de fetch desde el front
```js
const res = await fetch('http://localhost:3000/api/scoreboard');
const data = await res.json();
console.log(data);
```

## Estructura
```
node-intro-starter/
├─ index.js        # CLI: lee argumentos y guarda nick en datos.json
├─ server.js       # API HTTP nativa (sin Express)
├─ datos.json      # almacenamiento simple para nick
├─ scores.json     # marcador { nombre: puntos }
├─ package.json    # scripts npm
└─ .gitignore
```

## Siguientes pasos (ideas)
- Añadir `GET /api/user/:name` y `DELETE /api/score?name=...`.
- Migrar a `Express` o `Fastify` si quieres middlewares y rutas limpias.
- Guardar en SQLite con `better-sqlite3` para evitar conflictos de escritura.
