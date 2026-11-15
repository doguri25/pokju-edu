// Sunset sky: banded gradient, low sun with halo, fbm clouds lit from below, a few stars overhead
uniform vec3 uSunDir;
uniform float uTime;
uniform vec3 uSkyLow, uSkyMid, uSkyHigh;
varying vec3 vDir;
#include <noise>
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = mix(uSkyLow, uSkyMid, smoothstep(0.0, 0.22, h));
  col = mix(col, uSkyHigh, smoothstep(0.18, 0.75, h));
  col = mix(col, uSkyLow * 0.6, smoothstep(0.0, -0.08, h));

  float s = max(dot(d, uSunDir), 0.0);
  col += vec3(1.0, 0.55, 0.28) * (pow(s, 8.0) * 0.35 + pow(s, 90.0) * 1.4);
  col += vec3(1.0, 0.85, 0.6) * smoothstep(0.9993, 0.9997, s) * 12.0;

  vec2 cuv = d.xz / (h + 0.12);
  float c = fbm(cuv * 0.9 + vec2(uTime * 0.006, 0.0));
  float cm = smoothstep(0.48, 0.78, c) * smoothstep(0.015, 0.2, h) * (1.0 - smoothstep(0.55, 0.9, h));
  vec3 cloudLit = mix(vec3(1.0, 0.5, 0.32), vec3(0.32, 0.16, 0.32), smoothstep(0.02, 0.4, h));
  cloudLit += vec3(1.0, 0.6, 0.3) * pow(s, 4.0) * 0.8;
  col = mix(col, cloudLit, cm * 0.85);

  float st = step(0.9975, hash12(floor(d.xz / (h + 0.05) * 160.0))) * smoothstep(0.35, 0.7, h);
  col += vec3(0.9, 0.95, 1.0) * st * (0.6 + 0.4 * sin(uTime * 3.0 + hash12(floor(d.xz * 300.0)) * 6.28));
  gl_FragColor = vec4(col, 1.0);
}
