  /* ---------- hills and split levels: the game logic stays flat; every vertex is lifted by the road's height at its distance, so the road, cars, props and effects all follow the slope ---------- */
  var HILL_N = 73, hillU = { value: new Float32Array(HILL_N) }, splitU = { value: new Float32Array(HILL_N) }, liftU = { value: 0 }, viewU = { value: camera.matrixWorldInverse }, hillSegs = [], hillOffset = 0;
  T.Material.prototype.onBeforeCompile = function (shader) {
    if (this.isMeshDepthMaterial || this.isMeshDistanceMaterial) return;   /* shadows are cast and looked up in the flat world, so they stay consistent */
    shader.uniforms.uHill = hillU; shader.uniforms.uSplit = splitU; shader.uniforms.uLift = liftU;
    var vs = shader.vertexShader.replace('#include <common>', '#include <common>\nuniform float uHill[' + HILL_N + '];\nfloat hillY( float z ) {\n\tfloat t = clamp( ( 60.0 - z ) / 5.0, 0.0, ' + (HILL_N - 1.001).toFixed(3) + ' );\n\tint i = int( floor( t ) );\n\treturn mix( uHill[ i ], uHill[ i + 1 ], t - float( i ) );\n}\nuniform float uSplit[' + HILL_N + '];\nuniform float uLift;\nfloat splitY( float x, float z ) {\n\tfloat t = clamp( ( 60.0 - z ) / 5.0, 0.0, ' + (HILL_N - 1.001).toFixed(3) + ' );\n\tint i = int( floor( t ) );\n\tfloat s = mix( uSplit[ i ], uSplit[ i + 1 ], t - float( i ) );\n\tfloat a = abs( s );\n\tif ( a < 0.001 ) return uLift;\n\tbool low = s > 0.0 ? ( x > 0.205 || x < -8.115 ) : ( x < -0.205 || x > 8.115 );\n\treturn low ? uLift - a : uLift;\n}');
    if (vs.indexOf('#include <project_vertex>') >= 0) {
      /* three.js uploads viewMatrix only for mesh materials; lines and points get the camera matrix as their own uniform, like sprites */
      var own = this.isLineBasicMaterial || this.isPointsMaterial || this.isLineDashedMaterial;
      if (own) { shader.uniforms.uView = viewU; vs = vs.replace('uniform float uHill', 'uniform mat4 uView;\nuniform float uHill'); }
      vs = vs.replace('#include <project_vertex>', 'vec4 mvPosition = modelMatrix * vec4( transformed, 1.0 );\nmvPosition.y += hillY( mvPosition.z ) + splitY( mvPosition.x, mvPosition.z );\nmvPosition = ' + (own ? 'uView' : 'viewMatrix') + ' * mvPosition;\ngl_Position = projectionMatrix * mvPosition;');
    } else {
      /* sprites: three.js does not upload viewMatrix for sprite materials, so the camera matrix is passed in as its own uniform */
      shader.uniforms.uView = viewU;
      vs = vs.replace('uniform float uHill', 'uniform mat4 uView;\nuniform float uHill');
      vs = vs.replace('vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );', 'vec4 mvPosition = modelMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );\nmvPosition.y += hillY( mvPosition.z ) + splitY( mvPosition.x, mvPosition.z );\nmvPosition = uView * mvPosition;');
    }
    shader.vertexShader = vs;
  };
  /* a slope segment rises (or falls) at grade g, easing in and out over `ramp` metres */
  function segSlope(s, d) {
    var t = d - s.d0, len = s.d1 - s.d0;
    if (t <= 0 || t >= len) return 0;
    return s.g * Math.min(1, t / s.ramp, (len - t) / s.ramp);
  }
  function segRise(s, d) {
    var len = s.d1 - s.d0, t = Math.max(0, Math.min(len, d - s.d0)), r = s.ramp, a, u;
    if (t < r) a = t * t / (2 * r);
    else if (t < len - r) a = r / 2 + (t - r);
    else { u = len - t; a = r / 2 + (len - 2 * r) + (r / 2 - u * u / (2 * r)); }
    return s.g * a;
  }
  function slopeAt(d) { for (var i = 0; i < hillSegs.length; i++) if (d > hillSegs[i].d0 && d < hillSegs[i].d1) return segSlope(hillSegs[i], d); return 0; }
  function heightAt(d) { var h = hillOffset; for (var i = 0; i < hillSegs.length; i++) h += segRise(hillSegs[i], d); return h; }
  function addSlope(d0, len, g) { hillSegs.push({ d0: d0, d1: d0 + len, g: g, ramp: Math.min(45, len / 2) }); }
  function updateHills(dist) {
    while (hillSegs.length && hillSegs[0].d1 < dist - 80) { hillOffset += segRise(hillSegs[0], hillSegs[0].d1); hillSegs.shift(); }
    var h0 = heightAt(dist), a = hillU.value;
    for (var k = 0; k < HILL_N; k++) a[k] = heightAt(dist - 60 + 5 * k) - h0;
  }
  function resetHills() { hillSegs.length = 0; hillOffset = 0; }
