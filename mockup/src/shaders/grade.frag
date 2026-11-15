// Final look: speed-scaled chromatic aberration and radial blur at the edges, teal/orange grade,
// vignette, a colour flash on right/wrong answers, and fine film grain
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uSpeed;        // 0..1
uniform float uFlash;
uniform vec3 uFlashColor;
varying vec2 vUv;
float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  vec2 c = vUv - 0.5;
  float r = length(c);
  float ca = 0.0012 + uSpeed * 0.0045 * r;
  vec3 col = vec3(texture2D(tDiffuse, vUv - c * ca).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv + c * ca).b);
  vec3 blur = vec3(0.0);
  for (int i = 0; i < 8; i++) blur += texture2D(tDiffuse, vUv - c * (float(i) / 8.0) * 0.045 * uSpeed).rgb;
  col = mix(col, blur / 8.0, smoothstep(0.28, 0.72, r) * uSpeed);
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(col * vec3(0.9, 1.0, 1.1), col * vec3(1.1, 1.0, 0.88), smoothstep(0.02, 0.5, l));
  col *= 1.0 - smoothstep(0.42, 0.95, r) * 0.6;
  col += uFlashColor * uFlash * (0.15 + r * 0.9);
  col += (h(vUv * 911.0 + fract(uTime) * 37.0) - 0.5) * 0.018;
  gl_FragColor = vec4(col, 1.0);
}
