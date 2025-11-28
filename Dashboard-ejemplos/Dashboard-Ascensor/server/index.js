// server/index.js
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3033;

app.use(cors());
app.use(express.json());

// Carpeta donde están los CSV exportados por el notebook
const DATA_DIR = path.join(__dirname, "data");


// --- util para leer CSV con caché en memoria ---

const cache = {};

function loadCsv(fileName, options = {}) {
  const { separator = ",", encoding = "utf-8" } = options;

  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(DATA_DIR, fileName);

    fs.createReadStream(filePath, { encoding })
      .pipe(csv({ separator }))
      .on("data", (row) => results.push(row))
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
}

async function getDataset(key, fileName) {
  if (!cache[key]) {
    console.log(`📥 Cargando ${fileName}...`);
    cache[key] = await loadCsv(fileName);
    console.log(`✅ ${fileName} cargado (${cache[key].length} filas)`);
  }
  return cache[key];
}

// ---------- 1) Curva de movilidad nacional ----------
// GET /api/nacional/curva?sexo=Ambos&tipo_renta=Individual
// Fuente: curva_movilidad_nacional.csv
// columnas: sexo, tipo_renta, centil_padres, promedio, centil_hijo, centil_hijo_loess, n

app.get("/api/nacional/curva", async (req, res) => {
  try {
    const datos = await getDataset("curva_nacional", "curva_movilidad_nacional.csv");

    const sexoFiltro = req.query.sexo || "total";
    const tipoRentaFiltro = req.query.tipo_renta || "individual";

    let filtrados = datos;

    // Filtrar si existen columnas
    if (datos[0].sexo !== undefined) {
      filtrados = filtrados.filter((d) => d.sexo === sexoFiltro);
    }
    if (datos[0].tipo_renta !== undefined) {
      filtrados = filtrados.filter((d) => d.tipo_renta === tipoRentaFiltro);
    }

    // Limpiar y ordenar
    const salida = filtrados
      .map((d) => {
        const centil_padres = Number(d.centil_padres);
        // usamos la versión suavizada si existe, si no la directa, si no el promedio
        const centil_hijo =
          d.centil_hijo_loess !== undefined
            ? Number(d.centil_hijo_loess)
            : d.centil_hijo !== undefined
            ? Number(d.centil_hijo)
            : Number(d.promedio);

        return {
          sexo: d.sexo,
          tipo_renta: d.tipo_renta,
          centil_padres,
          centil_hijo,
          centil_hijo_bruto: d.centil_hijo ? Number(d.centil_hijo) : null,
          centil_hijo_loess: d.centil_hijo_loess
            ? Number(d.centil_hijo_loess)
            : null,
          n: d.n ? Number(d.n) : null
        };
      })
      .sort((a, b) => a.centil_padres - b.centil_padres);

    res.json(salida);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cargando curva nacional" });
  }
});

// ---------- 2) Ranking por CCAA (padres centil 20) ----------
// GET /api/ccaa/ranking
// Fuente: ranking_ccaa_centil_padres_20.csv
// columnas: ccaa, centil_hijo_loess

app.get("/api/ccaa/ranking", async (req, res) => {
  try {
    const datos = await getDataset(
      "ranking_ccaa_p20",
      "ranking_ccaa_centil_padres_20.csv"
    );

    const salida = datos
      .map((d) => ({
        ccaa: d.ccaa,
        centil_padres: 20, // este fichero ya es solo para centil 20
        centil_hijo: Number(d.centil_hijo_loess)
      }))
      .sort((a, b) => b.centil_hijo - a.centil_hijo);

    res.json(salida);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cargando ranking CCAA" });
  }
});

// ---------- 3) Distribución de quintiles nacional ----------
// GET /api/quintiles/nacional
// Fuente: distribucion_quintiles_nacional_padres_hijos.csv
// columnas: quintil_padres, '0-20', '20-40', '40-60', '60-80', '80-100'

app.get("/api/quintiles/nacional", async (req, res) => {
  try {
    const datos = await getDataset(
      "quintiles_nacional",
      "distribucion_quintiles_nacional_padres_hijos.csv"
    );

    const salida = datos.map((d) => ({
      quintil_padres: Number(d.quintil_padres),
      rango_0_20: Number(d["0-20"]),
      rango_20_40: Number(d["20-40"]),
      rango_40_60: Number(d["40-60"]),
      rango_60_80: Number(d["60-80"]),
      rango_80_100: Number(d["80-100"])
    }));

    res.json(salida);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cargando quintiles nacionales" });
  }
});

// ---------- 4) Conversor centil → euros (hijos) ----------
// GET /api/conversor/hijos
// Fuente: conversor_centiles_a_euros_hijos.csv
// columnas: centil, renta

app.get("/api/conversor/hijos", async (req, res) => {
  try {
    const datos = await getDataset(
      "conv_hijos",
      "conversor_centiles_a_euros_hijos.csv"
    );

    const salida = datos.map((d) => ({
      centil: Number(d.centil),
      renta: Number(d.renta)
    }));

    res.json(salida);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cargando conversor hijos" });
  }
});

// ---------- 5) Conversor centil → euros (padres) ----------
// GET /api/conversor/padres
// Fuente: conversor_centiles_a_euros_padres.csv
// columnas: centil, renta

app.get("/api/conversor/padres", async (req, res) => {
  try {
    const datos = await getDataset(
      "conv_padres",
      "conversor_centiles_a_euros_padres.csv"
    );

    const salida = datos.map((d) => ({
      centil: Number(d.centil),
      renta: Number(d.renta)
    }));

    res.json(salida);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error cargando conversor padres" });
  }
});

// ---------- Arrancar servidor ----------

app.listen(PORT, () => {
  console.log(`🚀 API ascensor social escuchando en http://localhost:${PORT}`);
});
