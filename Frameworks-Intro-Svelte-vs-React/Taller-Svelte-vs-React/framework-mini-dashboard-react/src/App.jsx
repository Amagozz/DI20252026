// src/App.jsx
import { useState, useEffect, useMemo } from "react";
import "./App.css";

const TAGS_INICIALES = ["Frontend", "Gamer", "Data", "FP DAM/DAW"];

// Parser CSV sencillo
function parseCSV(texto) {
  const lineas = texto.trim().split("\n");
  const [cabecera, ...filas] = lineas;
  const columnas = cabecera.split(",").map((c) => c.trim());

  return filas.map((linea) => {
    const valores = linea.split(",");
    const obj = {};
    columnas.forEach((col, i) => {
      obj[col] = valores[i] ? valores[i].trim() : "";
    });
    // convertir horas a número
    if (obj.horas) obj.horas = Number(obj.horas);
    return obj;
  });
}

function App() {
  // tarjeta
  const [likes, setLikes] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [tagActivo, setTagActivo] = useState("Frontend");

  // datos
  const [juegos, setJuegos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [plataformaFiltro, setPlataformaFiltro] = useState("Todas");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const clasesApp = darkMode ? "app app--dark" : "app app--light";

  // cargar CSV al montar
  useEffect(() => {
    async function cargarCSV() {
      try {
        setCargando(true);
        setError(null);
        const res = await fetch("/juegos.csv");
        if (!res.ok) throw new Error("No se pudo cargar juegos.csv");
        const texto = await res.text();
        const datos = parseCSV(texto);
        setJuegos(datos);
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setCargando(false);
      }
    }

    cargarCSV();
  }, []);

  // plataformas disponibles
  const plataformas = useMemo(() => {
    const set = new Set(juegos.map((j) => j.plataforma));
    return ["Todas", ...Array.from(set)];
  }, [juegos]);

  // filtrado por texto + plataforma
  const juegosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return juegos.filter((j) => {
      const coincideTexto =
        j.titulo.toLowerCase().includes(q) ||
        j.genero.toLowerCase().includes(q);
      const coincidePlataforma =
        plataformaFiltro === "Todas" || j.plataforma === plataformaFiltro;
      return coincideTexto && coincidePlataforma;
    });
  }, [juegos, busqueda, plataformaFiltro]);

  // agregación: horas totales por género (para gráfico)
  const horasPorGenero = useMemo(() => {
    const mapa = new Map();
    for (const j of juegosFiltrados) {
      const genero = j.genero || "Sin género";
      const horas = Number(j.horas) || 0;
      mapa.set(genero, (mapa.get(genero) || 0) + horas);
    }
    return Array.from(mapa.entries())
      .map(([genero, horas]) => ({ genero, horas }))
      .sort((a, b) => b.horas - a.horas);
  }, [juegosFiltrados]);

  const maxHoras = horasPorGenero[0]?.horas || 1;

  return (
    <div className={clasesApp}>
      <div className="layout layout--dashboard">
        {/* Tarjeta de perfil */}
        <div className="card">
          <header className="card__header">
           
            <div>
              <h1 className="card__title">Dev Student</h1>
              <p className="card__subtitle">
                Demo: React como mini-dashboard
              </p>
            </div>
          </header>      

        
        </div>

        {/* PANEL: filtros + tabla + gráfico */}
        <div className="panel panel--dashboard">
          <div className="panel__header">
            <h2>Juegos desde juegos.csv</h2>
            <span className="pill">
              {juegosFiltrados.length} / {juegos.length} juegos
            </span>
          </div>

          <div className="panel__controls panel__controls--grid">
            <input
              type="text"
              placeholder="Buscar por título o género..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            <select
              value={plataformaFiltro}
              onChange={(e) => setPlataformaFiltro(e.target.value)}
            >
              {plataformas.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {cargando && <p>Cargando datos...</p>}
          {error && <p style={{ color: "salmon" }}>Error: {error}</p>}

          {!cargando && !error && (
            <div className="dashboard-grid">
              {/* Gráfico de barras por género */}
              <div className="chart">
                <h3>Horas jugadas por género</h3>
                {horasPorGenero.length === 0 ? (
                  <p>No hay datos para los filtros actuales.</p>
                ) : (
                  <div className="chart__body">
                    {horasPorGenero.map((item) => (
                      <div key={item.genero} className="chart__row">
                        <span className="chart__label">{item.genero}</span>
                        <div className="chart__bar-container">
                          <div
                            className="chart__bar"
                            style={{
                              width: `${(item.horas / maxHoras) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="chart__value">
                          {item.horas} h
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tabla de juegos */}
              <div className="panel__table-wrapper">
                <h3>Listado de juegos</h3>
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Género</th>
                      <th>Plataforma</th>
                      <th>Horas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {juegosFiltrados.map((juego) => (
                      <tr key={juego.id}>
                        <td>{juego.titulo}</td>
                        <td>{juego.genero}</td>
                        <td>{juego.plataforma}</td>
                        <td>{juego.horas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
