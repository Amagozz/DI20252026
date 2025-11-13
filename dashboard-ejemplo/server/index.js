import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// --- Synthetic data generator (toy model) ---
const regions = ["Andalucía","Aragón","Asturias","Baleares","Canarias","Cantabria","Castilla y León","Castilla-La Mancha",
" Cataluña","Comunidad Valenciana","Extremadura","Galicia","La Rioja","Madrid","Murcia","Navarra","País Vasco"].map(r=>r.trim());

function randn_bm() {
  // Box-Muller transform
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function synthData(N=800){
  const data = [];
  for(let i=0;i<N;i++){
    const region = regions[Math.floor(Math.random()*regions.length)];
    const parentIncome = Math.max(9000, Math.min(120000, Math.exp(10 + 0.35*randn_bm()))); // log-ish
    // upward multipliers for some regions
    const regMult = ["Madrid","Cataluña","País Vasco","Baleares"].includes(region) ? 1.12 : 1.0;
    // child income depends partly on parent + region
    const childBase = 0.45*parentIncome + 12000 + 3500*randn_bm();
    const childIncome = Math.max(9000, Math.min(160000, childBase * regMult));
    data.push({
      id: i+1,
      region,
      ingresos_padres: Math.round(parentIncome*100)/100,
      ingresos_hijo: Math.round(childIncome*100)/100
    });
  }
  return data;
}

const DB = synthData();

// Helpers
function pearson(xs, ys){
  const n = Math.min(xs.length, ys.length);
  const mx = xs.reduce((a,b)=>a+b,0)/n;
  const my = ys.reduce((a,b)=>a+b,0)/n;
  let num=0, dx=0, dy=0;
  for(let i=0;i<n;i++){
    const vx = xs[i]-mx;
    const vy = ys[i]-my;
    num += vx*vy; dx += vx*vx; dy += vy*vy;
  }
  return num / Math.sqrt(dx*dy);
}

function mobilityIndex(p, c){
  // 1 - |delta|/p (clamped >=0). Higher is "better" (less inheritance)
  return Math.max(0, 1 - Math.abs(c-p)/Math.max(1,p));
}

// --- API ---
app.get('/api/v1/points', (req,res)=>{
  // optional limit
  const limit = Math.min(Number(req.query.limit)||500, 2000);
  const sample = DB.slice(0, limit);
  res.json(sample);
});

app.get('/api/v1/summary', (req,res)=>{
  const xs = DB.map(d=>d.ingresos_padres);
  const ys = DB.map(d=>d.ingresos_hijo);
  const corr = pearson(xs, ys);

  const byRegion = {};
  DB.forEach(d=>{
    const m = mobilityIndex(d.ingresos_padres, d.ingresos_hijo);
    if(!byRegion[d.region]) byRegion[d.region] = {count:0, sumMob:0};
    byRegion[d.region].count += 1;
    byRegion[d.region].sumMob += m;
  });
  const regionMobility = Object.entries(byRegion)
    .map(([region, obj]) => ({
      region,
      movilidad: Number((obj.sumMob/obj.count).toFixed(3))
    }))
    .sort((a,b)=>b.movilidad - a.movilidad);

  res.json({
    n: DB.length,
    corr: Number(corr.toFixed(3)),
    regionMobility
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
  console.log(`API running on http://localhost:${PORT}`);
});
