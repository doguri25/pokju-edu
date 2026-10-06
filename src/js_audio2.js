  /* ---------- sound: everything is synthesised, nothing is loaded; starts after the first click ---------- */
  var AC = null, master = null, noiseBuf = null, engOsc = null, engGain = null, engLP = null, muted = false, lastSfx = {};
  var musGain = null, musicOn = true, musMode = 'off', musStep = 0, musNext = 0, echoGain = null, probing = false;
  function audioInit() {
    if (AC) { if (AC.state === 'suspended') { try { AC.resume(); } catch (e) {} } return; }
    try {
      var Ctor = window.AudioContext || window.webkitAudioContext; if (!Ctor) return;
      AC = new Ctor();
      /* everything goes through one limiter so that several loud sounds at once cannot clip; a short feedback delay is mixed in underground */
      var lim = AC.createDynamicsCompressor(); lim.threshold.value = -14; lim.knee.value = 10; lim.ratio.value = 8; lim.attack.value = 0.003; lim.release.value = 0.18; lim.connect(AC.destination);
      master = AC.createGain(); master.gain.value = muted ? 0 : 0.8; master.connect(lim);
      var dl = AC.createDelay(0.5), fb = AC.createGain(); dl.delayTime.value = 0.085; fb.gain.value = 0.38;
      echoGain = AC.createGain(); echoGain.gain.value = 0;
      master.connect(echoGain); echoGain.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(lim);
      noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
      var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      engOsc = AC.createOscillator(); engOsc.type = 'sawtooth'; engOsc.frequency.value = 60;
      engLP = AC.createBiquadFilter(); engLP.type = 'lowpass'; engLP.frequency.value = 420;
      engGain = AC.createGain(); engGain.gain.value = 0;
      engOsc.connect(engLP); engLP.connect(engGain); engGain.connect(master); engOsc.start();
      musGain = AC.createGain(); musGain.gain.value = 0.42; musGain.connect(master);
    } catch (e) { AC = null; }
  }
  function setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : 0.8; }
  var sfxOn = true;   /* effects, engine and weather noise can be switched off on their own; the music has its own switch */
  function setEcho(k) { if (AC && echoGain) echoGain.gain.setTargetAtTime(0.5 * k, AC.currentTime, 0.15); }
  /* the engine note is a continuous tone: it has to be cut when the game is paused, and everything stops while the page is in the background */
  function engineOff() { if (AC && engGain) engGain.gain.setTargetAtTime(0, AC.currentTime, 0.05); ambience(0, 0, 0); }
  /* weather and road noise: three looping noise beds (rain, wind, tyres on a loose surface) whose levels follow the scene */
  var amb = null;
  function ambLoop(type, freq, q) {
    var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
    s.buffer = noiseBuf; s.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.value = 0;
    s.connect(f); f.connect(g); g.connect(master); s.start(0, Math.random() * 0.5);
    return { g: g, f: f };
  }
  function ambience(rain, wind, rumble) {
    if (!AC || !master || !noiseBuf) return;
    if (!amb) { if (!(rain || wind || rumble)) return; try { amb = { rain: ambLoop('highpass', 2400, 0.3), wind: ambLoop('bandpass', 420, 0.8), rum: ambLoop('lowpass', 170, 0.7) }; } catch (e) { amb = null; return; } }
    var t = AC.currentTime;
    if (!sfxOn) { rain = 0; wind = 0; rumble = 0; }
    amb.rain.g.gain.setTargetAtTime(rain * 0.055, t, 0.3);
    amb.wind.g.gain.setTargetAtTime(wind * 0.1, t, 0.35); amb.wind.f.frequency.setTargetAtTime(320 + wind * 420, t, 0.5);
    amb.rum.g.gain.setTargetAtTime(rumble * 0.2, t, 0.1);
  }
  document.addEventListener('visibilitychange', function () {
    if (!AC) return;
    try { if (document.hidden) AC.suspend(); else AC.resume(); } catch (e) {}
  });
  function tone(type, f0, f1, dur, vol) {
    var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function burst(dur, vol, freq, q, type) {
    var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(), t = AC.currentTime;
    s.buffer = noiseBuf; s.loop = true; f.type = type || 'bandpass'; f.frequency.setValueAtTime(freq, t); f.Q.value = q || 1;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }
  var SFX_GAP = { shot: 0.07, shell: 0.12, zap: 0.12, laser: 0.1, water: 0.14, flame: 0.16, hit: 0.06, boom: 0.09, pickup: 0.05, egun: 0.12, drop: 0.35, crash: 0.25, alarm: 1.1, gravel: 0.3, rocket: 0.3, chime: 2, splash: 0.4, thud: 0.07, thunder: 2, skid: 0.5, horn: 3, honk: 1.5, screech: 0.5 };
  function sfx(name, k) {
    if (!AC || muted || (!sfxOn && !probing) || (AC.state !== 'running' && !probing)) return;
    var now = AC.currentTime, gap = SFX_GAP[name] || 0;
    if (gap && lastSfx[name] !== undefined && now - lastSfx[name] < gap) return;
    lastSfx[name] = now;
    try {
      if (name === 'shot') burst(0.07, 0.16, 1800, 0.8);
      else if (name === 'shell') { burst(0.18, 0.3, 500, 0.7); tone('sine', 150, 50, 0.16, 0.25); }
      else if (name === 'zap') { tone('square', 1400, 240, 0.09, 0.08); burst(0.06, 0.08, 4200, 2); }
      else if (name === 'laser') tone('sawtooth', 1700, 600, 0.08, 0.1);
      else if (name === 'water') burst(0.16, 0.19, 900, 0.5);
      else if (name === 'flame') burst(0.2, 0.36, 520, 0.5, 'lowpass');
      else if (name === 'hit') burst(0.04, 0.15, 2600, 1.5);
      else if (name === 'boom') { var s = k || 1; burst(0.5 + 0.25 * s, Math.min(0.6, 0.3 * s), 240, 0.6, 'lowpass'); tone('sine', 120, 34, 0.4 + 0.15 * s, Math.min(0.5, 0.28 * s)); }
      else if (name === 'missile') burst(0.35, 0.14, 1200, 0.6);
      else if (name === 'skill') { tone('sawtooth', 220, 880, 0.3, 0.12); burst(0.3, 0.1, 1500, 0.6); }
      else if (name === 'pickup') tone('triangle', 880, 1760, 0.12, 0.12);
      else if (name === 'item') { tone('triangle', 660, 990, 0.12, 0.14); tone('triangle', 990, 1480, 0.2, 0.1); }
      else if (name === 'cycle') tone('square', 520, 780, 0.06, 0.08);
      else if (name === 'warn') { tone('square', 880, 880, 0.14, 0.1); setTimeout(function () { if (AC && !muted) tone('square', 880, 880, 0.14, 0.1); }, 220); }
      else if (name === 'hurt') { burst(0.2, 0.25, 300, 0.7, 'lowpass'); tone('sawtooth', 200, 70, 0.2, 0.14); }
      else if (name === 'click') tone('triangle', 620, 760, 0.05, 0.08);
      else if (name === 'win') { tone('triangle', 523, 523, 0.14, 0.14); setTimeout(function () { if (AC && !muted) tone('triangle', 784, 784, 0.3, 0.14); }, 150); }
      else if (name === 'fail') tone('sawtooth', 300, 60, 0.6, 0.16);
      else if (name === 'crash') { burst(0.28, 0.4, 320, 0.6, 'lowpass'); tone('square', 110, 40, 0.22, 0.2); burst(0.08, 0.2, 3200, 1.2); }
      else if (name === 'egun') burst(0.06, 0.2, 950, 1);
      else if (name === 'drop') tone('sine', 1500, 520, 0.55, 0.07);
      else if (name === 'rocket') { burst(0.4, 0.13, 700, 0.5); tone('sawtooth', 320, 110, 0.35, 0.07); }
      else if (name === 'dive') tone('sawtooth', 420, 1500, 0.7, 0.09);
      else if (name === 'go') { tone('triangle', 660, 660, 0.1, 0.14); setTimeout(function () { if (AC && !muted) tone('triangle', 990, 990, 0.22, 0.14); }, 120); }
      else if (name === 'alarm') tone('square', 520, 520, 0.09, 0.07);
      else if (name === 'gravel') burst(0.22, 0.12, 2400, 0.7, 'highpass');
      else if (name === 'chime') { tone('sine', 880, 880, 0.3, 0.09); setTimeout(function () { if (AC && !muted) tone('sine', 660, 660, 0.45, 0.09); }, 260); }
      else if (name === 'heal') { tone('triangle', 520, 780, 0.16, 0.13); setTimeout(function () { if (AC && !muted) tone('triangle', 780, 1170, 0.24, 0.12); }, 140); }
      else if (name === 'nitro') { burst(0.5, 0.16, 1800, 0.5); tone('sawtooth', 180, 720, 0.45, 0.09); }
      else if (name === 'record') { tone('triangle', 784, 784, 0.12, 0.14); setTimeout(function () { if (AC && !muted) tone('triangle', 988, 988, 0.12, 0.14); }, 120); setTimeout(function () { if (AC && !muted) tone('triangle', 1319, 1319, 0.4, 0.14); }, 240); }
      else if (name === 'siren') { tone('square', 660, 660, 0.22, 0.09); setTimeout(function () { if (AC && !muted) tone('square', 880, 880, 0.22, 0.09); }, 230); setTimeout(function () { if (AC && !muted) tone('square', 660, 660, 0.22, 0.09); }, 460); }
      else if (name === 'splash') { burst(0.32, 0.34, 1500, 0.4); burst(0.18, 0.2, 500, 0.6, 'lowpass'); }
      else if (name === 'thud') { tone('sine', 95, 42, 0.14, 0.34); burst(0.07, 0.14, 380, 0.7, 'lowpass'); }
      else if (name === 'honk') { tone('square', 415, 415, 0.16, 0.12); setTimeout(function () { if (AC && !muted && sfxOn) tone('square', 415, 415, 0.26, 0.12); }, 210); }
      else if (name === 'screech') { burst(0.4, 0.22, 2600, 6); burst(0.3, 0.12, 1700, 4); }
      else if (name === 'horn') { tone('sawtooth', 155, 150, 0.7, 0.2); tone('sawtooth', 196, 190, 0.7, 0.16); burst(0.5, 0.1, 300, 0.6, 'lowpass'); }
      else if (name === 'thunder') { burst(1.5, 0.5, 110, 0.5, 'lowpass'); tone('sine', 70, 30, 1.1, 0.32); burst(0.22, 0.22, 900, 0.5); }
      else if (name === 'skid') { burst(0.38, 0.5, 1900, 2.5); burst(0.3, 0.2, 3100, 3); }
      else if (name === 'buy') { tone('triangle', 700, 1050, 0.1, 0.12); tone('triangle', 1050, 1400, 0.18, 0.1); }
    } catch (e) {}
  }
  /* engine note follows the powertrain: an electric motor whines up smoothly with speed, a combustion engine climbs and drops through its gears */
  function engineSound(on, car, v, use) {
    if (!AC || !engGain) return;
    var t = AC.currentTime, s = car.spec, ev = s.fuel === 'ev', heavy = s.kg > 4000, f;
    if (ev) f = 110 + v * 6.5;
    else {
      var gears = heavy ? 6 : 7, span = car.vmax / gears * 1.12, gear = Math.min(gears - 1, Math.floor(v / span));
      f = (heavy ? 34 : (s.fuel === 'diesel' ? 42 : 52)) + (v - gear * span) / span * (heavy ? 30 : 55) + gear * 3;
    }
    if (engOsc.type !== (ev ? 'triangle' : 'sawtooth')) { engOsc.type = ev ? 'triangle' : 'sawtooth'; engLP.frequency.value = ev ? 1400 : 420; }
    engGain.gain.setTargetAtTime(on && !muted && sfxOn ? (ev ? 0.022 + use * 0.02 : 0.04 + use * 0.045) : 0, t, 0.12);
    engOsc.frequency.setTargetAtTime(f, t, ev ? 0.12 : 0.06);
  }

  /* ---------- background music: a small step sequencer, four bars over A minor, F, C and G ---------- */
  var MUS_ROOT = [55, 43.65, 65.41, 49], MUS_CHORD = [[1, 1.189, 1.498, 2], [1, 1.26, 1.498, 2], [1, 1.26, 1.498, 2], [1, 1.26, 1.498, 2]];
  function mNote(type, f, t, dur, vol) {
    var o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(musGain); o.start(t); o.stop(t + dur + 0.03);
  }
  function mDrum(kind, t) {
    if (kind === 'kick') { var o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.13); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18); o.connect(g); g.connect(musGain); o.start(t); o.stop(t + 0.2); return; }
    var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g2 = AC.createGain(), d = kind === 'snare' ? 0.14 : 0.04;
    s.buffer = noiseBuf; f.type = kind === 'snare' ? 'bandpass' : 'highpass'; f.frequency.value = kind === 'snare' ? 1900 : 7000;
    g2.gain.setValueAtTime(kind === 'snare' ? 0.22 : 0.07, t); g2.gain.exponentialRampToValueAtTime(0.001, t + d);
    s.connect(f); f.connect(g2); g2.connect(musGain); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.02);
  }
  function musicTick() {
    if (!AC || !musGain || AC.state !== 'running') return;
    if (muted || !musicOn || musMode === 'off') { musNext = 0; return; }
    var drive = musMode === 'drive', sd = 60 / (drive ? 132 : 92) / 4, now = AC.currentTime;
    if (musNext < now) musNext = now + 0.06;
    while (musNext < now + 0.22) {
      var st = musStep % 16, bar = (musStep >> 4) % 4, root = MUS_ROOT[bar], ch = MUS_CHORD[bar], t = musNext;
      if (drive) {
        if (st % 2 === 0) mNote('sawtooth', root * (st % 8 === 6 ? 2 : 1), t, sd * 1.7, 0.16);
        if (st === 0 || st === 8 || st === 10) mDrum('kick', t);
        if (st === 4 || st === 12) mDrum('snare', t);
        if (st % 4 === 2) mDrum('hat', t);
        if (st === 0 || st === 3 || st === 6 || st === 8 || st === 11 || st === 14) mNote('square', root * 4 * ch[(st + bar) % 4], t, sd * 1.4, 0.035);
      } else {
        if (st === 0) { mNote('triangle', root * 2, t, sd * 14, 0.11); mNote('triangle', root * 2 * ch[2], t, sd * 14, 0.07); }
        if (st % 4 === 0) mNote('triangle', root * 4 * ch[(st / 4 + bar) % 4], t, sd * 3.4, 0.05);
      }
      musStep = (musStep + 1) % 64; musNext += sd;
    }
  }
  function setMusic(mode) { if (musMode !== mode) { musMode = mode; musStep = 0; } }

  /* test hook: render one effect in an offline context and report how loud and how long it is */
  function probeSfx(name, k) {
    var Off = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!Off) return Promise.resolve(null);
    var oc = new Off(1, 66150, 44100), keep = [AC, master, noiseBuf, muted, lastSfx], i;
    AC = oc; master = oc.createGain(); master.connect(oc.destination); muted = false; lastSfx = {}; probing = true;
    noiseBuf = oc.createBuffer(1, 44100, 44100); var nd = noiseBuf.getChannelData(0); for (i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    sfx(name, k);
    AC = keep[0]; master = keep[1]; noiseBuf = keep[2]; muted = keep[3]; lastSfx = keep[4]; probing = false;
    return oc.startRendering().then(function (buf) {
      var d = buf.getChannelData(0), peak = 0, sum = 0, last = 0, n = 0;
      for (i = 0; i < d.length; i++) { var a = Math.abs(d[i]); if (a > peak) peak = a; if (a > 0.004) { last = i; sum += a * a; n++; } }
      return { name: name, peak: +peak.toFixed(3), rms: n ? +Math.sqrt(sum / n).toFixed(3) : 0, dur: +(last / 44100).toFixed(2) };
    });
  }
