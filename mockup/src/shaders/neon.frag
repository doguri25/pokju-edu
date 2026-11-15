// Gate frame tubes: HDR colour so the bloom pass makes them glow, with a scanline running up the tube
uniform vec3 uColor;
uniform float uTime;
uniform float uPulse;
varying vec2 vUv;
void main() {
  float scan = 0.65 + 0.35 * sin(vUv.y * 30.0 - uTime * 9.0);
  float edge = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x);
  gl_FragColor = vec4(uColor * (2.2 + uPulse * 3.0) * scan * (0.6 + 0.4 * edge), 1.0);
}
