// Fireball (graphics upgrade 3): a ball whose surface boils. Written with three.js chunks so the hill bending in js_hill.js applies.
#include <common>
uniform float uT; uniform float uSeed;
varying float vN; varying vec3 vNrm; varying vec3 vView; varying vec3 vPos;
float h3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float n3(vec3 x) {
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(h3(i + vec3(0.0, 1.0, 0.0)), h3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(h3(i + vec3(0.0, 0.0, 1.0)), h3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(h3(i + vec3(0.0, 1.0, 1.0)), h3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}
float fb3(vec3 p) { return n3(p) * 0.55 + n3(p * 2.13 + 3.7) * 0.3 + n3(p * 4.31 + 7.1) * 0.15; }
void main() {
  float n = fb3(position * 1.7 + vec3(uSeed, -uT * 3.0, uSeed * 0.5));
  vN = n; vPos = position * 3.1 + vec3(uSeed * 1.7, -uT * 4.0, 0.0);
  vec3 transformed = position * (0.72 + 0.62 * n + 0.15 * uT);
  vNrm = normalize(normalMatrix * normal);
  #include <project_vertex>
  vView = -mvPosition.xyz;
}
