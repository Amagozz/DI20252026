// src/lib/api.js
const API_BASE = "http://localhost:3033/api";

export async function getCurvaNacional(sexo = "Ambos", tipoRenta = "Individual") {
  // OJO: en la API el parámetro se llama tipo_renta
  const url = `${API_BASE}/nacional/curva?sexo=${encodeURIComponent(
    sexo
  )}&tipo_renta=${encodeURIComponent(tipoRenta)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Error al cargar la curva nacional");
  }
  return res.json();
}

export async function getRankingCCAA() {
  // de momento solo hay ranking para centil_padres=20
  const url = `${API_BASE}/ccaa/ranking`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Error al cargar el ranking de CCAA");
  }
  return res.json();
}

export async function getQuintilesNacional() {
  const url = `${API_BASE}/quintiles/nacional`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Error al cargar los quintiles nacionales");
  }
  return res.json();
}

export async function getConversorHijos() {
  const url = `${API_BASE}/conversor/hijos`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Error al cargar el conversor de hijos");
  }
  return res.json();
}

export async function getConversorPadres() {
  const url = `${API_BASE}/conversor/padres`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Error al cargar el conversor de padres");
  }
  return res.json();
}
