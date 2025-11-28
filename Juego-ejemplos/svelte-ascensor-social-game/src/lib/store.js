import { writable, derived } from 'svelte/store';
import { loadCSV } from './data.js';

export const game = writable({
  perfil: 'humilde',
  becado: false,
  barrio: null,
  rentaBarrio: null,
  ratio: null,
  nota: null,
  nivelFinal: null,
  contrato: null,
  ingresosFamilia: null,
  ingresoActual: null,
  movilidad: null,
  score: 0
});

export const phase = writable(0); // 0-intro, 1..4 fases, 5-final

export const scorePct = derived(game, $g => Math.min(100, Math.round(($g.score / 100) * 100)));

// bootstrap: precargar CSV al cargar módulo (se usa desde Intro)
let bootPromise = null;
export function ensureData(){
  if(!bootPromise) bootPromise = loadCSV('/ascensor_social_dataset.csv');
  return bootPromise;
}
