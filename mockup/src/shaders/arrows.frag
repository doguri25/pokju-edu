// Chevrons painted with light on the lane in front of each gate, flowing towards it
uniform vec3 uColor;
uniform float uTime;
uniform float uFade;
varying vec2 vUv;
void main() {
  float y = vUv.y * 6.0 + uTime * 2.5;
  float chev = abs(fract(y - abs(vUv.x - 0.5) * 1.6) - 0.5);
  float a = smoothstep(0.18, 0.08, chev) * smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
  a *= smoothstep(0.0, 0.3, vUv.y) * uFade;
  gl_FragColor = vec4(uColor * 1.6 * a, a * 0.85);
}
