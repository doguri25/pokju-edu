// Far skyline (graphics upgrade 2): a ring of silhouettes far beyond the road, drawn right after the sky dome.
// Everything is worked out from the direction alone: city towers with lit windows and blinking roof lights at night,
// rolling hills with a few village lights, or ridged mountains with snow caps. Farther layers fade into the sky's own colour
// (the same gradient and dusk band as sky.frag), so they read as distance; rain and fog hide them.
uniform vec3 uTop; uniform vec3 uHor; uniform vec3 uSun; uniform vec3 uSunCol; uniform vec3 uDark; uniform vec3 uNear;
uniform float uNight; uniform float uTime; uniform float uDim; uniform float uVis; uniform float uKind; uniform float uSea; uniform float uScale;
varying vec3 vDir;

const float TAU = 6.28318530718;
float h1(float n) { return fract(sin(n * 127.1 + 311.7) * 43758.5453); }
float h2(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
// value noise that wraps every `per` cells, so the ring has no seam (the mirror looks backwards)
float wn(float x, float per) { float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h1(mod(i, per)), h1(mod(i + 1.0, per)), f); }
float ridge(float u, float per) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * wn(u * per, per); per *= 2.0; a *= 0.5; } return v; }
float sharp(float u, float per) { float v = 0.0, a = 0.55; for (int i = 0; i < 4; i++) { v += a * (1.0 - abs(wn(u * per, per) * 2.0 - 1.0)); per *= 2.0; a *= 0.5; } return v; }

// the sky's colour at this elevation, as sky.frag paints it (gradient and the pink dusk band)
vec3 skyAt(vec3 d, float dusk) {
  float h = clamp(d.y, 0.0, 1.0);
  vec3 col = mix(uHor, uTop, pow(h, 0.5));
  col = mix(col, mix(col, vec3(0.86, 0.42, 0.55), 0.35), dusk * smoothstep(0.02, 0.18, h) * (1.0 - smoothstep(0.18, 0.5, h)));
  vec3 sunDir = normalize(uSun);
  float az = max(dot(normalize(d.xz + 1e-4), normalize(sunDir.xz + 1e-4)), 0.0);
  return col + uSunCol * dusk * pow(az, 3.0) * exp(-h * 9.0) * 0.55;
}

