/* StackHK hero — golden particle network background (canvas) */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W, H, particles = [], raf;
  const GOLD = '245,166,35';   // #F5A623
  const TEAL = '0,194,160';    // #00C2A0

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width = rect.width;
    H = canvas.height = rect.height;
    init();
  }

  function init() {
    particles = [];
    const count = Math.min(90, Math.max(36, Math.floor((W * H) / 22000)));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.6,
        c: Math.random() < 0.14 ? TEAL : GOLD
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // connection lines
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          const op = (1 - dist / 130) * 0.28;
          ctx.strokeStyle = 'rgba(' + p.c + ',' + op.toFixed(3) + ')';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
      // mouse proximity lines handled by mousemove var
    }
    // dots
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.c + ',0.85)';
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }
  }

  function loop() { draw(); raf = requestAnimationFrame(loop); }

  // subtle mouse attraction
  let mouse = { x: -9999, y: -9999 };
  canvas.parentElement.addEventListener('mousemove', (e) => {
    const r = canvas.parentElement.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  // extra: near-mouse lines
  const origDraw = draw;
  draw = function () {
    origDraw();
    // brief mouse glow line
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 140) {
        ctx.strokeStyle = 'rgba(245,166,35,' + ((1 - dist / 140) * 0.35).toFixed(3) + ')';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  };

  resize();
  window.addEventListener('resize', resize);

  if (reduce) { draw(); }           // static single frame for reduced motion
  else { loop(); }

  // pause when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); }
    else if (!reduce) { loop(); }
  });
})();
