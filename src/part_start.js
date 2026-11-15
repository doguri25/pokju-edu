(function () {
  'use strict';
  var T = THREE;   /* the Three.js namespace, imported by the build (tools/build.mjs) */
  /* The game was written on Three.js r128 and converts its own colours (C() below), so automatic colour management stays off */
  T.ColorManagement.enabled = false;
  var $ = function (id) { return document.getElementById(id); };
  var cv = $('c');
  var renderer;
  /* Canvas2D roundRect arrived late on older iPads (iPadOS 15): the signs, gate panels and gauge draw with it at start-up */
  if (window.CanvasRenderingContext2D && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      var a = typeof r === 'number' ? r : (r && r.length ? +r[0] || 0 : 0);
      a = Math.max(0, Math.min(a, Math.abs(w) / 2, Math.abs(h) / 2));
      this.moveTo(x + a, y); this.arcTo(x + w, y, x + w, y + h, a); this.arcTo(x + w, y + h, x, y + h, a); this.arcTo(x, y + h, x, y, a); this.arcTo(x, y, x + w, y, a); this.closePath();
    };
  }
  /* can this device draw into half-float buffers? Then the picture is finished off screen (js_fx2.js), multisampled there, and the
     canvas itself needs no multisampling (that would only cost memory) */
  var HALF_RT = (function () {
    try {
      var g = document.createElement('canvas').getContext('webgl2'), ok = !!(g && (g.getExtension('EXT_color_buffer_half_float') || g.getExtension('EXT_color_buffer_float')));
      var l = g && g.getExtension('WEBGL_lose_context'); if (l) l.loseContext();
      return ok;
    } catch (e) { return false; }
  })();
  try {
    renderer = new T.WebGLRenderer({ canvas: cv, antialias: !HALF_RT, powerPreference: 'high-performance' });
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
  /* materials that reflect the sky's environment map (car paint, glass, metal, a wet road); js_fx2.js bakes the map and hands it out */
  var ENV_MATS = [];
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
