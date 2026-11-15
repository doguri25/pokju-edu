// Canvas2D: every texture in the scene is drawn here at start-up, so the page loads no image files.
import * as THREE from 'three';

const DISPLAY = '"Black Han Sans", "Noto Sans KR", system-ui, sans-serif';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}
function tex(c, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function rnd(a, b) { return a + Math.random() * (b - a); }

// A building facade: the colour map (wall, frames, dark glass) and an emissive map with only the lit windows,
// so the bloom pass picks up windows and nothing else.
export function facade(seed = 0) {
  const W = 256, H = 512;
  const [c, x] = canvas(W, H);
  const [e, y] = canvas(W, H);
  const hue = [220, 205, 260, 15, 190][seed % 5];
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `hsl(${hue} 12% 16%)`); g.addColorStop(1, `hsl(${hue} 10% 9%)`);
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  y.fillStyle = '#000'; y.fillRect(0, 0, W, H);
  const cols = 6, rows = 16, mw = W / cols, mh = H / rows;
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
    const wx = k * mw + 5, wy = r * mh + 6, ww = mw - 10, wh = mh - 11;
    x.fillStyle = `hsl(${hue} 20% 7%)`; x.fillRect(wx, wy, ww, wh);
    x.fillStyle = 'rgba(255,255,255,0.05)'; x.fillRect(wx, wy, ww, 2);
    if (Math.random() < 0.3) {
      const warm = Math.random() < 0.75;
      const l = rnd(38, 62);
      const colr = warm ? `hsl(${rnd(28, 44)} 90% ${l}%)` : `hsl(${rnd(185, 210)} 70% ${l}%)`;
      x.fillStyle = colr; x.fillRect(wx, wy, ww, wh);
      y.fillStyle = colr; y.fillRect(wx, wy, ww, wh);
      // curtains and silhouettes so the windows do not look like flat stickers
      if (Math.random() < 0.4) { y.fillStyle = 'rgba(0,0,0,0.55)'; y.fillRect(wx, wy, ww * rnd(0.2, 0.5), wh); x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(wx, wy, ww * 0.3, wh); }
    }
  }
  // a vertical neon strip on some buildings
  if (seed % 3 === 0) {
    const nc = ['#ff2d95', '#22e1ff', '#ffb52e'][seed % 3 === 0 ? (seed / 3) % 3 | 0 : 0];
    x.fillStyle = nc; y.fillStyle = nc;
    x.fillRect(W - 10, 0, 6, H); y.fillRect(W - 10, 0, 6, H);
  }
  return { map: tex(c), emissive: tex(e) };
}

// A neon shop sign with glowing Hangul, for the walls along the road
export function neonSign(text, color) {
  const [c, x] = canvas(512, 160);
  x.fillStyle = 'rgba(10,8,18,0.92)';
  x.beginPath(); x.roundRect(6, 6, 500, 148, 22); x.fill();
  x.lineWidth = 6; x.strokeStyle = color; x.shadowColor = color; x.shadowBlur = 24; x.stroke();
  x.font = `400 92px ${DISPLAY}`; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (let i = 0; i < 3; i++) { x.shadowBlur = 30 - i * 10; x.fillStyle = i === 2 ? '#fff' : color; x.fillText(text, 256, 86); }
  return tex(c);
}

// The answer panel on a gate: a glossy coloured plate, white rim, big number with a soft drop shadow
export function gatePanel(text, color) {
  const [c, x] = canvas(512, 256);
  drawGatePanel(x, text, color);
  const texture = tex(c);
  return { texture, redraw: (t, col, dim) => { drawGatePanel(x, t, col, dim); texture.needsUpdate = true; } };
}
export function drawGatePanel(x, text, color, dim = false) {
  const W = 512, H = 256;
  x.clearRect(0, 0, W, H);
  x.globalAlpha = dim ? 0.35 : 1;
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, shade(color, 0.25)); g.addColorStop(0.55, color); g.addColorStop(1, shade(color, -0.35));
  x.fillStyle = g;
  x.beginPath(); x.roundRect(10, 10, W - 20, H - 20, 36); x.fill();
  x.lineWidth = 10; x.strokeStyle = 'rgba(255,255,255,0.95)'; x.stroke();
  const gl = x.createLinearGradient(0, 10, 0, H * 0.5);
  gl.addColorStop(0, 'rgba(255,255,255,0.45)'); gl.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gl; x.beginPath(); x.roundRect(22, 22, W - 44, H * 0.42, 26); x.fill();
  x.font = `400 168px ${DISPLAY}`; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.shadowColor = 'rgba(0,0,0,0.45)'; x.shadowBlur = 18; x.shadowOffsetY = 8;
  x.fillStyle = '#fff'; x.fillText(String(text), W / 2, H / 2 + 12);
  x.shadowColor = 'transparent'; x.shadowBlur = 0; x.shadowOffsetY = 0;
  x.globalAlpha = 1;
}
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.round(k >= 0 ? v + (255 - v) * k : v * (1 + k));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

// Soft round glow sprite, for lamps, beacons and sparks
export function glow() {
  const [c, x] = canvas(128, 128);
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  return tex(c, false);
}
