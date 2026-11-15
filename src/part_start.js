(function () {
  'use strict';
  var T = THREE;   /* the Three.js namespace, imported by the build (tools/build.mjs) */
  /* The game was written on Three.js r128 and converts its own colours (C() below), so automatic colour management stays off */
  T.ColorManagement.enabled = false;
  var $ = function (id) { return document.getElementById(id); };
  var cv = $('c');
  var renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
  } catch (e) {
    $('err').hidden = false; $('menu').hidden = true;
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFShadowMap;   /* r187 removed the soft variant */
  /* r155+ dropped the old light units: lights read about π times dimmer and point lights fall off by an inverse power of distance.
     The r128 fall-off is put back into the light shader, and every light the game makes goes through legacy() so it is scaled back by π while a frame renders */
  (function () {
    var src = T.ShaderChunk.lights_pars_begin, a = src.indexOf('float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );'), b = src.indexOf('return distanceFalloff;', a);
    if (a < 0 || b < 0) { console.warn('legacy light fall-off: shader chunk not found'); return; }
    T.ShaderChunk.lights_pars_begin = src.slice(0, a) + 'if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );\n\treturn 1.0;' + src.slice(b + 'return distanceFalloff;'.length);
  })();
  var LEGACY_LIGHTS = [];
  function legacy(l) { LEGACY_LIGHTS.push(l); return l; }
  var rawRender = renderer.render.bind(renderer);
  renderer.render = function (s, c) {
    var i, n = LEGACY_LIGHTS.length;
    for (i = 0; i < n; i++) LEGACY_LIGHTS[i].intensity *= Math.PI;
    try { rawRender(s, c); } finally { for (i = 0; i < n; i++) LEGACY_LIGHTS[i].intensity /= Math.PI; }
  };

  var scene = new T.Scene();
  scene.background = new T.Color(0x9fd3f2);
  scene.fog = new T.Fog(0x9fd3f2, 70, 210);
  var camera = new T.PerspectiveCamera(55, 1, 0.5, 700);

  function C(hex) { return new T.Color(hex).convertSRGBToLinear(); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  var lerp = T.MathUtils.lerp, clamp = T.MathUtils.clamp;
