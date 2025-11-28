import { Producto, totalStock } from "./model";

async function cargar(): Promise<Producto[]> {
  const r = await fetch("./data/productos.json");
  const datos = await r.json() as Producto[];
  return datos;
}

function actualizarDOM(total: number, media: number) {
  const elTotal = document.getElementById("total");
  const elMedia = document.getElementById("media");
  if (!elTotal || !elMedia) return;
  elTotal.textContent = total.toFixed(2);
  elMedia.textContent = media.toFixed(2);
}

cargar()
  .then((productos) => {
    const ventas = productos.map(p => p.precio * (p.unidades ?? 0));
    const total = ventas.reduce((a, b) => a + b, 0);
    const media = ventas.length ? total / ventas.length : 0;
    actualizarDOM(total, media);
    console.log("cargar")
    console.table(productos, ["nombre", "precioAA", "unidades"]);
  })
  .catch((err) => {
    const m = document.getElementById("mensaje");
    if (m) m.textContent = String(err);
  });

