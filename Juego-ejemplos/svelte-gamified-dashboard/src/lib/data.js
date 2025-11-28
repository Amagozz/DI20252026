let cache = [];
export const perfiles = ['humilde','humilde-becado','rico-vago','rico-aplicado'];

export async function loadCSV(path){
  const res = await fetch(path);
  const text = await res.text();
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(',');
  cache = lines.map(line=>{
    const cols = line.split(',');
    const obj = {};
    headers.forEach((h,i)=> obj[h] = cols[i]);
    obj.IngresosFamiliares = +obj.IngresosFamiliares;
    obj.IngresoActual = +obj.IngresoActual;
    obj.MovilidadSocial = +obj.MovilidadSocial;
    obj.Becado = obj.Becado === 'True' || obj.Becado === 'true';
    return obj;
  });
  return cache;
}

export function getData(){
  return cache;
}

export async function getMobilityByPerfil(){
  const groups = {};
  for(const row of cache){
    const k = row.Perfil;
    (groups[k] ||= []).push(row);
  }
  const out = {};
  for(const [k, arr] of Object.entries(groups)){
    out[k] = arr.reduce((s, r)=> s + r.MovilidadSocial, 0) / arr.length;
  }
  return out;
}

export async function getScatterByPerfil(selected){
  const by = {};
  for(const p of perfiles) by[p] = [];
  for(const r of cache){
    if(selected && r.Perfil !== selected) continue;
    by[r.Perfil].push({ x: r.IngresosFamiliares, y: r.IngresoActual });
  }
  const colors = ['hsl(278 80% 55%)','hsl(168 80% 45%)','hsl(18 85% 55%)','hsl(210 80% 55%)'];
  return Object.keys(by).map((k,i)=> ({
    label: k, data: by[k], pointRadius: 4, backgroundColor: colors[i % colors.length]
  }));
}


