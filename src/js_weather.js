  /* ---------- weather: sky, light, visibility, the road surface, what falls from the sky, wind and thunder ---------- */
  var WEATHERS = {
    clear: { key: 'clear', name: '맑음', cloud: 0, wet: 0, cover: 0, fogN: 1, fogF: 1, rain: 0, snow: 0, wind: 0, feel: '시야가 멀고 노면이 말라 있다.' },
    rain: { key: 'rain', name: '비', cloud: 0.7, wet: 1, cover: 0, fogN: 0.6, fogF: 0.62, rain: 1, snow: 0, wind: 0.3, feel: '노면이 젖어 접지력이 떨어지고 차선에 물웅덩이가 생긴다. 시야가 줄어든다.' },
    storm: { key: 'storm', name: '폭우', cloud: 0.92, wet: 1, cover: 0, fogN: 0.42, fogF: 0.46, rain: 1.8, snow: 0, wind: 1, bolt: true, feel: '비가 퍼붓고 번개가 친다. 젖은 노면에 돌풍까지 불어 차가 옆으로 밀린다.' },
    snow: { key: 'snow', name: '눈', cloud: 0.6, wet: 0, cover: 0.85, fogN: 0.45, fogF: 0.5, rain: 0, snow: 1, wind: 0.4, feel: '눈이 쌓여 조향과 제동이 둔해지고 최고속도가 떨어진다.' },
    fog: { key: 'fog', name: '안개', cloud: 0.55, wet: 0, cover: 0, fogN: 0.12, fogF: 0.34, rain: 0, snow: 0, wind: 0, feel: '70 m 앞까지만 보인다. 적과 장애물이 늦게 나타난다.' }
  };
  var WEATHER_ORDER = ['clear', 'rain', 'storm', 'snow', 'fog'];
  var weather = WEATHERS.clear, snowCover = 0, envFogN = 80, envFogF = 230, envHemiI = 1, envSunI = 1, boltT = 6, boltF = 0, thunderT = 0;
  var gust = { v: 0, t: 0, next: 5, dir: 1 }, rainK = 0, snowK = 0, wipeT = 0;
  COL.dust = C(0xb89a74); COL.mud = C(0x5a4630); COL.snow = C(0xf4f8fb);
  function setWeather(key, now) {
    weather = WEATHERS[key] || WEATHERS.clear;
    if (now) { snowCover = Math.max(region.cover, weather.cover); wetK = weather.wet; rainK = weather.rain; snowK = weather.snow; }
    gust.v = 0; gust.t = 0; gust.next = rnd(3, 6); boltT = rnd(3, 7); boltF = 0; thunderT = 0;
  }
  /* once per frame, after the time-of-day preset has been mixed: sky, fog and lights for the weather, then the region's material colours */
  function envFrame(dt) {
    var W = weather, sky = scene.background, g, f;
    sky.copy(cur.sky);
    if (W.cloud) { g = sky.r * 0.3 + sky.g * 0.5 + sky.b * 0.2; tmpC.setRGB(g * 0.86, g * 0.9, g * 0.96); sky.lerp(tmpC, W.cloud); }
    f = boltF > 0 ? boltF * (0.6 + 0.4 * Math.sin(time * 70)) : 0;
    if (f > 0) { sky.r += f * 0.5; sky.g += f * 0.52; sky.b += f * 0.6; }
    scene.fog.color.copy(sky);
    if (snowCover > 0.01) { tmpC.copy(snowC).multiply(tintC); scene.fog.color.lerp(tmpC, snowCover * 0.55); }   /* over snow the haze is white, not sky blue */
    envFogN = cur.fogNear * W.fogN; envFogF = cur.fogFar * W.fogF; scene.fog.near = envFogN; scene.fog.far = envFogF;
    hemi.color.copy(cur.hemiSky); hemi.groundColor.copy(cur.hemiGround); envHemiI = cur.hemiI * (1 - 0.12 * W.cloud) + f * 1.8; hemi.intensity = envHemiI;
    sun.color.copy(cur.sun); envSunI = cur.sunI * (1 - 0.62 * W.cloud); sun.intensity = envSunI; sun.position.copy(cur.sunPos).add(sun.target.position);
    snowCover = lerp(snowCover, Math.max(region.cover, W.cover), 1 - Math.exp(-dt * 1.2));
    regionColors(dt, W.wet, snowCover);
  }

  /* rain is drawn as streaks along each drop's motion relative to the car, snow as soft points; both live in a box that travels with the car */
  var RAIN_N = 1100, rainPos = new Float32Array(RAIN_N * 6), rainP = new Float32Array(RAIN_N * 3), rainGeo = new T.BufferGeometry();
  rainGeo.setAttribute('position', new T.BufferAttribute(rainPos, 3));
  var rainMat = new T.LineBasicMaterial({ color: 0xdfe9f2, transparent: true, opacity: 0, depthWrite: false, fog: false });
  var rainMesh = new T.LineSegments(rainGeo, rainMat); rainMesh.frustumCulled = false; rainMesh.visible = false; scene.add(rainMesh);
  var SNOW_N = 1400, snowPos = new Float32Array(SNOW_N * 3), snowGeo = new T.BufferGeometry();
  snowGeo.setAttribute('position', new T.BufferAttribute(snowPos, 3));
  var snowMat = new T.PointsMaterial({ map: radialTex([[0, 1], [0.55, 0.9], [1, 0]]), color: 0xffffff, size: 0.36, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false, fog: false });
  var snowMesh = new T.Points(snowGeo, snowMat); snowMesh.frustumCulled = false; snowMesh.visible = false; scene.add(snowMesh);
  (function () {
    var i;
    for (i = 0; i < RAIN_N; i++) { rainP[i * 3] = rnd(-28, 28); rainP[i * 3 + 1] = rnd(0, 20); rainP[i * 3 + 2] = rnd(-85, 18); }
    for (i = 0; i < SNOW_N; i++) { snowPos[i * 3] = rnd(-28, 28); snowPos[i * 3 + 1] = rnd(0, 18); snowPos[i * 3 + 2] = rnd(-85, 18); }
  })();
  var wipers = [];
  (function () {
    var mat = std(0x0c0d10, 0.8);
    [0.02, 0.8].forEach(function (x) {
      var pv = new T.Group(); pv.position.set(x, -0.33, -1.0); pv.rotation.order = 'XYZ'; pv.rotation.x = 0.5;
      var arm = new T.Mesh(new T.BoxGeometry(0.009, 0.5, 0.009), mat); arm.position.y = 0.25; arm.frustumCulled = false; pv.add(arm);
      pv.visible = false; cockpit.add(pv); wipers.push(pv);
    });
  })();
  function updPrecip(dt, px) {
    var i, j, x, y, z, vx, vy, vz, L, n, open = 1 - tunK, a = 1 - Math.exp(-dt * 1.5), dim = 1 - 0.3 * cur.night;
    rainK = lerp(rainK, weather.rain, a); snowK = lerp(snowK, weather.snow, a);
    rainMat.opacity = Math.min(0.62, 0.42 * rainK) * open; rainMesh.visible = rainMat.opacity > 0.02;
    if (rainMesh.visible) {
      vx = gust.v * 0.9 + 2 * weather.wind; vy = -26; vz = veff; L = (1.0 + veff * 0.014) / Math.sqrt(vx * vx + vy * vy + vz * vz);
      n = Math.min(RAIN_N, Math.round(RAIN_N * rainK / 1.8 * fxK)); rainGeo.setDrawRange(0, n * 2); rainMat.color.setRGB(0.86 * dim, 0.92 * dim, dim);
      for (i = 0; i < n; i++) {
        j = i * 3; x = rainP[j] + vx * dt; y = rainP[j + 1] + vy * dt; z = rainP[j + 2] + vz * dt;
        if (y < 0) { y += 20; x = rnd(-28, 28); z = rnd(-85, 18); }
        if (z > 18) z -= 103;
        if (x > 28) x -= 56; else if (x < -28) x += 56;
        rainP[j] = x; rainP[j + 1] = y; rainP[j + 2] = z;
        j = i * 6; rainPos[j] = px + x; rainPos[j + 1] = y; rainPos[j + 2] = z; rainPos[j + 3] = px + x - vx * L; rainPos[j + 4] = y - vy * L; rainPos[j + 5] = z - vz * L;
      }
      rainGeo.attributes.position.needsUpdate = true;
    }
    snowMat.opacity = Math.min(0.95, snowK) * open; snowMesh.visible = snowMat.opacity > 0.02;
    if (snowMesh.visible) {
      snowGeo.setDrawRange(0, Math.round(SNOW_N * fxK)); snowMat.color.setRGB(dim, dim, dim); snowMesh.position.x = px; snowMat.size = 0.17 / Math.tan(camera.fov * Math.PI / 360);   /* point sprites ignore the field of view, so the size is corrected for it */
      vx = gust.v * 0.9 + 1.5 * weather.wind; vz = veff * 0.95;
      for (i = 0; i < SNOW_N; i++) {
        j = i * 3; x = snowPos[j] + (vx + Math.sin(time * 1.3 + i) * 0.9) * dt; y = snowPos[j + 1] - (2.2 + (i % 5) * 0.25) * dt; z = snowPos[j + 2] + vz * dt;
        if (y < 0) { y += 18; x = rnd(-28, 28); z = rnd(-85, 18); }
        if (z > 18) z -= 103;
        if (x > 28) x -= 56; else if (x < -28) x += 56;
        snowPos[j] = x; snowPos[j + 1] = y; snowPos[j + 2] = z;
      }
      snowGeo.attributes.position.needsUpdate = true;
    }
  }
  /* gusts: the coast always has a sea wind, storms bring their own; a gust pushes the car sideways for a second or two and tall cars catch more of it */
  function updGust(dt, px) {
    var k = Math.max(region.wind, weather.wind), i;
    if (k <= 0 || inTunnel(dist)) { gust.v = lerp(gust.v, 0, 1 - Math.exp(-dt * 3)); gust.t = 0; return; }
    gust.next -= dt;
    if (gust.t > 0) gust.t -= dt;
    else if (gust.next <= 0) { gust.t = rnd(1.2, 2.2); gust.next = gust.t + rnd(3.5, 7.5); gust.dir = region.wind && Math.random() < 0.75 ? 1 : (Math.random() < 0.5 ? -1 : 1); }
    gust.v = lerp(gust.v, gust.t > 0 ? gust.dir * 3.2 * k : 0, 1 - Math.exp(-dt * 2.5));
    if (Math.abs(gust.v) > 0.8 && Math.random() < dt * 34) {
      i = gust.v > 0 ? 1 : -1;
      spawnP('glow', px - i * rnd(2, 18), rnd(0.3, 3), rnd(-50, 6), i * rnd(20, 30), rnd(1, 3), veff * 0.5, 0.4, 0.3, 0.12, smokeColor(COL.white), 0.55, 0.3);
    }
  }
  function updWeather(dt, px, car, on) {
    var k, i;
    updGust(dt, px); updPrecip(dt, px);
    if (weather.bolt && tunK < 0.5) { boltT -= dt; if (boltT <= 0) { boltT = rnd(5, 11); boltF = 1; thunderT = rnd(0.35, 1.1); } }
    if (boltF > 0) boltF = Math.max(0, boltF - dt * 4.5);
    if (thunderT > 0) { thunderT -= dt; if (thunderT <= 0) sfx('thunder'); }
    k = cockpit.visible && (rainK > 0.1 || snowK > 0.1) && tunK < 0.6;
    if (k) { wipeT += dt / (rainK > 1.3 ? 0.75 : (rainK > 0.1 ? 1.25 : 1.7)); var ph = wipeT % 1, tri = ph < 0.5 ? ph * 2 : 2 - ph * 2; tri = tri * tri * (3 - 2 * tri); }
    for (i = 0; i < wipers.length; i++) { wipers[i].visible = !!k; if (k) wipers[i].rotation.z = 1.38 - 1.15 * tri; }
    k = on && !player.dead ? 1 : 0.35;
    ambience(Math.min(1, rainK / 1.8 + (rainK > 0 ? 0.35 : 0)) * (1 - 0.75 * tunK) * k, Math.min(1, Math.abs(gust.v) / 3.2 + 0.25 * snowK) * (1 - 0.8 * tunK) * k, on && !player.dead ? sfc.bump * clamp(veff / 30, 0, 1.2) : 0);
  }
  /* what the wheels throw up depends on the surface: dust, spray, snow or mud */
  function wheelSpray(dt, px, car) {
    var k = sfc.key, sp = clamp(veff / 30, 0.3, 1.5), col, a, s1, n;
    if (k === 'asphalt') { if (Math.random() < dt * 26) spawnP('smoke', px + pick([-0.8, 0.8]) * car.hw, 0.25, car.hl - 0.3, rnd(-0.5, 0.5), rnd(0.3, 1), 14, 0.45, 0.5, 1.7, smokeColor(COL.smokeL), 0.2 * (1 - 0.6 * cur.night), 1); return; }
    if (k === 'wet' || k === 'water') { col = COL.white; a = k === 'water' ? 0.5 : 0.28; s1 = k === 'water' ? 3.4 : 2.6; n = k === 'water' ? 150 : 60; }
    else if (k === 'snow' || k === 'ice') { col = COL.snow; a = 0.4; s1 = 2.3; n = 46; }
    else if (k === 'mud' || k === 'wetdirt') { col = COL.mud; a = 0.55; s1 = 1.7; n = 70; }
    else { col = COL.dust; a = 0.4; s1 = 3.1; n = 55; }
    if (Math.random() < dt * n * sp) spawnP('smoke', px + pick([-0.8, 0.8]) * car.hw, 0.3, car.hl - 0.2, rnd(-1.4, 1.4), rnd(0.6, 2.4), veff * 0.55, 0.65, 0.6, s1, smokeColor(col), a, 0.8);
  }

