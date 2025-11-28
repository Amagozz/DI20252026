// Ejecuta: node index.js TuNick
// Guarda/actualiza el nick en datos.json
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const nombre = process.argv[2] || 'mundo';
console.log(`Hola, ${nombre} 👋`);

const file = './datos.json';
let data = { nicks: [] };
if (existsSync(file)) {
  try {
    data = JSON.parse(await readFile(file, 'utf-8'));
  } catch {}
}
if (!Array.isArray(data.nicks)) data.nicks = [];
if (!data.nicks.includes(nombre)) data.nicks.push(nombre);
await writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
console.log(`Guardado en ${file}:`, data);
