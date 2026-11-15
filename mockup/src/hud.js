// Canvas2D HUD: drawn every frame on a transparent canvas above the WebGL one.
// Glass panels, the question card with the gate colours, the run's progress, durability and combo,
// a speed gauge, attack and skill buttons with cooldown rings, and the right/wrong toast.
const DISPLAY = '"Black Han Sans", "Noto Sans KR", system-ui, sans-serif';
const BODY = '"Noto Sans KR", system-ui, sans-serif';

export class Hud {
  constructor(canvas) {
    this.c = canvas;
    this.x = canvas.getContext('2d');
    this.resize();
  }
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, window.innerWidth || document.documentElement.clientWidth); this.h = Math.max(1, window.innerHeight || document.documentElement.clientHeight);
    this.c.width = this.w * dpr; this.c.height = this.h * dpr;
    this.x.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.portrait = this.h > this.w;
    this.s = this.portrait ? Math.min(this.w / 430, 1.15) : Math.min(this.w / 1280, this.h / 720, 1.4);
    this.s = Math.max(this.s, 0.62);
  }

  panel(x0, y0, w, h, r = 18, tint = 'rgba(14,16,30,0.62)') {
    const x = this.x;
    x.save();
    x.shadowColor = 'rgba(0,0,0,0.35)'; x.shadowBlur = 24 * this.s; x.shadowOffsetY = 6 * this.s;
    x.fillStyle = tint; x.beginPath(); x.roundRect(x0, y0, w, h, r); x.fill();
    x.restore();
    const g = x.createLinearGradient(0, y0, 0, y0 + h);
    g.addColorStop(0, 'rgba(255,255,255,0.13)'); g.addColorStop(0.4, 'rgba(255,255,255,0.02)'); g.addColorStop(1, 'rgba(255,255,255,0.0)');
    x.fillStyle = g; x.beginPath(); x.roundRect(x0, y0, w, h, r); x.fill();
    x.lineWidth = 1.2; x.strokeStyle = 'rgba(255,255,255,0.16)'; x.stroke();
  }
  text(t, x0, y0, size, color = '#fff', align = 'left', font = BODY, weight = 700) {
    const x = this.x;
    x.font = `${weight} ${size}px ${font}`; x.fillStyle = color; x.textAlign = align; x.textBaseline = 'middle';
    x.fillText(t, x0, y0);
  }

  draw(st) {
    const x = this.x, s = this.s, W = this.w, H = this.h, P = this.portrait;
    x.clearRect(0, 0, W, H);
    const m = 16 * s;

    // top left: chapter and the run's ten questions
    const cw = (P ? W * 0.5 - m * 1.5 : 300 * s), ch = 86 * s;
    this.panel(m, m, cw, ch);
    this.text(st.kicker, m + 16 * s, m + 20 * s, 12 * s, 'rgba(200,215,255,0.75)');
    this.text(st.title, m + 16 * s, m + 44 * s, 22 * s, '#fff', 'left', DISPLAY, 400);
    const n = st.total, dot = Math.min(16 * s, (cw - 32 * s) / n - 4 * s);
    for (let i = 0; i < n; i++) {
      const dx = m + 16 * s + i * (dot + 5 * s) + dot / 2, dy = m + 70 * s, r = st.results[i];
      x.beginPath(); x.arc(dx, dy, dot / 2, 0, Math.PI * 2);
      if (r === true) x.fillStyle = '#35e08a'; else if (r === false) x.fillStyle = '#ff5468';
      else if (i === st.index) x.fillStyle = `rgba(255,255,255,${0.55 + 0.45 * Math.sin(st.time * 6)})`; else x.fillStyle = 'rgba(255,255,255,0.16)';
      x.fill();
    }

    // top right: durability, score, combo
    const rw = (P ? W * 0.5 - m * 1.5 : 280 * s), rx = W - m - rw;
    this.panel(rx, m, rw, ch);
    this.text('내구', rx + 16 * s, m + 20 * s, 12 * s, 'rgba(200,215,255,0.75)');
    this.text(Math.round(st.hp * 100) + ' / 100', rx + rw - 16 * s, m + 20 * s, 12 * s, '#fff', 'right');
    const segs = 12, sg = 3 * s, bw = (rw - 32 * s - sg * (segs - 1)) / segs;
    for (let i = 0; i < segs; i++) {
      const on = i < Math.round(st.hp * segs), bx = rx + 16 * s + i * (bw + sg);
      x.fillStyle = on ? (st.hp < 0.3 ? '#ff5468' : `hsl(${150 - i * 5} 85% ${55 + i}%)`) : 'rgba(255,255,255,0.12)';
      x.beginPath(); x.roundRect(bx, m + 33 * s, bw, 10 * s, 3 * s); x.fill();
    }
    this.text(st.score.toLocaleString('ko-KR'), rx + 16 * s, m + 66 * s, 22 * s, '#fff', 'left', DISPLAY, 400);
    if (st.combo >= 2) {
      const pulse = 1 + 0.06 * Math.sin(st.time * 10);
      x.save(); x.translate(rx + rw - 54 * s, m + 66 * s); x.scale(pulse, pulse);
      const g = x.createLinearGradient(-40 * s, 0, 40 * s, 0); g.addColorStop(0, '#ffb52e'); g.addColorStop(1, '#ff2d95');
      x.fillStyle = g; x.beginPath(); x.roundRect(-40 * s, -13 * s, 80 * s, 26 * s, 13 * s); x.fill();
      this.text(st.combo + ' 연속', 0, 1 * s, 14 * s, '#fff', 'center', DISPLAY, 400);
      x.restore();
    }

    // question card, centre top (below the side panels on a phone)
    const qw = Math.min(P ? W - m * 2 : 440 * s, W - m * 2), qh = 150 * s, qx = (W - qw) / 2, qy = P ? m * 2 + ch : m;
    this.panel(qx, qy, qw, qh, 22 * s, 'rgba(10,12,26,0.7)');
    this.text(st.qKick, W / 2, qy + 20 * s, 13 * s, 'rgba(200,215,255,0.8)', 'center');
    let qc = '#fff';
    if (st.feedback && st.feedback.t < 1.6) qc = st.feedback.ok ? '#5dffaa' : '#ff7a8a';
    this.text(st.qText, W / 2, qy + 62 * s, 50 * s, qc, 'center', DISPLAY, 400);
    const ow = 92 * s, og = 12 * s, ox0 = W / 2 - (st.opts.length * ow + (st.opts.length - 1) * og) / 2;
    st.opts.forEach((o, i) => {
      const ox = ox0 + i * (ow + og), oy = qy + 96 * s;
      const dim = st.feedback && st.feedback.t < 1.6 && i !== st.slot;
      x.globalAlpha = dim ? 0.3 : 1;
      x.fillStyle = st.colors[i]; x.beginPath(); x.roundRect(ox, oy, ow, 34 * s, 12 * s); x.fill();
      x.lineWidth = 2 * s; x.strokeStyle = 'rgba(255,255,255,0.85)'; x.stroke();
      this.text(String(o), ox + ow / 2, oy + 18 * s, 22 * s, '#fff', 'center', DISPLAY, 400);
      x.globalAlpha = 1;
    });
    // how close the gates are
    const tb = qw - 40 * s;
    x.fillStyle = 'rgba(255,255,255,0.12)'; x.beginPath(); x.roundRect(qx + 20 * s, qy + qh - 12 * s, tb, 4 * s, 2 * s); x.fill();
    const tg = x.createLinearGradient(qx, 0, qx + qw, 0); tg.addColorStop(0, '#22e1ff'); tg.addColorStop(1, '#ff2d95');
    x.fillStyle = tg; x.beginPath(); x.roundRect(qx + 20 * s, qy + qh - 12 * s, tb * st.timer, 4 * s, 2 * s); x.fill();

    // bottom left: speed gauge
    const gr = 70 * s, gx = m + gr + 8 * s, gy = H - m - gr - 8 * s;
    this.panel(gx - gr - 8 * s, gy - gr - 8 * s, gr * 2 + 16 * s, gr * 2 + 16 * s, gr + 8 * s, 'rgba(10,12,26,0.6)');
    const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, f = Math.min(st.speed / 200, 1);
    x.lineCap = 'round';
    x.lineWidth = 9 * s; x.strokeStyle = 'rgba(255,255,255,0.12)'; x.beginPath(); x.arc(gx, gy, gr - 10 * s, a0, a1); x.stroke();
    const sg2 = x.createLinearGradient(gx - gr, gy, gx + gr, gy); sg2.addColorStop(0, '#22e1ff'); sg2.addColorStop(0.6, '#8a5cff'); sg2.addColorStop(1, '#ff2d95');
    x.strokeStyle = sg2; x.shadowColor = '#8a5cff'; x.shadowBlur = 14 * s;
    x.beginPath(); x.arc(gx, gy, gr - 10 * s, a0, a0 + (a1 - a0) * f); x.stroke(); x.shadowBlur = 0;
    for (let i = 0; i <= 10; i++) {
      const a = a0 + (a1 - a0) * i / 10, r1 = gr - 22 * s, r2 = gr - (i % 5 ? 26 : 30) * s;
      x.lineWidth = 2 * s; x.strokeStyle = 'rgba(255,255,255,0.4)'; x.beginPath();
      x.moveTo(gx + Math.cos(a) * r1, gy + Math.sin(a) * r1); x.lineTo(gx + Math.cos(a) * r2, gy + Math.sin(a) * r2); x.stroke();
    }
    this.text(String(Math.round(st.speed)), gx, gy - 4 * s, 34 * s, '#fff', 'center', DISPLAY, 400);
    this.text('km/h', gx, gy + 22 * s, 11 * s, 'rgba(200,215,255,0.75)', 'center');
    x.fillStyle = 'rgba(255,255,255,0.12)'; x.beginPath(); x.roundRect(gx - 30 * s, gy + 38 * s, 60 * s, 5 * s, 3 * s); x.fill();
    x.fillStyle = '#22e1ff'; x.beginPath(); x.roundRect(gx - 30 * s, gy + 38 * s, 60 * s * st.nitro, 5 * s, 3 * s); x.fill();
    x.lineCap = 'butt';

    // bottom right: attack and skill
    const btn = (cx, cy, r, label, sub, cd, col) => {
      this.panel(cx - r, cy - r, r * 2, r * 2, r, 'rgba(10,12,26,0.6)');
      x.lineWidth = 4 * s; x.strokeStyle = 'rgba(255,255,255,0.12)'; x.beginPath(); x.arc(cx, cy, r - 5 * s, 0, Math.PI * 2); x.stroke();
      x.strokeStyle = col; x.shadowColor = col; x.shadowBlur = 10 * s;
      x.beginPath(); x.arc(cx, cy, r - 5 * s, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - cd)); x.stroke(); x.shadowBlur = 0;
      this.text(label, cx, cy - 6 * s, 15 * s, '#fff', 'center', DISPLAY, 400);
      this.text(sub, cx, cy + 13 * s, 10 * s, 'rgba(200,215,255,0.75)', 'center');
    };
    btn(W - m - 52 * s, H - m - 52 * s, 52 * s, '틈새 대시', st.skillCd > 0 ? Math.ceil(st.skillCd * 12) + '초' : '준비됨', st.skillCd, '#8a5cff');
    btn(W - m - 150 * s, H - m - 40 * s, 38 * s, '사격', st.firing ? '발사 중' : 'Z', 0, '#ff5468');

    // right/wrong toast
    if (st.feedback && st.feedback.t < 1.6) {
      const t = st.feedback.t, k = Math.min(t / 0.18, 1), pop = 0.6 + 0.4 * (1 - Math.pow(1 - k, 3)) + (t < 0.3 ? 0.08 * Math.sin(t * 30) : 0);
      const al = t > 1.2 ? 1 - (t - 1.2) / 0.4 : 1;
      x.save(); x.globalAlpha = al; x.translate(W / 2, H * (P ? 0.55 : 0.5) - t * 18 * s); x.scale(pop, pop);
      const col = st.feedback.ok ? '#35e08a' : '#ff5468';
      x.shadowColor = col; x.shadowBlur = 30 * s;
      this.text(st.feedback.text, 0, 0, 64 * s, '#fff', 'center', DISPLAY, 400);
      x.shadowBlur = 0;
      this.text(st.feedback.sub, 0, 46 * s, 18 * s, col, 'center', DISPLAY, 400);
      x.restore();
    }

    this.text('MOCKUP · Three.js r187 · WebGL · GLSL · Canvas2D · Vite', W / 2, H - 10 * s, 10 * s, 'rgba(255,255,255,0.35)', 'center', BODY, 500);
  }
}
