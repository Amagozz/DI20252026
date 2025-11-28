// src/App.jsx
import { useState, useMemo } from "react";
import { games } from "./data";

function App() {
  const [busqueda, setBusqueda] = useState("");
  const [genero, setGenero] = useState("Todos");
  const [plataforma, setPlataforma] = useState("Todas");
  const [minPuntuacion, setMinPuntuacion] = useState(0);

  // Sacamos listas únicas de géneros y plataformas a partir del dataset
  const generos = useMemo(
    () => ["Todos", ...new Set(games.map((g) => g.genero))],
    []
  );

  const plataformas = useMemo(
    () => ["Todas", ...new Set(games.map((g) => g.plataforma))],
    []
  );

  // Filtro principal
  const juegosFiltrados = useMemo(() => {
    console.log("Llamada a filtro")
    return games.filter((game) => {
      const coincideTitulo = game.titulo
        .toLowerCase()
        .includes(busqueda.toLowerCase());

      const coincideGenero =
        genero === "Todos" ? true : game.genero === genero;

      const coincidePlataforma =
        plataforma === "Todas" ? true : game.plataforma === plataforma;

      const coincidePuntuacion = game.puntuacion >= minPuntuacion;

      return (
        coincideTitulo &&
        coincideGenero &&
        coincidePlataforma &&
        coincidePuntuacion
      );
    });
  }, [busqueda, genero, plataforma, minPuntuacion]);

  return (
    <div className="app">
      <h1>Catálogo de videojuegos 🎮</h1>

      <section className="filtros">
        <div className="filtro">
          <label htmlFor="busqueda">Buscar por título:</label>
          <input
            id="busqueda"
            type="text"
            placeholder="Escribe un título..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="filtro">
          <label htmlFor="genero">Género:</label>
          <select
            id="genero"
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
          >
            {generos.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro">
          <label htmlFor="plataforma">Plataforma:</label>
          <select
            id="plataforma"
            value={plataforma}
            onChange={(e) => setPlataforma(e.target.value)}
          >
            {plataformas.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro">
          <label htmlFor="puntuacion">
            Puntuación mínima: <strong>{minPuntuacion}</strong>
          </label>
          <input
            id="puntuacion"
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={minPuntuacion}
            onChange={(e) => setMinPuntuacion(Number(e.target.value))}
          />
        </div>
      </section>

      <section className="lista">
        {juegosFiltrados.length === 0 ? (
          <p>No hay juegos que cumplan esos filtros 🙃</p>
        ) : (
          juegosFiltrados.map((game) => (
            <article key={game.id} className="card">
              <h2>{game.titulo}</h2>
              <p>
                <strong>Género:</strong> {game.genero}
              </p>
              <p>
                <strong>Plataforma:</strong> {game.plataforma}
              </p>
              <p>
                <strong>Puntuación:</strong> {game.puntuacion}
              </p>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

export default App;
