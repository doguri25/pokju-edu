  /* ---------- vehicle physics for the other cars (learning edition 1.3) ----------
     Before, traffic and pursuers drove straight through pillars, wrecks, rocks and dropped gravel. Now every vehicle on the road
     - looks ahead along its lane: when something solid is coming it moves to the nearest clear lane, and if none is clear it brakes;
     - crashes if it still meets it (a pursuer or a truck is wrecked; it burns like any other kill, but scores nothing);
     - keeps its distance from the vehicle in front: it slows to that one's speed instead of driving through it, and a quicker
       pursuer looks for a way round */
  var SOFT_KIND = { mud: 1, water: 1, ice: 1, hump: 1, hole: 1, pick: 1, tut: 1, race: 1 };
  function solidFor(pr) { return pr.solid && !SOFT_KIND[pr.solid.kind] && pr.m.visible; }
  /* is there something solid in lane x between road distances d0 and d1 (d0 < d1), for a vehicle of half-width hw? margin: extra room
     asked for beside it (small: a toll island 2 m from the lane centre must not close the lane) */
  var hulkBlk = { d: 0, x: 0, solid: { hw: 1, hl: 2 } };
  function laneBlock(x, d0, d1, hw, margin) {
    var mg = margin === undefined ? 0.1 : margin, i;
    for (i = 0; i < props.length; i++) {
      var pr = props[i];
      if (!solidFor(pr) || pr.d < d0 - pr.solid.hl || pr.d > d1 + pr.solid.hl) continue;
      if (Math.abs(pr.x - x) < pr.solid.hw + hw + mg) return pr;
    }
    for (i = 0; i < hulks.length; i++) {   /* a burnt-out wreck left on the road is in the way too */
      var h = hulks[i], hd = dist - h.m.position.z, hh = h.m.scale.z * 0.5;
      if (!h.m.visible || hd < d0 - hh || hd > d1 + hh) continue;
      if (Math.abs(h.m.position.x - x) < h.m.scale.x * 0.5 + hw + mg) { hulkBlk.d = hd; hulkBlk.x = h.m.position.x; hulkBlk.solid.hw = h.m.scale.x * 0.5; hulkBlk.solid.hl = hh; return hulkBlk; }
    }
    return null;
  }
  function groundVeh(e) { return !e.cfg.air && !e.cfg.kami && !e.cfg.boss && !e.cfg.rival && e.g.visible; }
  var physOrder = [];
  function vehiclePhysics(dt) {
    var i, k, e, o, p, d, ahead, look, car = CARS[player.car];
    /* 1. obstacles: dodge, brake, or crash. Oncoming traffic (driving the other way) keeps to its own lane and is left alone */
    for (i = enemies.length - 1; i >= 0; i--) {
      e = enemies[i];
      if (!groundVeh(e) || e.dieNow || e.ws < 0) continue;
      p = e.g.position; d = dist - p.z;
      if (!(e.cfg.transit && e.state === 2)) {   /* a bus waiting at its stop does not dodge */
        look = 8 + Math.max(e.ws, 6) * 1.6;
        e.avoidT = (e.avoidT || 0) - dt;
        var hwT = e.cfg.hw * 0.8;   /* a little slack: a truck still fits a toll lane */
        ahead = laneBlock(e.x0, d + e.cfg.hl, d + e.cfg.hl + look, hwT);
        if (ahead && e.avoidT <= 0) {
          var best = null, bd = 1e9, bq = blockedAt(d) || blockedAt(d + look);
          for (k = 0; k < LANES.length; k++) {
            var L = LANES[k];
            if (Math.abs(L - e.x0) < 0.5 || laneBlock(L, d - e.cfg.hl - 4, d + e.cfg.hl + look, hwT) || !laneOpen(L, d) || !laneOpen(L, d + look * 0.6)) continue;
            if (bq && bq.split && (L > 0) !== (e.x0 > 0)) continue;   /* never across a split road's median */
            if (Math.abs(L - e.x0) < bd) { bd = Math.abs(L - e.x0); best = L; }
          }
          e.dodge = best; e.avoidT = 0.6;
          if (best === null) e.brake = true;   /* nowhere to go: stop short of it */
        }
        if (!ahead) e.brake = false;
        if (e.dodge !== null && e.dodge !== undefined) {
          e.x0 += clamp(e.dodge - e.x0, -5.5 * dt, 5.5 * dt); e.laneGo = undefined;
          if (Math.abs(e.dodge - e.x0) < 0.05) { if (e.cfg.transit) e.laneX = e.dodge; e.dodge = null; }
        }
        if (e.brake && ahead && !e.chase) {
          if (e.wsBase === undefined) e.wsBase = e.ws;   /* its own speed, to get back once the way is clear */
          var gap = ahead.d - ahead.solid.hl - (d + e.cfg.hl);
          e.ws = Math.max(0, Math.min(e.ws, gap > 2 ? e.ws - 14 * dt : 0));
        } else if (!e.brake && e.wsBase !== undefined && e.ws < e.wsBase && !e.chase && !e.cfg.transit && !e.hunted) e.ws = Math.min(e.wsBase, e.ws + 5 * dt);
      }
      /* really touching something solid (no margin): it crashes */
      var hit = laneBlock(p.x, d - e.cfg.hl * 0.8, d + e.cfg.hl * 0.8, e.cfg.hw * 0.75, 0);
      if (hit && Math.abs(hit.d - d) < hit.solid.hl + e.cfg.hl * 0.8) { killEnemy(i, true); continue; }
    }
    /* 2. keep distance from the vehicle in front (it is further ahead: smaller z). A pursuer closing from behind is let through
       (it overtakes), oncoming cars are left out, the gap is opened a little each frame rather than at once (no jumps),
       and nothing is ever pushed onto the player's car */
    physOrder.length = 0;
    for (i = 0; i < enemies.length; i++) if (groundVeh(enemies[i]) && enemies[i].ws >= 0) physOrder.push(enemies[i]);
    physOrder.sort(function (a, b) { return a.g.position.z - b.g.position.z; });
    for (i = 1; i < physOrder.length; i++) {
      e = physOrder[i];
      if (e.chase) continue;
      for (k = i - 1; k >= 0; k--) {
        o = physOrder[k];
        var pe = e.g.position, po = o.g.position, need = e.cfg.hl + o.cfg.hl + 1.6;
        if (pe.z - po.z > need + 14) break;
        if (Math.abs(pe.x - po.x) > e.cfg.hw + o.cfg.hw + 0.25) continue;
        if (pe.z - po.z < need) {
          var nz = Math.min(po.z + need, pe.z + (Math.max(0, e.ws - o.ws) + 4) * dt);
          if (car && !player.dead && Math.abs(pe.x - player.x) < e.cfg.hw + car.hw + 0.3 && nz > -car.hl - e.cfg.hl - 1.5 && pe.z < car.hl) nz = pe.z;
          pe.z = nz;
          if (e.wsBase === undefined) e.wsBase = e.ws;
          if (e.ws > o.ws) e.ws = o.ws;
          if (e.type === 'sedan' && e.ws > 0) e.lcT = Math.min(e.lcT || 0, 0.3);   /* a pursuer looks for a way round */
        }
      }
    }
  }

  /* ---------- no stutter when something new appears (learning edition 1.3) ----------
     Each new kind of car, roadside object or effect used to be built, and its shaders compiled, the first time it showed up: a hitch in
     the middle of a run, worst at the first explosion. At start-up (behind the title screen) every pool is filled once and every material
     in the scene is compiled for the buffer the game really draws into, so nothing is built or compiled mid-run */
  function prewarm() {
    var t0 = performance.now(), k, i;
    var FOES = { civ: 6, sedan: 4, taxi: 2, bike: 3, buggy: 2, dump: 1, cbus: 1, tractor: 1, drone: 3, kami: 2 };
    for (k in FOES) for (i = epool[k].length; i < FOES[k]; i++) { try { var e = buildEnemy(k); e.g.visible = false; scene.add(e.g); epool[k].push(e); } catch (err) {} }
    for (k in BUILD) {
      if (/^sb_/.test(k) || (propPool[k] && propPool[k].length)) continue;
      try { var pm = bake(BUILD[k](), null, k === 'wreck'); pm.visible = false; scene.add(pm); (propPool[k] || (propPool[k] = [])).push({ type: k, m: pm }); } catch (err) {}
    }
    ['glow', 'smoke'].forEach(function (kind) {
      for (i = ppool[kind].length; i < 140; i++) {
        var sp = { kind: kind, s: new T.Sprite(new T.SpriteMaterial({ map: kind === 'glow' ? texGlow : texSmoke, transparent: true, depthWrite: false, fog: false, blending: kind === 'glow' ? T.AdditiveBlending : T.NormalBlending })) };
        sp.s.visible = false; sp.s.layers.set(FX_LAYER); scene.add(sp.s); ppool[kind].push(sp);
      }
    });
    for (i = dpool.length; i < 40; i++) { var dm = new T.Mesh(DEB_GEOS[i % DEB_GEOS.length], M.dark); dm.castShadow = true; dm.visible = false; scene.add(dm); dpool.push({ m: dm }); }
    leafRecolor();   /* the leaves' per-leaf colours exist before their shader is compiled */
    envKey = ''; envT = 0; updEnv(1);   /* reflections assigned first: they change the shaders */
    var rt = renderer.getRenderTarget();
    try { renderer.setRenderTarget(post ? post.composer.readBuffer : null); renderer.compile(scene, camera); if (mirrorRT) { renderer.setRenderTarget(mirrorRT); renderer.compile(scene, mirrorCam); } } catch (err) {}
    renderer.setRenderTarget(rt);
    prewarmMs = Math.round(performance.now() - t0);
  }
  var prewarmMs = 0;
