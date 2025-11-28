export class Engine {
  constructor(canvas, { onScore } = {}){
    this.c = canvas.getContext('2d');
    this.w = canvas.width; this.h = canvas.height;
    this.onScore = onScore || (()=>{});
    this.keys = new Set();
    this.loop = this.loop.bind(this);
    this.bindKeys();
  }
  bindKeys(){
    window.addEventListener('keydown', e => { if(['ArrowLeft','ArrowRight',' '].includes(e.key)) this.keys.add(e.key); });
    window.addEventListener('keyup', e => { this.keys.delete(e.key); });
  }
  start(cfg, onWin, onLose){
    // cfg: { name, platforms[], enemies[], gravity, speed, time }
    this.cfg = cfg;
    this.onWin = onWin; this.onLose = onLose;
    this.reset();
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(this.loop);
    this.levelTimer = performance.now();
  }
  reset(){
    this.player = { x: 40, y: 300, vx: 0, vy: 0, w: 20, h: 28, onGround: false };
    this.platforms = this.cfg.platforms;
    this.enemies = this.cfg.enemies.map(e => ({...e}));
    this.gravity = this.cfg.gravity ?? 0.55;
    this.speed = this.cfg.speed ?? 2.0;
    this.goalX = this.w - 60;
  }
  loop(ts){
    const dt = 1; // simple
    // input
    this.player.vx = 0;
    if(this.keys.has('ArrowLeft')) this.player.vx = -3*this.speed;
    if(this.keys.has('ArrowRight')) this.player.vx = 3*this.speed;
    if(this.keys.has(' ') && this.player.onGround) { this.player.vy = -10; this.player.onGround = false; }

    // physics
    this.player.vy += this.gravity;
    this.player.x += this.player.vx;
    this.player.y += this.player.vy;

    // collisions with world bounds
    if(this.player.x < 0) this.player.x = 0;
    if(this.player.x + this.player.w > this.w) this.player.x = this.w - this.player.w;
    if(this.player.y > this.h) { this.onLose(); return; }

    // platforms collision AABB
    this.player.onGround = false;
    for(const p of this.platforms){
      if(this.aabb(this.player, p)){
        // simple resolution: place player on top if falling
        if(this.player.vy > 0 && this.player.y + this.player.h - this.player.vy <= p.y){
          this.player.y = p.y - this.player.h;
          this.player.vy = 0; this.player.onGround = true;
        } else {
          // hit from side
          if(this.player.x < p.x) this.player.x = p.x - this.player.w;
          else this.player.x = p.x + p.w;
        }
      }
    }

    // enemies move and collide
    for(const e of this.enemies){
      e.x += e.vx;
      if(e.x < e.minX || e.x > e.maxX) e.vx *= -1;
      if(this.aabb(this.player, e)){ this.onLose(); return; }
    }

    // reach goal
    if(this.player.x > this.goalX){
      this.onScore(25);
      this.onWin(); return;
    }

    // render
    this.draw();

    // timer check
    if(this.cfg.time){
      const elapsed = (performance.now() - this.levelTimer)/1000;
      if(elapsed > this.cfg.time){ this.onLose(); return; }
    }

    this.raf = requestAnimationFrame(this.loop);
  }
  aabb(a,b){
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  draw(){
    const ctx = this.c;
    ctx.clearRect(0,0,this.w,this.h);
    // background
    ctx.fillStyle = '#0f1422'; ctx.fillRect(0,0,this.w,this.h);
    // goal
    ctx.fillStyle = '#00d1b2'; ctx.fillRect(this.goalX, 0, 4, this.h);
    // platforms
    ctx.fillStyle = '#24304a';
    for(const p of this.platforms){ ctx.fillRect(p.x, p.y, p.w, p.h); }
    // enemies
    ctx.fillStyle = '#ff6b6b';
    for(const e of this.enemies){ ctx.fillRect(e.x, e.y, e.w, e.h); }
    // player
    ctx.fillStyle = '#7c5cff';
    ctx.fillRect(this.player.x, this.player.y, this.player.w, this.player.h);
    // HUD hints
    ctx.fillStyle = '#9aa0b4'; ctx.font = '12px system-ui';
    ctx.fillText(this.cfg.name, 12, 18);
  }
}