void main() {
  vec3 d = normalize(vDir);
  float e = vDir.y / length(vDir.xz);                 // tangent of the elevation: 0.1 is 43 m tall at the ring's 430 m
  float a = atan(vDir.x, -vDir.z);                    // 0 straight ahead, positive to the right
  float u = a / TAU + 0.5;
  float dusk = clamp(1.0 - abs(uNight - 0.35) / 0.3, 0.0, 1.0);
  vec3 sky = skyAt(d, dusk);
  float fw = max(fwidth(e), 1e-5);

  vec3 col = sky; float cov = 0.0; vec3 glow = vec3(0.0);
  // silhouettes: the far layer leans to the sky's colour, the near one to a darker tone (uNear: the land's shade)
  vec3 farC = mix(sky, uTop * 0.55 + uNear * 0.25, 0.32 + 0.38 * uNight);
  vec3 nearC = mix(sky, uNear * (1.0 - 0.55 * uNight) + uTop * 0.2, 0.58 + 0.3 * uNight);

  if (uKind < 1.5) {
    // city: two rows of towers; each cell is one building with its own height, lit windows after dark
    for (int L = 0; L < 2; L++) {
      float N = L == 0 ? 340.0 : 190.0;
      float x = u * N, i = floor(x), fx = fract(x);
      float r = h1(i + float(L) * 71.0), r2 = h1(i * 1.7 + 13.0 + float(L) * 29.0);
      float tall = (L == 0 ? 14.0 + 40.0 * r * r + step(0.94, r2) * 34.0 : 7.0 + 24.0 * r * r) * uScale;
      float gap = step(0.08, fx) * step(fx, 0.94) + step(0.3, r2) * (1.0 - step(0.08, fx) * step(fx, 0.94));   // narrow alleys between some buildings
      float hb = tall / 430.0;
      float inside = smoothstep(-fw, fw, hb - e) * step(0.0, e + 0.05) * gap;
      if (inside > 0.0) {
        vec3 c = L == 0 ? farC : nearC;
        // windows: storeys of 3.2 m, columns of 2.4 m; tiny windows fade to their average so they do not shimmer
        float wy = e * 430.0 / 3.2, wx = fx * (430.0 * TAU / N) / 2.4;
        float cell = step(0.3, fract(wy)) * step(fract(wy), 0.78) * step(0.28, fract(wx)) * step(fract(wx), 0.76);
        float lit = step(0.58 - 0.1 * r2, h2(vec2(floor(wx) + i * 17.0, floor(wy) + float(L) * 5.0)));
        float aa = clamp(fwidth(wy) * 1.6, 0.0, 1.0);
        float win = mix(cell * lit, 0.25, aa) * uNight * step(1.0, wy) * (L == 0 ? 0.75 : 1.0);
        vec3 wc = mix(vec3(1.25, 0.95, 0.55), vec3(0.75, 0.95, 1.3), step(0.8, h2(vec2(i, 3.0 + float(L)))));
        c = mix(c, wc, win * 0.85);
        // a red light blinks on the roof of the tallest towers
        float roof = step(0.94, r2) * float(L == 0) * step(abs(fx - 0.5), 0.07) * smoothstep(0.0025, 0.0, abs(e - hb - 0.002));
        c += vec3(2.2, 0.2, 0.15) * roof * step(0.5, fract(uTime * 0.7 + r)) * uNight;
        col = mix(col, c, inside); cov = max(cov, inside);
      }
    }
  } else {
    // land: a far and a near ridge; mountains are taller and sharper, with snow above the tree line
    bool peaks = uKind > 2.5;
    float hf = peaks ? (22.0 + 85.0 * sharp(u, 7.0)) : (12.0 + 46.0 * ridge(u, 6.0));
    float hn = peaks ? (12.0 + 52.0 * sharp(u + 0.37, 11.0)) : (6.0 + 26.0 * ridge(u + 0.21, 13.0));
    // by the sea the land sinks away on the water's side: uSea 1 for a sea on the left, -1 for one on the right (1.4)
    float sa = uSea < 0.0 ? -a : a;
    float land = mix(1.0, smoothstep(-0.25, 0.35, sa) * (1.0 - smoothstep(2.6, 3.1, abs(sa))), abs(uSea));
    hf *= uScale * land; hn *= uScale * land;
    float inF = smoothstep(-fw, fw, hf / 430.0 - e) * step(0.0, e + 0.05) * step(0.5, hf);
    float inN = smoothstep(-fw, fw, hn / 430.0 - e) * step(0.0, e + 0.05) * step(0.5, hn);
    vec3 cf = farC, cn = nearC;
    if (peaks) {
      float snowF = smoothstep(0.62, 0.7, e * 430.0 / (22.0 + 85.0) / uScale) + (uKind > 3.5 ? 0.55 : 0.0);
      float snowN = uKind > 3.5 ? 0.45 : 0.0;
      vec3 snow = mix(sky, vec3(0.92, 0.95, 1.0) * (1.0 - 0.7 * uNight), 0.55);
      cf = mix(cf, snow, clamp(snowF, 0.0, 1.0)); cn = mix(cn, snow, snowN);
    } else {
      // a few village lights at the foot of the near hills after dark
      float vx = u * 900.0, vi = floor(vx);
      float lamp = step(0.93, h1(vi + 5.0)) * step(abs(fract(vx) - 0.5), 0.18) * smoothstep(0.004, 0.0, abs(e - 0.006 - 0.01 * h1(vi)));
      glow += vec3(1.3, 1.0, 0.6) * lamp * uNight * inN;
    }
    col = mix(col, cf, inF);
    col = mix(col, cn, inN);
    cov = max(inF, inN);
  }
  // haze at the foot of the ring, then rain or fog hiding it all, then the tunnel's darkness, like the sky
  col = mix(col, sky, (1.0 - smoothstep(-0.01, 0.045, e)) * 0.55);
  col = mix(sky, col + glow, uVis);
  if (cov < 0.004) discard;
  gl_FragColor = vec4(mix(uDark, col, uDim), cov);
}
