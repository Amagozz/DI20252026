let cache = [];
export async function loadCSV(path){
  const res = await fetch(path);
  const text = await res.text();
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(',');
  cache = lines.map(line=>{
    const cols = line.split(',');
    const obj = {};
    headers.forEach((h,i)=> obj[h] = cols[i]);
    // casting
    obj.IngresosFamiliares = +obj.IngresosFamiliares;
    obj.RentaBarrio = obj.RentaBarrio ? +obj.RentaBarrio : null;
    obj.RatioProfesorAlumno = obj.RatioProfesorAlumno ? +obj.RatioProfesorAlumno : null;
    obj.NotaMedia = obj.NotaMedia ? +obj.NotaMedia : null;
    obj.IngresoActual = +obj.IngresoActual;
    obj.MovilidadSocial = +obj.MovilidadSocial;
    obj.Becado = (obj.Becado === 'True' || obj.Becado === 'true');
    return obj;
  });
  return cache;
}

export function sampleByPerfil(perfil){
  const pool = cache.filter(r => r.Perfil === perfil);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function barrios(){
  const set = new Map();
  for(const r of cache){
    if(r.Barrio) set.set(r.Barrio, { name: r.Barrio, renta: r.RentaBarrio, ratio: r.RatioProfesorAlumno });
  }
  return Array.from(set.values()).sort((a,b)=> a.renta - b.renta);
}

export function mobilityStats(){
  const by = {};
  for(const r of cache){
    (by[r.Perfil] ||= []).push(r.MovilidadSocial);
  }
  const out = {};
  for(const [k, arr] of Object.entries(by)){
    out[k] = arr.reduce((s,x)=> s+x, 0) / arr.length;
  }
  return out;
}
