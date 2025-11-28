// server.js
import http from 'node:http';
import url from 'node:url';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const port = 3000;
const scoresFile = './scores.json';
const datosFile  = './datos.json';

async function readJSON(path, fallback) {
  if (!existsSync(path)) return fallback;
  try { return JSON.parse(await readFile(path, 'utf-8')); }
  catch { return fallback; }
}
async function writeJSON(path, obj) {
  await writeFile(path, JSON.stringify(obj, null, 2), 'utf-8');
}

const server = http.createServer(async (req, res) => {
  // CORS (por si luego llamas desde otro puerto)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }

  const parsed = url.parse(req.url, true);
  const { pathname, query } = parsed;

  // --- API: SALUDO ----------------------------------------------------------
  if (pathname === '/api/saludo' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ msg: 'Hola desde Node' }));
    return;
  }

  // --- API: SCORE (GET suma por query) -------------------------------------
  if (pathname === '/api/score' && req.method === 'GET') {
    const name = (query.name ?? 'anon').toString().trim().slice(0, 40);
    const pts  = Number(query.pts ?? 0);
    const scores = await readJSON(scoresFile, {});
    scores[name] = (scores[name] || 0) + pts;
    await writeJSON(scoresFile, scores);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok: true, scores }));
    return;
  }

  // --- API: SCORE (POST JSON o x-www-form-urlencoded) ----------------------
  if (pathname === '/api/score' && req.method === 'POST') {
    let raw = '';
    req.on('data', chunk => { raw += chunk; if (raw.length > 1e6) req.destroy(); }); // 1MB guard
    req.on('end', async () => {
      try {
        const ct = (req.headers['content-type'] || '').toLowerCase();
        let body = {};
        if (ct.includes('application/json')) {
          body = JSON.parse(raw || '{}');
        } else if (ct.includes('application/x-www-form-urlencoded')) {
          body = Object.fromEntries(new URLSearchParams(raw));
        }
        const name = (body.name ?? 'anon').toString().trim().slice(0, 40);
        const pts  = Number(body.pts ?? 0);
        if (!name) { res.writeHead(400, {'Content-Type':'application/json; charset=utf-8'}); return res.end(JSON.stringify({ ok:false, error:'Nombre vacío' })); }
        if (!Number.isFinite(pts)) { res.writeHead(400, {'Content-Type':'application/json; charset=utf-8'}); return res.end(JSON.stringify({ ok:false, error:'Puntos inválidos' })); }

        const scores = await readJSON(scoresFile, {});
        scores[name] = (scores[name] || 0) + pts;
        await writeJSON(scoresFile, scores);
        res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
        res.end(JSON.stringify({ ok:true, scores }));
      } catch (e) {
        res.writeHead(500, {'Content-Type':'application/json; charset=utf-8'});
        res.end(JSON.stringify({ ok:false, error:'Error procesando el cuerpo' }));
      }
    });
    return;
  }

  // --- API: SCOREBOARD (listar) --------------------------------------------
  if (pathname === '/api/scoreboard' && req.method === 'GET') {
    const scores = await readJSON(scoresFile, {});
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(scores));
    return;
  }

  // --- PÁGINA HTML con formulario + tabla ----------------------------------
  if (pathname === '/' && req.method === 'GET') {
    const datos = await readJSON(datosFile, { nicks: [] });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Scoreboard — Node</title>
  <style>
    body{font-family:system-ui,Segoe UI,Roboto,sans-serif; margin:2rem; line-height:1.5; background:#0b0e14; color:#e9e9f2}
    .card{max-width:820px;margin:0 auto; padding:1rem; background:#121826; border:1px solid #20283e; border-radius:14px}
    h1{margin:.2rem 0 1rem; font-size:1.4rem}
    form{display:grid; grid-template-columns:1fr 140px auto; gap:.75rem; align-items:end; margin-bottom:1rem}
    label{display:flex; flex-direction:column; font-size:.9rem; gap:.3rem}
    input{padding:.55rem .7rem; border:1px solid #2a3144; background:#0f1422; color:#e9e9f2; border-radius:10px}
    button{padding:.6rem 1rem; border:0; border-radius:10px; background:#7c5cff; color:#fff; cursor:pointer}
    button[disabled]{opacity:.6; cursor:default}
    .notice{margin:.25rem 0 0; font-size:.9rem; color:#cbd1e3}
    table{width:100%; border-collapse:collapse; background:#0f1422; border-radius:10px; overflow:hidden}
    th,td{padding:.6rem .5rem; border-bottom:1px solid #20283e; text-align:left}
    th{color:#9aa0b4; font-weight:600}
    .sub{opacity:.75; font-size:.9rem}
    code{background:#0f1422; padding:.15rem .35rem; border-radius:.35rem}
    .pill{display:inline-block; padding:.15rem .5rem; background:#0f1422; border:1px solid #20283e; border-radius:999px; color:#cbd1e3; font-size:.8rem}
  </style>
</head>
<body>
  <div class="card">
    <h1>Scoreboard</h1>
    <p class="sub">Nicks vistos por la CLI: <span class="pill">${(datos.nicks||[]).join(', ') || '—'}</span></p>

    <form id="form">
      <label>Nombre
        <input required name="name" placeholder="Jugador/a" maxlength="40" />
      </label>
      <label>Puntos (±)
        <input required name="pts" type="number" step="1" value="10" />
      </label>
      <button id="btn">Añadir</button>
      <p class="notice" id="notice"></p>
    </form>

    <table>
      <thead><tr><th>#</th><th>Nombre</th><th>Puntos</th></tr></thead>
      <tbody id="tbody"><tr><td colspan="3" style="opacity:.7">Cargando…</td></tr></tbody>
    </table>
  </div>

  <script>
    const $ = (s)=>document.querySelector(s);
    const tbody = $('#tbody');
    const notice = $('#notice');
    const btn = $('#btn');

    function escapeHTML(s){ return (s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

    function render(scores){
      const rows = Object.entries(scores)
        .map(([n,p])=>({n,p}))
        .sort((a,b)=>b.p-a.p)
        .map((r,i)=>\`<tr><td>\${i+1}</td><td>\${escapeHTML(r.n)}</td><td>\${r.p}</td></tr>\`)
        .join('');
      tbody.innerHTML = rows || '<tr><td colspan="3" style="opacity:.7">Sin datos todavía</td></tr>';
    }

    async function loadScores(){
      const r = await fetch('/api/scoreboard');
      render(await r.json());
    }

    $('#form').addEventListener('submit', async (e)=>{
      e.preventDefault();
      notice.textContent = ''; btn.disabled = true;
      const fd = new FormData(e.currentTarget);
      const payload = { name: fd.get('name'), pts: Number(fd.get('pts')) };
      const form = e.currentTarget;  
      try {
        const r = await fetch('/api/score', {
          method:'POST',
          headers:{ 'content-type':'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await r.json();
        if(!r.ok || !data.ok) throw new Error(data.error || 'Error al guardar');
        render(data.scores);
        form.reset(); // limpia el form
      } catch(err){
        notice.textContent = '⚠️ ' + err.message;
      } finally {
        btn.disabled = false;
      }
    });

    loadScores();
  </script>
</body>
</html>`);
  }

  // --- 404 ---------------------------------------------------------------
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(`Not found: ${pathname}`);
});

server.listen(port, () => console.log(`Servidor: http://localhost:${port}`));
