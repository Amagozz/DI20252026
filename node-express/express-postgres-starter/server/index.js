import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());

// Configurar pool de conexiones
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT
});

// Endpoint de prueba
app.get("/api/alumnos", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM alumnos");
    res.json(result.rows);
  } catch (err) {
    console.error("Error en consulta:", err);
    res.status(500).json({ error: "Error al consultar la BD" });
  }
});

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
