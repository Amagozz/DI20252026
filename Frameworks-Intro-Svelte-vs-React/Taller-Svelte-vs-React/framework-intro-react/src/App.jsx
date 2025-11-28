// src/App.jsx
import { useState } from "react";
import "./App.css";

const TAGS_INICIALES = ["Frontend", "Gamer", "Data", "FP DAM/DAW"];

function App() {
  // estado: número de likes
  const [likes, setLikes] = useState(0);

  // estado: tema oscuro / claro
  const [darkMode, setDarkMode] = useState(true);

  // estado: tag seleccionado
  const [tagActivo, setTagActivo] = useState("Frontend");

  const clasesApp = darkMode ? "app app--dark" : "app app--light";

  return (
    <div className={clasesApp}>
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
            Esta tarjeta está hecha con <strong>React</strong>. Cuando cambian
            los estados, React vuelve a ejecutar el componente y repinta la UI.
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
    </div>
  );
}

export default App;
