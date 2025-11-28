// src/App.jsx
import { useState, useEffect } from "react";
import "./App.css";

const TAGS_INICIALES = ["Frontend", "Gamer", "Data", "FP DAM/DAW"];

// Parser CSV muy básico (sin comillas, sin comas dentro de campos)
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
    return obj;
  });
}

function App() {
  // estados de la tarjeta
  const [likes, setLikes] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [tagActivo, setTagActivo] = useState("Frontend");

  // estados de datos
  const [juegos, setJuegos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const clasesApp = darkMode ? "app app--dark" : "app app--light";

  // Cargar CSV al montar el componente
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
  }, []); // ← solo una vez, al montar

  // Filtrar juegos por título o género
  const juegosFiltrados = juegos.filter((j) => {
    const q = busqueda.toLowerCase();
    return (
      j.titulo.toLowerCase().includes(q) ||
      j.genero.toLowerCase().includes(q)
    );
  });

  return (
    <div className={clasesApp}>
      <div className="layout">
        {/* Tarjeta de perfil */}
        <div className="card">
          <header className="card__header">
            <img
              className="card__avatar"
              src="https://avatars.githubusercontent.com/u/9919?s=200&v=4"
              alt="Avatar"
            />
            <div>
              <h1 className="card__title">Dev Student</h1>
              <p className="card__subtitle">Proyecto: ¿React o Svelte?</p>
            </div>
          </header>

          <section className="card__body">
            <p>
              Esta tarjeta está hecha con <strong>React</strong>. Aquí vemos
              <code>useState</code> y abajo{" "}
              <code>useEffect</code> cargando datos reales de un CSV.
            </p>

            <div className="tags">
              {TAGS_INICIALES.map((tag) => (
                <button
                  key={tag}
                  className={
                    "tag" + (tag === tagActivo ? " tag--active" : "")
                  }
                  onClick={() => setTagActivo(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            <p className="tag-info">
              Tag seleccionado: <strong>{tagActivo}</strong>
            </p>
          </section>

          <footer className="card__footer">
            <button
              className="btn"
              onClick={() => setLikes((valor) => valor + 1)}
            >
              ❤️ Likes: {likes}
            </button>

            <button
              className="btn btn--ghost"
              onClick={() => setDarkMode((valor) => !valor)}
            >
              Tema: {darkMode ? "Oscuro" : "Claro"}
            </button>
          </footer>
        </div>

        {/* Panel de datos CSV */}
        <div className="panel">
          <h2>Juegos desde juegos.csv</h2>

          <div className="panel__controls">
            <input
              type="text"
              placeholder="Buscar por título o género..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {cargando && <p>Cargando datos...</p>}
          {error && <p style={{ color: "salmon" }}>Error: {error}</p>}

          {!cargando && !error && (
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
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
