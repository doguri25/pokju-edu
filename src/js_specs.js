  /* ---------- real specifications: each car's movement is computed from the published figures of the car it is modelled on ----------
     ps/kw = peak power, nm = peak torque, kg = kerb weight, top = top speed in km/h (est: true when the maker publishes none and the figure is an estimate),
     t100 = 0-100 km/h in seconds (null when no figure was found), L/W/H/wb in metres, cda = drag area in square metres (estimated by body type) */
  var SPECS = {
    laser: { ps: 76, kw: 56, nm: 95, kg: 1085, top: 145, est: true, t100: 19.2, drive: '전륜', fuel: 'gas', cls: 'car', L: 3.595, W: 1.595, H: 1.7, wb: 2.52, cda: 0.84 },
    dolphin: { ps: 95, kw: 70, nm: 180, kg: 1520, top: 150, t100: 11.8, drive: '전륜', fuel: 'ev', cls: 'car', L: 4.29, W: 1.77, H: 1.57, wb: 2.7, cda: 0.66 },
    grand: { ps: 198, kw: 146, nm: 248, kg: 1620, top: 210, est: true, t100: 9.7, drive: '전륜', fuel: 'gas', cls: 'car', L: 5.05, W: 1.88, H: 1.46, wb: 2.895, cda: 0.62 },
    eclass: { ps: 258, kw: 190, nm: 400, kg: 1905, top: 250, t100: 6.1, drive: '사륜', fuel: 'gas', turbo: true, cls: 'car', L: 4.955, W: 1.88, H: 1.475, wb: 2.96, cda: 0.56 },
    atto: { ps: 204, kw: 150, nm: 310, kg: 1750, top: 160, t100: 7.3, drive: '전륜', fuel: 'ev', cls: 'suv', L: 4.455, W: 1.875, H: 1.615, wb: 2.72, cda: 0.72 },
    ionic: { ps: 229, kw: 168, nm: 350, kg: 2015, top: 185, t100: 7.5, drive: '후륜', fuel: 'ev', cls: 'suv', L: 4.655, W: 1.89, H: 1.605, wb: 3.0, cda: 0.72 },
    seal: { ps: 313, kw: 230, nm: 360, kg: 2085, top: 180, t100: 5.9, drive: '후륜', fuel: 'ev', cls: 'car', L: 4.8, W: 1.875, H: 1.46, wb: 2.92, cda: 0.5 },
    sealion: { ps: 313, kw: 230, nm: 380, kg: 2225, top: 215, t100: 6.7, drive: '후륜', fuel: 'ev', cls: 'suv', L: 4.83, W: 1.925, H: 1.62, wb: 2.93, cda: 0.7 },
    modely: { ps: 299, kw: 220, nm: 420, kg: 1920, top: 201, t100: 5.9, drive: '후륜', fuel: 'ev', cls: 'suv', L: 4.79, W: 1.92, H: 1.625, wb: 2.89, cda: 0.6 },
    cyber: { ps: 612, kw: 450, nm: 1008, kg: 2990, top: 180, t100: 4.3, drive: '사륜', fuel: 'ev', cls: 'pickup', rws: true, L: 5.685, W: 2.03, H: 1.795, wb: 3.635, cda: 1.05 },
    tivoli: { ps: 163, kw: 120, nm: 260, kg: 1360, top: 190, est: true, t100: null, drive: '전륜', fuel: 'gas', turbo: true, cls: 'suv', L: 4.225, W: 1.81, H: 1.615, wb: 2.6, cda: 0.76 },
    torres: { ps: 170, kw: 125, nm: 300, kg: 1520, top: 190, est: true, t100: 9.8, drive: '전륜', fuel: 'gas', turbo: true, cls: 'suv', L: 4.705, W: 1.89, H: 1.72, wb: 2.68, cda: 0.86 },
    torresevx: { ps: 207, kw: 152, nm: 339, kg: 1960, top: 175, est: true, t100: 8.1, drive: '전륜', fuel: 'ev', cls: 'suv', L: 4.715, W: 1.89, H: 1.745, wb: 2.68, cda: 0.84 },
    actyon: { ps: 170, kw: 125, nm: 300, kg: 1590, top: 191, est: true, t100: 10.8, drive: '전륜', fuel: 'gas', turbo: true, cls: 'suv', L: 4.74, W: 1.91, H: 1.68, wb: 2.68, cda: 0.8 },
    rexton: { ps: 202, kw: 149, nm: 441, kg: 2175, top: 184, est: true, t100: 11, t100est: true, drive: '사륜', fuel: 'diesel', turbo: true, cls: 'frame', L: 4.85, W: 1.96, H: 1.825, wb: 2.865, cda: 1.0 },
    musso: { ps: 202, kw: 149, nm: 441, kg: 2100, top: 172, est: true, t100: null, drive: '사륜', fuel: 'diesel', turbo: true, cls: 'pickup', L: 5.15, W: 1.95, H: 1.865, wb: 3.1, cda: 1.08 },
    mussoev: { ps: 413, kw: 304, nm: 636, kg: 2275, top: 177, est: true, t100: 8.0, drive: '사륜', fuel: 'ev', cls: 'pickup', L: 5.16, W: 1.92, H: 1.74, wb: 3.15, cda: 0.95 },
    porter: { ps: 159, kw: 117, nm: 294, kg: 1700, top: 140, est: true, t100: null, drive: '후륜', fuel: 'lpg', turbo: true, cls: 'truck', L: 5.1, W: 1.74, H: 1.97, wb: 2.64, cda: 1.5 },
    cannonball: { ps: 245, kw: 180, nm: 367, kg: 2165, top: 190, est: true, t100: 8.9, drive: '전륜', fuel: 'hev', cls: 'van', L: 5.155, W: 1.995, H: 1.785, wb: 3.09, cda: 0.98 },
    tow: { ps: 170, kw: 125, nm: 608, kg: 4500, kgEst: true, top: 90, lim: true, t100: null, drive: '후륜', fuel: 'diesel', turbo: true, cls: 'truck', L: 6.72, W: 2.18, H: 2.36, wb: 3.85, cda: 3.2 },
    fire: { ps: 300, kw: 221, nm: 1079, kg: 12000, kgNote: '출동 총중량', top: 110, est: true, t100: null, drive: '후륜', fuel: 'diesel', turbo: true, cls: 'truck', L: 7.67, W: 2.42, H: 3.035, wb: 4.3, cda: 5.0 },
    avante: { ps: 123, kw: 90.5, nm: 154, kg: 1260, top: 195, est: true, t100: 10.7, drive: '전륜', fuel: 'gas', cls: 'car', L: 4.71, W: 1.825, H: 1.42, wb: 2.72, cda: 0.6 },
    g80: { ps: 304, kw: 224, nm: 422, kg: 1900, top: 250, t100: 6.3, drive: '사륜', fuel: 'gas', turbo: true, cls: 'car', L: 5.005, W: 1.925, H: 1.465, wb: 3.01, cda: 0.62 },
    ionicn: { ps: 609, kw: 448, nm: 740, kg: 2200, top: 260, t100: 3.5, drive: '사륜', fuel: 'ev', cls: 'car', L: 4.715, W: 1.94, H: 1.585, wb: 3.0, cda: 0.76 },
    ev3: { ps: 204, kw: 150, nm: 283, kg: 1835, top: 170, t100: 7.7, drive: '전륜', fuel: 'ev', cls: 'suv', L: 4.3, W: 1.85, H: 1.56, wb: 2.68, cda: 0.66 },
    ev9: { ps: 384, kw: 283, nm: 700, kg: 2620, top: 200, t100: 5.3, drive: '사륜', fuel: 'ev', cls: 'suv', L: 5.015, W: 1.98, H: 1.78, wb: 3.1, cda: 0.86 },
    santafe: { ps: 281, kw: 207, nm: 422, kg: 1860, top: 210, est: true, t100: 7.0, t100est: true, drive: '사륜', fuel: 'gas', turbo: true, cls: 'suv', L: 4.83, W: 1.9, H: 1.72, wb: 2.815, cda: 0.87 },
    police: { ps: 160, kw: 118, nm: 196, kg: 1475, kgNote: '순찰 장비 제외', top: 200, est: true, t100: 10.5, t100est: true, drive: '전륜', fuel: 'gas', cls: 'car', L: 4.91, W: 1.86, H: 1.445, wb: 2.84, cda: 0.62 },
    ambul: { ps: 177, kw: 130, nm: 431, kg: 2450, kgEst: true, top: 175, est: true, t100: 13.5, t100est: true, drive: '전륜', fuel: 'diesel', turbo: true, cls: 'van', L: 5.255, W: 1.995, H: 2.12, wb: 3.275, cda: 1.25 },
    sorento: { ps: 235, kw: 173, nm: 367, kg: 1825, top: 190, est: true, t100: 8.7, t100est: true, drive: '전륜', fuel: 'hev', turbo: true, cls: 'suv', L: 4.815, W: 1.9, H: 1.695, wb: 2.815, cda: 0.84 },
    palisade: { ps: 281, kw: 207, nm: 422, kg: 1985, top: 210, est: true, t100: 8.0, t100est: true, drive: '전륜', fuel: 'gas', turbo: true, cls: 'suv', L: 5.06, W: 1.98, H: 1.805, wb: 2.97, cda: 0.95 },
    casper: { ps: 115, kw: 84.5, nm: 147, kg: 1355, top: 150, t100: 10.6, drive: '전륜', fuel: 'ev', cls: 'car', L: 3.825, W: 1.61, H: 1.575, wb: 2.58, cda: 0.7 },
    bmw5: { ps: 190, kw: 140, nm: 310, kg: 1835, top: 230, t100: 8.1, drive: '후륜', fuel: 'gas', turbo: true, cls: 'car', L: 5.06, W: 1.9, H: 1.515, wb: 2.995, cda: 0.56 },
    gv80: { ps: 304, kw: 224, nm: 422, kg: 2145, top: 237, est: true, t100: 6.9, drive: '사륜', fuel: 'gas', turbo: true, cls: 'suv', L: 4.94, W: 1.975, H: 1.715, wb: 2.955, cda: 0.9 },
    tasman: { ps: 281, kw: 207, nm: 421, kg: 2165, top: 185, t100: 8.5, drive: '사륜', fuel: 'gas', turbo: true, cls: 'pickup', L: 5.41, W: 1.93, H: 1.87, wb: 3.27, cda: 1.1 },
    pv5: { ps: 163, kw: 120, nm: 250, kg: 1895, top: 135, t100: 12, t100est: true, drive: '전륜', fuel: 'ev', cls: 'van', L: 4.695, W: 1.895, H: 1.905, wb: 2.995, cda: 1.1 },
    p911: { ps: 394, kw: 290, nm: 450, kg: 1520, top: 294, t100: 4.1, drive: '후륜', fuel: 'gas', turbo: true, cls: 'car', L: 4.542, W: 1.852, H: 1.298, wb: 2.45, cda: 0.58 },
    bus: { ps: 326, kw: 240, nm: 1000, kg: 12140, top: 85, est: true, t100: null, drive: '후륜', fuel: 'ev', cls: 'truck', L: 10.995, W: 2.49, H: 3.4, wb: 5.4, cda: 5.6 },
    /* v13: ten more. Figures from maker specification pages where published; est = estimate. 이브 6 and 아이고닉 6 top speed and 0-100 are the European figures for the same powertrain */
    k5: { ps: 160, kw: 118, nm: 196, kg: 1435, top: 205, est: true, t100: 10.5, t100est: true, drive: '전륜', fuel: 'gas', cls: 'car', L: 4.905, W: 1.86, H: 1.445, wb: 2.85, cda: 0.6 },
    sonata: { ps: 290, kw: 213, nm: 422, kg: 1610, top: 250, est: true, t100: 6.2, drive: '전륜', fuel: 'gas', turbo: true, cls: 'car', L: 4.91, W: 1.86, H: 1.445, wb: 2.84, cda: 0.6 },
    mustang: { ps: 493, kw: 363, nm: 567, kg: 1835, top: 250, est: true, t100: 4.9, t100est: true, drive: '후륜', fuel: 'gas', cls: 'car', L: 4.81, W: 1.915, H: 1.405, wb: 2.72, cda: 0.72 },
    ev6: { ps: 229, kw: 168, nm: 350, kg: 1985, top: 185, t100: 7.7, drive: '후륜', fuel: 'ev', cls: 'car', L: 4.695, W: 1.88, H: 1.55, wb: 2.9, cda: 0.7 },
    ioniq6: { ps: 229, kw: 168, nm: 350, kg: 1925, top: 185, t100: 7.4, drive: '후륜', fuel: 'ev', cls: 'car', L: 4.925, W: 1.88, H: 1.495, wb: 2.95, cda: 0.5 },
    model3: { ps: 283, kw: 208, nm: 420, kg: 1760, top: 201, t100: 6.2, drive: '후륜', fuel: 'ev', cls: 'car', L: 4.72, W: 1.85, H: 1.44, wb: 2.875, cda: 0.5 },
    sportage: { ps: 180, kw: 132, nm: 265, kg: 1585, top: 201, est: true, t100: 8.8, t100est: true, drive: '전륜', fuel: 'gas', turbo: true, cls: 'suv', L: 4.685, W: 1.865, H: 1.66, wb: 2.755, cda: 0.82 },
    tucson: { ps: 235, kw: 173, nm: 367, kg: 1645, top: 193, est: true, t100: 8.0, t100est: true, drive: '전륜', fuel: 'hev', turbo: true, cls: 'suv', L: 4.64, W: 1.865, H: 1.665, wb: 2.755, cda: 0.8 },
    gv70: { ps: 304, kw: 224, nm: 422, kg: 1930, top: 240, est: true, t100: 6.1, drive: '사륜', fuel: 'gas', turbo: true, cls: 'suv', L: 4.715, W: 1.91, H: 1.63, wb: 2.875, cda: 0.86 },
    carni: { ps: 294, kw: 216, nm: 355, kg: 2080, top: 200, est: true, t100: 8.0, t100est: true, drive: '전륜', fuel: 'gas', cls: 'van', L: 5.155, W: 1.995, H: 1.775, wb: 3.09, cda: 0.98 },
    /* v14: kei cars. Power, torque, weight and size are the makers' figures; none of them publishes a top speed, so those are estimates. 스파클 is the last 스파크, no longer on sale */
    morning: { ps: 76, kw: 56, nm: 95, kg: 975, top: 155, est: true, t100: 15.5, t100est: true, drive: '전륜', fuel: 'gas', cls: 'car', L: 3.595, W: 1.595, H: 1.485, wb: 2.4, cda: 0.68 },
    spark: { ps: 75, kw: 55, nm: 95, kg: 910, top: 158, est: true, t100: 15.0, t100est: true, drive: '전륜', fuel: 'gas', cls: 'car', L: 3.595, W: 1.595, H: 1.485, wb: 2.385, cda: 0.66 },
    caspert: { ps: 100, kw: 74, nm: 172, kg: 1050, top: 165, est: true, t100: 12.5, t100est: true, drive: '전륜', fuel: 'gas', turbo: true, cls: 'suv', L: 3.595, W: 1.595, H: 1.575, wb: 2.4, cda: 0.74 },
    rayev: { ps: 87, kw: 64.3, nm: 147, kg: 1295, top: 140, est: true, t100: 12.3, drive: '전륜', fuel: 'ev', cls: 'car', L: 3.595, W: 1.595, H: 1.71, wb: 2.52, cda: 0.84 }
  };
  var ACC_K = 1.8, GRAV = 9.8, V_FLOOR = 30 / 3.6, V_MIN = 50 / 3.6, FUEL_LABEL = { gas: '가솔린', lpg: 'LPG', diesel: '디젤', hev: '하이브리드', ev: '전기' };
  /* wheel force per kilogram: limited by torque (and tyre grip) at low speed, by power at high speed */
  function tractionAcc(c, v) { return Math.min(c.aT, c.pw / Math.max(v, 5)); }
  function deriveCar(c, s) {
    var heavy = s.kg > 4000, ev = s.fuel === 'ev', awd = s.drive === '사륜', ssf = s.W / s.H;
    c.spec = s; c.vmin = V_MIN; c.vmax = s.top / 3.6;
    c.aT = Math.min(heavy ? 3 : (awd ? 8 : (s.drive === '후륜' ? 6 : 5.2)), (heavy ? 16 : (ev ? 27 : 23.5)) * s.nm / s.kg);
    c.pw = 0.85 * s.kw * 1000 / s.kg;
    c.drag = 0.6 * s.cda / s.kg;
    c.brake = (heavy ? 5.5 : (s.kg > 2500 ? 7.5 : 9)) * (c.brakeMul || 1);
    c.tau = ev ? (heavy ? 0.35 : 0.12) : (s.fuel === 'hev' ? 0.25 : (s.fuel === 'diesel' ? (heavy ? 0.9 : 0.6) : (s.turbo ? 0.4 : 0.55)));
    var agi = 10 - (s.kg - 900) / 450 - (s.wb - 2.4) * 3 - Math.max(0, 1.1 - ssf) * 4 + { car: 0.8, suv: 0, van: -0.8, frame: -1, pickup: -1, truck: -2 }[s.cls] + (s.rws ? 2.5 : 0);
    var stab = 10 * (ssf - 0.75) / 0.6 + Math.min(1.2, (s.wb - 2.6) * 2.5) + (awd ? 1 : 0) + (ev && !heavy ? 0.8 : 0) - Math.max(0, s.kg - 2500) / 1500 - (s.cls === 'truck' ? 1 : 0);
    c.agility = Math.round(clamp(agi, 1, 10) * 10) / 10; c.stability = Math.round(clamp(stab, 1, 10) * 10) / 10;
    c.lat = 7 + c.agility; c.steerK = 3 + c.agility * 0.85; c.latDrop = 0.55 - c.stability * 0.05;
    c.rollK = 0.019 - c.stability * 0.0012; c.pitchK = (0.005 + (10 - c.stability) * 0.0013) * (ev ? 0.8 : 1);
    c.hw = s.W / 2 * 0.94; c.hl = s.L / 2; c.W = s.W;
    /* rough-road ability: body type and driven wheels decide how much a loose or slippery surface costs the car */
    c.rough = clamp({ car: 0, van: 0.2, suv: 0.45, frame: 0.7, pickup: 0.7, truck: 0.5 }[s.cls] + (awd ? 0.3 : 0), 0, 1);
    /* figures shown on the selection screen, measured with the same model the game runs */
    var st = { v: V_MIN, a: 0 }, t = 0;
    while (t < 90 && st.v < c.vmin + 0.9 * (c.vmax - c.vmin)) { advanceSpeed(c, st, c.vmax, 1 / 30, 1, 0); t += 1 / 30; }
    c.upTime = Math.round(t);
    st = { v: c.vmax, a: 0 }; t = 0;
    while (t < 60) { advanceSpeed(c, st, c.vmax, 1 / 30, 1, 0.1); t += 1 / 30; }
    c.climb = Math.round(st.v * 3.6);
  }
  function advanceSpeed(car, st, vt, dt, boostMul, slope, sf) {
    var gr = sf ? sf.grip : 1;
    if (sf && sf.cap < 1) vt = Math.min(vt, car.vmin + (car.vmax - car.vmin) * sf.cap);
    var v = st.v, trac = Math.min(car.aT * gr, car.pw / Math.max(v, 5)) * (boostMul || 1), res = 0.12 + car.drag * v * v + (sf ? sf.drag : 0), grav = GRAV * (slope || 0), err = vt - v;
    var thr = clamp((res + grav) / Math.max(0.05, trac) + err / 2.5, 0, 1), a = trac * thr - res - grav;
    if (err < -0.8) a -= car.brake * gr / ACC_K * Math.min(1, (-err - 0.8) / 4);
    st.use = thr; st.byTorque = car.aT < car.pw / Math.max(v, 5);
    st.a = lerp(st.a, a * ACC_K, 1 - Math.exp(-dt / car.tau));
    st.v = clamp(v + st.a * dt, V_FLOOR, car.vmax * 1.04);
  }
