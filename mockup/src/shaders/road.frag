// Wet asphalt after rain at sunset: procedural grain, lane paint, sky and street-lamp reflections,
// the car's headlight pool and contact shadow. The world scrolls under a car that stays at z = 0.
uniform float uTime;
uniform float uOffset;      // distance travelled
uniform vec2 uCar;          // car x, z
uniform vec3 uFog;
uniform float uFogNear, uFogFar;
uniform vec3 uSkyLow, uSkyHigh;
varying vec3 vWorld;
#include <noise>

float band(float x, float c, float w) { return 1.0 - smoothstep(w * 0.6, w, abs(x - c)); }

void main() {
  float x = vWorld.x;
  float p = vWorld.z - uOffset;                 // road-space coordinate, fixed to the asphalt
  float ax = abs(x);

  // base surfaces: asphalt, shoulder, kerb and pavement
  float grain = fbm(vec2(x * 4.0, p * 4.0));
  float blotch = fbm(vec2(x * 0.12, p * 0.035));
  vec3 asphalt = vec3(0.032, 0.034, 0.042) * (0.75 + 0.5 * grain) * (0.85 + 0.3 * blotch);
  vec3 shoulder = vec3(0.05, 0.05, 0.058) * (0.8 + 0.4 * grain);
  vec3 kerb = mix(vec3(0.35, 0.33, 0.32), vec3(0.6, 0.12, 0.1), step(0.5, fract(p / 2.0)));
  vec3 pave = vec3(0.12, 0.115, 0.12) * (0.8 + 0.3 * vnoise(vec2(floor(x * 1.2), floor(p * 1.2))));
  vec3 col = ax < 8.0 ? asphalt : (ax < 9.6 ? shoulder : (ax < 10.0 ? kerb : pave));

  // lane paint: dashed lines between lanes, solid edge lines
  float dash = step(fract(p / 9.0), 0.55);
  float paint = 0.0;
  paint += band(x, -4.0, 0.11) * dash + band(x, 4.0, 0.11) * dash;
  paint += band(x, -0.12, 0.08) + band(x, 0.12, 0.08);                   // double centre line
  paint += band(ax, 7.85, 0.13);
  vec3 paintCol = mix(vec3(0.85), vec3(0.95, 0.68, 0.12), band(ax, 0.12, 0.2));
  col = mix(col, paintCol * (0.75 + 0.25 * grain), clamp(paint, 0.0, 1.0));

  // puddles: darker, glossier patches where the wet reflection is strongest
  float wet = smoothstep(0.52, 0.68, fbm(vec2(x * 0.25, p * 0.08) + 3.0)) * step(ax, 9.6);
  vec3 V = normalize(vWorld - cameraPosition);
  float fres = pow(1.0 - abs(V.y), 4.0);
  vec3 skyRefl = mix(uSkyLow, uSkyHigh, clamp(abs(V.y) * 3.0, 0.0, 1.0));
  col = mix(col, col * 0.55, wet * 0.6);
  col += skyRefl * fres * (0.18 + 0.55 * wet);

  // street lamps every 30 m on both sides: their light pools and long streaked reflections
  float lp = mod(p, 30.0) - 15.0;
  for (int s = -1; s <= 1; s += 2) {
    float lx = float(s) * 10.6;
    float pool = exp(-pow((x - lx * 0.92) / 3.2, 2.0) - pow(lp / 6.0, 2.0));
    float streak = exp(-pow((x - lx * 0.8) / 0.9, 2.0)) * exp(-pow(lp / 14.0, 2.0)) * (0.3 + 0.9 * wet);
    col += vec3(1.0, 0.58, 0.25) * (pool * 0.35 + streak * 0.5);
  }

  // headlight pool ahead of the car and a warm red wash behind it
  float dx = x - uCar.x, dz = vWorld.z - uCar.y;
  float beam = 1.0 - smoothstep(0.5, 1.0, length(vec2(dx / (1.4 + max(-dz, 0.0) * 0.12), (dz + 11.0) / 10.0)));
  col += vec3(1.0, 0.95, 0.82) * beam * step(dz, -2.0) * (0.22 + 0.4 * wet);
  col += vec3(1.0, 0.08, 0.04) * exp(-pow(dx / 1.4, 2.0) - pow((dz - 3.2) / 1.2, 2.0)) * 0.5;
  col += vec3(0.1, 0.9, 1.0) * exp(-pow(dx / 1.5, 2.0) - pow(dz / 2.6, 2.0)) * 0.18;          // underglow
  col *= mix(0.25, 1.0, smoothstep(0.55, 1.15, length(vec2(dx / 1.25, dz / 2.4))));       // contact shadow

  // distance haze into the horizon colour
  float d = length(vWorld - cameraPosition);
  col = mix(col, uFog, smoothstep(uFogNear, uFogFar, d));
  gl_FragColor = vec4(col, 1.0);
}
