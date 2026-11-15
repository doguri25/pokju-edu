  /* ---------- HUD pieces from the mockup: a round speed gauge drawn with Canvas2D, the run's ten questions as dots,
     the combo badge, cooldown rings on the round skill buttons, the question's countdown bar and the right/wrong toast ---------- */
  var gaugeCv = $('spd-gauge'), gaugeX = gaugeCv.getContext('2d'), gaugeKey = '';
  function drawGauge(car) {
    var f = clamp(veff / car.vmax, 0, 1), tg = clamp(player.thr, 0, 1), nitro = buff.nitro > 0 ? clamp(buff.nitro / 8, 0, 1) : 0;
    var key = Math.round(f * 200) + ',' + Math.round(tg * 50) + ',' + Math.round(nitro * 30);
    if (key === gaugeKey) return;
    gaugeKey = key;
    var x = gaugeX, W = gaugeCv.width, c = W / 2, r = W * 0.4, a0 = Math.PI * 0.75, a1 = Math.PI * 2.25, i;
    x.clearRect(0, 0, W, W);
    x.lineCap = 'round';
    x.lineWidth = W * 0.055; x.strokeStyle = 'rgba(255,255,255,0.12)';
    x.beginPath(); x.arc(c, c, r, a0, a1); x.stroke();
    var g = x.createLinearGradient(c - r, c, c + r, c); g.addColorStop(0, '#22e1ff'); g.addColorStop(0.6, '#8a5cff'); g.addColorStop(1, '#ff2d95');
    x.strokeStyle = g; x.shadowColor = '#8a5cff'; x.shadowBlur = W * 0.05;
    x.beginPath(); x.arc(c, c, r, a0, a0 + (a1 - a0) * Math.max(0.003, f)); x.stroke();
    x.shadowBlur = 0;
    for (i = 0; i <= 10; i++) {
      var a = a0 + (a1 - a0) * i / 10, r1 = r - W * 0.07, r2 = r - W * (i % 5 ? 0.095 : 0.12);
      x.lineWidth = W * 0.012; x.strokeStyle = 'rgba(255,255,255,0.45)';
      x.beginPath(); x.moveTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1); x.lineTo(c + Math.cos(a) * r2, c + Math.sin(a) * r2); x.stroke();
    }
    /* where the lever asks the speed to go */
    var at = a0 + (a1 - a0) * (car.vmin + tg * (car.vmax - car.vmin)) / car.vmax;
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(c + Math.cos(at) * (r + W * 0.06), c + Math.sin(at) * (r + W * 0.06), W * 0.018, 0, Math.PI * 2); x.fill();
    /* nitro bar under the number */
    var bw = W * 0.36, by = c + r * 0.62;
    x.lineCap = 'butt';
    x.fillStyle = 'rgba(255,255,255,0.12)'; x.beginPath(); x.roundRect(c - bw / 2, by, bw, W * 0.03, W * 0.015); x.fill();
    if (nitro > 0) { x.fillStyle = '#22e1ff'; x.beginPath(); x.roundRect(c - bw / 2, by, bw * nitro, W * 0.03, W * 0.015); x.fill(); }
  }
  function setVar(el, name, v) { var k = el.id + name; if (hudCache[k] !== v) { hudCache[k] = v; el.style.setProperty(name, v); } }
  function hudMock(car) {
    drawGauge(car);
    setVar($('btn-skill'), '--p', (1 - player.cd / car.cd).toFixed(3));
    setVar($('btn-basic'), '--p', (1 - (player.bcd || 0) / BASICS[car.basic].cd).toFixed(3));
    setVar($('btn-fire'), '--p', '1');
    var dk = quizRun() ? quiz.deck : null, dots = '', i, k;
    if (dk) {
      var first = dk.log.filter(function (r) { return !r.retry; });
      k = dk.main + ':' + first.length + ':' + (quiz.phase === 'ask' ? 1 : 0);
      if (hudCache.dots !== k) {
        hudCache.dots = k;
        for (i = 0; i < dk.main; i++) dots += '<i class="' + (i < first.length ? (first[i].ok ? 'ok' : 'no') : (i === first.length && dk.i <= dk.main ? 'cur' : '')) + '"></i>';
        $('obj-dots').innerHTML = dots;
      }
    }
    if (hudCache.hasDots !== !!dk) { hudCache.hasDots = !!dk; $('obj-dots').hidden = !dk; document.querySelector('.chip.obj').classList.toggle('dots', !!dk); }
    var combo = dk && quiz.combo >= 2 ? quiz.combo + ' 연속' : '';
    if (hudCache.combo !== combo) { hudCache.combo = combo; $('combo').textContent = combo; $('combo').hidden = !combo; }
    /* the bar fills as the gates come up (they are the real deadline), or over the thinking time when shooting */
    if (dk && quiz.phase === 'ask' && quiz.askLen) setStyle('q-timer-bar', 'width', pct(quiz.g && quiz.d > quiz.askD0 ? (dist - quiz.askD0) / (quiz.d - quiz.askD0) : quiz.askE / quiz.askLen));
  }
  /* the toast: 「정답!」 or 「아쉬워요」 big in the middle of the road */
  function quizToast(ok, q, again) {
    var el = $('qtoast');
    $('qtoast-t').textContent = ok ? (quiz.combo >= 3 ? quiz.combo + '개 연속!' : '정답!') : '아쉬워요';
    $('qtoast-s').textContent = ok ? (EDU.arms ? '수리 +20% · 니트로' : '니트로') : q.full + (again ? ' · 끝에 한 번 더' : '');
    el.style.setProperty('--tc', ok ? '#35e08a' : '#ff5468');
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  }
