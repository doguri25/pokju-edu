// Fireball colour: a fine flame grain on top of the boiling shape; hotter where both are high and where the ball faces the camera.
// It burns out from the inside as uT goes 0 -> 1: white-yellow, orange, deep red, then a sooty shell that thins away. Soft at the rim.
// The hot part is brighter than white so the bloom picks it up.
uniform float uT; uniform float uHeat; uniform float uNight;
varying float vN; varying vec3 vNrm; varying vec3 vView; varying vec3 vPos;
float h3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float n3(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(h3(i + vec3(0.0, 1.0, 0.0)), h3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(h3(i + vec3(0.0, 0.0, 1.0)), h3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(h3(i + vec3(0.0, 1.0, 1.0)), h3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}
void main() {
  float face = abs(dot(normalize(vNrm), normalize(vView)));
  float grain = n3(vPos) * 0.6 + n3(vPos * 2.3 + 5.1) * 0.4;
  float nd = smoothstep(0.25, 0.75, vN) * 0.6 + grain * 0.4;
  float heat = clamp((nd - 0.5) * 2.4 + face * 0.4 + 0.5 - uT * 1.7, 0.0, 1.0) * uHeat;
  vec3 soot = mix(vec3(0.17, 0.15, 0.14), vec3(0.05, 0.05, 0.06), uNight);
  vec3 c = mix(soot, vec3(0.9, 0.14, 0.03), smoothstep(0.04, 0.28, heat));
  c = mix(c, vec3(2.1, 0.65, 0.1), smoothstep(0.28, 0.6, heat));
  c = mix(c, vec3(3.2, 2.2, 0.9), smoothstep(0.72, 0.97, heat));
  float a = smoothstep(uT * 1.05 - 0.12, uT * 1.05 + 0.12, nd + 0.12) * (1.0 - smoothstep(0.72, 1.0, uT));
  a *= smoothstep(0.02, 0.4, face) * (0.6 + 0.4 * smoothstep(0.0, 0.25, heat));
  a *= 0.55 + 0.45 * smoothstep(0.05, 0.3, heat);                       // the sooty shell never turns opaque
  a *= smoothstep(3.0, 11.0, length(vView));                            // close to the camera it thins away: a blast next to the car must not black out the screen
  if (a < 0.01) discard;
  gl_FragColor = vec4(c, a);
}
