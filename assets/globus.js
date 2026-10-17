/* Drehende Weltkugel (Startseite): orthografische Projektion, Daten: Natural Earth 110m (gemeinfrei). */
(function () {
  "use strict";
  var cv = document.querySelector("canvas.globe");
  if (!cv || !window.WIKI_LAND) return;
  var ctx = cv.getContext("2d");
  var size = 0, dpr = 1;
  var lon0 = 10, tilt = 18 * Math.PI / 180, dragging = false, lastX = 0, running = true;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var RAD = Math.PI / 180;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    size = cv.clientWidth;
    cv.width = cv.height = Math.round(size * dpr);
    draw();
  }

  function proj(lon, lat) {
    var l = (lon - lon0) * RAD, p = lat * RAD;
    var X = Math.cos(p) * Math.sin(l), Y = Math.sin(p), Z = Math.cos(p) * Math.cos(l);
    var ct = Math.cos(tilt), st = Math.sin(tilt);
    return [X, -(Y * ct - Z * st), Y * st + Z * ct];
  }

  function line(pts, close) {
    var started = false;
    for (var i = 0; i < pts.length; i++) {
      var q = pts[i], x = q[0], y = q[1];
      if (q[2] < 0) {
        var n = Math.sqrt(x * x + y * y) || 1;
        x /= n; y /= n;
      }
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    }
    if (close) ctx.closePath();
  }

  function draw() {
    var r = size / 2 - 4;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.scale(r, r);

    var halo = ctx.createRadialGradient(0, 0, 0.96, 0, 0, 1.04);
    halo.addColorStop(0, "rgba(120,180,255,.55)");
    halo.addColorStop(1, "rgba(120,180,255,0)");
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(0, 0, 1.04, 0, 7); ctx.fill();

    var sea = ctx.createRadialGradient(-.35, -.4, .1, 0, 0, 1.05);
    sea.addColorStop(0, "#4a98d9");
    sea.addColorStop(1, "#1d5a9a");
    ctx.fillStyle = sea;
    ctx.beginPath(); ctx.arc(0, 0, 1, 0, 7); ctx.fill();

    ctx.beginPath(); ctx.arc(0, 0, 1, 0, 7); ctx.clip();

    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.lineWidth = 0.004;
    var a, b, pts;
    for (a = -60; a <= 60; a += 30) {
      pts = []; for (b = -180; b <= 180; b += 6) pts.push(proj(b, a));
      ctx.beginPath(); drawVisible(pts); ctx.stroke();
    }
    for (a = 0; a < 360; a += 30) {
      pts = []; for (b = -90; b <= 90; b += 6) pts.push(proj(a, b));
      ctx.beginPath(); drawVisible(pts); ctx.stroke();
    }

    ctx.fillStyle = "#76b66b";
    ctx.strokeStyle = "#3f7d44";
    ctx.lineWidth = 0.006;
    var land = window.WIKI_LAND;
    for (var i = 0; i < land.length; i++) {
      var ring = land[i], vis = false, P = new Array(ring.length);
      for (var k = 0; k < ring.length; k++) {
        P[k] = proj(ring[k][0], ring[k][1]);
        if (P[k][2] > 0) vis = true;
      }
      if (!vis) continue;
      ctx.beginPath(); line(P, true); ctx.fill(); ctx.stroke();
    }

    var shade = ctx.createRadialGradient(-.4, -.45, .2, 0, 0, 1.15);
    shade.addColorStop(0, "rgba(255,255,255,.18)");
    shade.addColorStop(.55, "rgba(0,0,30,0)");
    shade.addColorStop(1, "rgba(0,0,40,.5)");
    ctx.fillStyle = shade;
    ctx.beginPath(); ctx.arc(0, 0, 1, 0, 7); ctx.fill();
    ctx.restore();
  }

  function drawVisible(pts) {
    var pen = false;
    for (var i = 0; i < pts.length; i++) {
      if (pts[i][2] > 0) {
        if (!pen) { ctx.moveTo(pts[i][0], pts[i][1]); pen = true; } else ctx.lineTo(pts[i][0], pts[i][1]);
      } else pen = false;
    }
  }

  var last = 0;
  function tick(t) {
    if (running && !dragging && !reduce) {
      if (last) lon0 = (lon0 + (t - last) * 0.012) % 360;
      draw();
    }
    last = t;
    requestAnimationFrame(tick);
  }

  cv.addEventListener("pointerdown", function (e) { dragging = true; lastX = e.clientX; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    lon0 = (lon0 - (e.clientX - lastX) * 0.5) % 360;
    lastX = e.clientX;
    draw();
  });
  function stop() { dragging = false; }
  cv.addEventListener("pointerup", stop);
  cv.addEventListener("pointercancel", stop);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { running = en[0].isIntersecting; }).observe(cv);
  }
  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(tick);
})();
