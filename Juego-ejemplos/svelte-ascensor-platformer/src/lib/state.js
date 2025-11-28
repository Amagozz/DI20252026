import { writable, derived } from 'svelte/store';
export const started = writable(false);
export const levelIndex = writable(0);
export const score = writable(0);
export const lives = writable(3);
export const maxLevels = 4;

export const scorePct = derived(score, $s => Math.min(100, Math.round(($s/200)*100)));
