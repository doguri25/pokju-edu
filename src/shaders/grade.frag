// Final look (learning edition graphics upgrade), before ACES tone mapping in OutputPass:
// chromatic aberration and radial blur at the edges when the car is very fast (nitro), a cool cast in the shadows at night
// and a warm one at dusk, a light vignette, a green or red flash on right and wrong answers, and fine grain.
uniform sampler2D tDiffuse;
uniform float uTime, uSpeed, uFlash, uNight, uDusk;
uniform vec3 uFlashColor;
varying vec2 vUv;
float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 c = vUv - 0.5;
  float r = length(c);
  float ca = uSpeed * 0.004 * r;
  vec3 col = vec3(texture2D(tDiffuse, vUv - c * ca).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv + c * ca).b);
  if (uSpeed > 0.01) {
    vec3 blur = vec3(0.0);
    for (int i = 0; i < 6; i++) blur += texture2D(tDiffuse, vUv - c * (float(i) / 6.0) * 0.04 * uSpeed).rgb;
    col = mix(col, blur / 6.0, smoothstep(0.3, 0.72, r) * uSpeed);
  }
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  vec3 night = mix(col * vec3(0.86, 0.98, 1.16), col * vec3(1.06, 1.0, 0.92), smoothstep(0.05, 0.6, l));
  vec3 dusk = mix(col * vec3(0.95, 0.96, 1.06), col * vec3(1.08, 1.0, 0.9), smoothstep(0.05, 0.6, l));
  col = mix(col, night, uNight * 0.8);
  col = mix(col, dusk, uDusk * 0.7);
  col = mix(vec3(l), col, 1.0 + 0.12 * uNight);                       // neon a little more saturated at night
  col *= 1.0 - smoothstep(0.5, 0.98, r) * (0.28 + 0.2 * uNight);
  col += uFlashColor * uFlash * (0.12 + r * 0.8);
  col += (h(vUv * 911.0 + fract(uTime) * 37.0) - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}
