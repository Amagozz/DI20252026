// Utilidad: cargar CSV local y parsearlo en objetos JS
async function loadCSV(path){
  const res = await fetch(path);
  const text = await res.text();
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(',');
  return lines.map(line=>{
    // Manejo simple de CSV sin comillas
    const cols = line.split(',');
    const obj = {};
    headers.forEach((h,i)=> obj[h] = cols[i]);
    // Casting mínimo
    obj.IngresosFamiliares = +obj.IngresosFamiliares;
    obj.IngresoActual = +obj.IngresoActual;
    obj.MovilidadSocial = +obj.MovilidadSocial;
    obj.Becado = obj.Becado === 'True' || obj.Becado === 'true';
    return obj;
  });
}

function groupBy(arr, key){
  return arr.reduce((acc, cur)=>{
    const k = cur[key];
    (acc[k] ||= []).push(cur);
    return acc;
  }, {});
}

function mean(arr, key){
  if(!arr.length) return 0;
  return arr.reduce((s, x)=> s + x[key], 0) / arr.length;
}

function palette(names){
  // Genera colores automáticos
  const base = [
    'hsl(278 90% 60%)','hsl(168 80% 45%)','hsl(18 85% 55%)','hsl(210 80% 55%)','hsl(330 80% 55%)'
  ];
  return names.map((_,i)=> base[i % base.length]);
}

async function main(){
  const data = await loadCSV('./ascensor_social_dataset.csv');

  // 1) Movilidad media por perfil (Bar chart)
  const byPerfil = groupBy(data, 'Perfil');
  const perfiles = Object.keys(byPerfil);
  const movilidadMedia = perfiles.map(p => Math.round(mean(byPerfil[p], 'MovilidadSocial')));
  const colors = palette(perfiles);

  const barCtx = document.getElementById('barChart').getContext('2d');
  new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: perfiles,
      datasets: [{
        label: '€ movilidad media',
        data: movilidadMedia,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { title: { display: true, text: '€' } }
      },
      plugins: {
        tooltip: { callbacks: { label: ctx => `${ctx.parsed.y.toLocaleString('es-ES')} €` } },
        legend: { display: false }
      }
    }
  });

  // 2) Dispersión Ingresos familiares vs Ingreso actual (Scatter por perfil)
  const scatterDatasets = perfiles.map((p, i) => ({
    label: p,
    data: byPerfil[p].map(r => ({ x: r.IngresosFamiliares, y: r.IngresoActual })),
    showLine: false,
    pointRadius: 4,
    backgroundColor: colors[i],
  }));

  const scatterCtx = document.getElementById('scatterChart').getContext('2d');
  new Chart(scatterCtx, {
    type: 'scatter',
    data: { datasets: scatterDatasets },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Ingresos familiares (€)' } },
        y: { title: { display: true, text: 'Ingreso actual (€)' } },
      }
    }
  });
}

main().catch(err=>{
  console.error(err);
  alert('Error cargando el CSV. Asegúrate de abrir con Live Server o un servidor local.');
});
