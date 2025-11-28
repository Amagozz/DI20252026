// Versión deliberadamente "peligrosa" en JS (para enseñar errores)
fetch("./data/ventas.json")
  .then(r => r.json())
  .then(ventas => {
    const total = ventas.reduce((acc, v) => acc + v, 0);
    const media = total / ventas.length;

    document.getElementById("total").textContent = total;
    document.getElementById("media").textContent = media;
  })
  .catch(err => {
    document.getElementById("mensaje").textContent = String(err);
  });

