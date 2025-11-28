// Level generator mapping from social variables to difficulty
// For simplicity, we use static presets; you can replace with CSV-driven generation.
export function getLevelConfig(i){
  const presets = [
    { name: 'Colegio de barrio', density: 0.8, ratio: 25, time: 35 },
    { name: 'Secundaria', density: 1.0, ratio: 27, time: 35 },
    { name: 'FP / Universidad', density: 1.1, ratio: 24, time: 40 },
    { name: 'Mercado laboral', density: 1.2, ratio: 26, time: 45 }
  ];
  const p = presets[i] || presets[0];
  const gravity = 0.55 + (p.ratio - 18) * 0.01; // peor ratio -> más gravedad (más difícil saltar)
  const speed = 1.8 + (p.density - 0.8) * 0.5;

  // build platforms and enemies
  const platforms = [];
  const enemies = [];
  const groundY = 360;
  // ground platform
  platforms.push({ x:0, y:groundY, w:960, h:40 });

  // floating platforms
  for(let k=0; k<8; k++){
    const x = 120 + k*100 + ((k%2)*40);
    const y = 300 - (k%3)*40;
    platforms.push({ x, y, w: 80, h: 16 });
  }

  // enemies patrolling
  for(let e=0; e<Math.round(4*p.density); e++){
    const ex = 200 + e*160;
    const ey = groundY - 16;
    enemies.push({ x: ex, y: ey, w: 22, h: 16, vx: (e%2?1:-1)*(1.0 + 0.2*e), minX: ex-60, maxX: ex+60 });
  }

  return { name: p.name, gravity, speed, platforms, enemies, time: p.time };
}
