/* Interaktive Karten des Wikis (Leaflet).
   Wird von wiki.js nachgeladen, sobald ein Element .geomap auf der Seite steht.
   Varianten über data-layer: (leer) Raumbeispiele, plattengrenzen, eiszeit, klima,
   swipe, quiz, einzugsgebiete, staedte, laender. Zusätzliche Daten stehen in assets/karten/. */
(function () {
  "use strict";
  var els = document.querySelectorAll(".geomap");
  if (!els.length || !window.L) return;
  var places = window.RAUMBEISPIELE;

  // OSM- und CARTO-Kacheln sind ohne Referer (file://) bzw. ohne API-Key gesperrt; Esri funktioniert in beiden Fällen.
  var ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/";
  var TILES = {
    topo: [ESRI + "World_Topo_Map/MapServer/tile/{z}/{y}/{x}", 17, "Esri, DeLorme, NAVTEQ, USGS"],
    sat: [ESRI + "World_Imagery/MapServer/tile/{z}/{y}/{x}", 17, "Esri, Maxar, Earthstar Geographics"],
    blank: [ESRI + "World_Terrain_Base/MapServer/tile/{z}/{y}/{x}", 9, "Esri, USGS, NOAA"]
  };
  function tile(name) {
    var t = TILES[name];
    return L.tileLayer(t[0], { maxZoom: t[1], attribution: "Tiles &copy; Esri &mdash; " + t[2] });
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c];
    });
  }
  function loadData(name, cb) {
    if (window.GEOMAP_DATA && window.GEOMAP_DATA[name]) return cb();
    var s = document.createElement("script");
    s.src = "assets/karten/" + name + ".js";
    s.onload = cb;
    document.head.appendChild(s);
  }
  function legend(map, html, pos) {
    var c = L.control({ position: pos || "bottomleft" });
    c.onAdd = function () {
      var d = L.DomUtil.create("div", "geomap-legend");
      d.innerHTML = html;
      return d;
    };
    c.addTo(map);
  }
  function swatch(color, label) {
    return "<div><span class=\"sw\" style=\"background:" + color + "\"></span>" + label + "</div>";
  }
  function makeMap(el, base, view, zoom) {
    var map = L.map(el, { scrollWheelZoom: false, worldCopyJump: true }).setView(view, zoom);
    tile(base || "topo").addTo(map);
    el.addEventListener("click", function () { map.scrollWheelZoom.enable(); }, { once: true });
    return map;
  }
  function note(el, text) {
    var p = document.createElement("p");
    p.className = "geomap-note";
    p.textContent = text;
    el.parentNode.insertBefore(p, el.nextSibling);
  }

  /* Karte ab 1440 px Breite am rechten Rand andocken (bleibt beim Scrollen stehen). */
  function dockRight(el, onChange) {
    var rail = document.querySelector(".toc-rail-inner");
    if (!rail || !window.matchMedia) return;
    var hint = document.createElement("p");
    hint.className = "geomap-moved";
    hint.textContent = "Die Karte steht am rechten Seitenrand und bleibt beim Scrollen sichtbar. Ein Klick auf einen Marker springt zum passenden Abschnitt.";
    el.parentNode.insertBefore(hint, el);
    var mq = window.matchMedia("(min-width: 1440px)");
    function apply() {
      if (mq.matches) {
        rail.insertBefore(el, rail.firstChild);
        el.classList.add("geomap-docked");
        hint.style.display = "block";
      } else {
        hint.parentNode.insertBefore(el, hint.nextSibling);
        el.classList.remove("geomap-docked");
        hint.style.display = "none";
      }
      onChange();
    }
    if (mq.addEventListener) mq.addEventListener("change", apply); else mq.addListener(apply);
    apply();
  }

  function flash(h) {
    h.classList.remove("geomap-flash");
    void h.offsetWidth;
    h.classList.add("geomap-flash");
  }

  /* ---------- Raumbeispiele ---------- */
  function placesLayer(el) {
    var only = el.getAttribute("data-type");
    var here = location.pathname.split("/").pop().replace(/\.html.*$/, "");
    var map = makeMap(el, "topo", [45, 10], 3);
    var groups = {}, bounds = [], byAnchor = {};
    var list = places.places.filter(function (p) { return !only || p.type === only; });
    list.forEach(function (p) {
      var t = places.types[p.type];
      var m = L.circleMarker([p.lat, p.lng], { radius: 8, color: "#fff", weight: 2, fillColor: t.color, fillOpacity: 0.95 });
      var target = p.page === here ? document.getElementById(p.anchor) : null;
      var link = target ? "" :
        "<br><a href=\"" + esc(p.page) + ".html#" + esc(p.anchor) + "\">Zum Abschnitt →</a>";
      m.bindPopup("<strong>" + esc(p.name) + "</strong><br>" + esc(t.label) + " – " + esc(p.note) + link);
      m.bindTooltip(p.name);
      if (target) {
        m.on("click", function () {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          flash(target);
        });
        (byAnchor[p.anchor] = byAnchor[p.anchor] || []).push(m);
      }
      (groups[p.type] = groups[p.type] || L.layerGroup()).addLayer(m);
      bounds.push([p.lat, p.lng]);
    });
    var overlays = {};
    Object.keys(places.types).forEach(function (k) {
      if (!groups[k]) return;
      groups[k].addTo(map);
      overlays["<span style=\"color:" + places.types[k].color + "\">●</span> " + places.types[k].label] = groups[k];
    });
    if (!only) L.control.layers(null, overlays, { collapsed: false }).addTo(map);
    function fit() {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 7 });
    }
    fit();

    // aktiven Abschnitt auf der Karte hervorheben und dorthin schwenken
    var anchors = Object.keys(byAnchor);
    if (anchors.length && "IntersectionObserver" in window) {
      var active = null;
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting || en.target.id === active) return;
          active = en.target.id;
          anchors.forEach(function (a) {
            byAnchor[a].forEach(function (m) { m.setStyle({ radius: a === active ? 12 : 8, weight: a === active ? 3 : 2 }); });
          });
          var ms = byAnchor[active];
          if (ms && el.classList.contains("geomap-docked")) map.panTo(ms[0].getLatLng());
        });
      }, { rootMargin: "-80px 0px -70% 0px" });
      anchors.forEach(function (a) {
        var h = document.getElementById(a);
        if (h) io.observe(h);
      });
    }
    dockRight(el, fit);
  }

  /* ---------- Plattentektonik ---------- */
  var VOLCANOES = [
    ["Fuji (Japan)", 35.36, 138.73], ["Pinatubo (Philippinen)", 15.13, 120.35], ["Krakatau (Indonesien)", -6.1, 105.42],
    ["Mount St. Helens (USA)", 46.2, -122.18], ["Popocatépetl (Mexiko)", 19.02, -98.62], ["Ätna (Italien)", 37.75, 14.99],
    ["Vesuv (Italien)", 40.82, 14.43], ["Kīlauea (Hawaii)", 19.42, -155.29], ["Eyjafjallajökull (Island)", 63.63, -19.62],
    ["Nevado del Ruiz (Kolumbien)", 4.89, -75.32], ["Merapi (Indonesien)", -7.54, 110.45]
  ];
  function plattengrenzen(el) {
    var map = makeMap(el, "topo", [20, 160], 2);
    loadData("plattengrenzen", function () {
      L.polyline(window.GEOMAP_DATA.plattengrenzen, { color: "#dc2626", weight: 2, opacity: 0.85, smoothFactor: 1 })
        .bindTooltip("Plattengrenze").addTo(map);
      VOLCANOES.forEach(function (v) {
        L.circleMarker([v[1], v[2]], { radius: 6, color: "#fff", weight: 1.5, fillColor: "#f59e0b", fillOpacity: 1 })
          .bindTooltip(v[0]).addTo(map);
      });
      legend(map, swatch("#dc2626", "Plattengrenze (PB2002)") + swatch("#f59e0b", "ausgewählte Vulkane"));
    });
    note(el, "Plattengrenzen nach Bird (2003, Modell PB2002). Der „Pazifische Feuerring“ ist an der Häufung von Vulkanen entlang der Pazifikplatte erkennbar.");
  }

  /* ---------- Eiszeit-Eisrandlagen ---------- */
  var EIS = [
    ["Elsterkaltzeit (größte Ausdehnung)", "#7c3aed", [[51.7, 7.7], [51.6, 8.4], [51.3, 9.4], [51.4, 10.4], [51.1, 11.2], [50.9, 12.3], [50.9, 13.3], [50.8, 14.5], [50.6, 15.9], [50.3, 17.5], [50.2, 19.0]]],
    ["Saalekaltzeit (Drenthe-Stadium)", "#0ea5e9", [[52.6, 5.4], [52.1, 5.8], [51.7, 6.2], [51.5, 6.9], [51.8, 7.6], [52.1, 8.5], [52.0, 9.2], [51.9, 10.0], [51.9, 10.9], [51.6, 11.7], [51.3, 12.4], [51.2, 13.0], [51.3, 14.0], [51.2, 15.0], [51.5, 16.5], [51.7, 17.8], [51.9, 19.5], [51.7, 21.5]]],
    ["Weichselkaltzeit (Maximalstand)", "#16a34a", [[56.9, 8.4], [56.2, 8.2], [55.6, 8.9], [54.9, 9.4], [54.0, 10.0], [53.6, 10.4], [53.3, 11.1], [53.2, 12.3], [52.8, 13.0], [52.4, 13.9], [52.3, 14.6], [52.6, 15.5], [52.8, 16.7], [53.0, 18.0], [53.4, 19.8], [53.9, 21.8], [54.4, 23.4]]]
  ];
  function eiszeit(el) {
    var map = makeMap(el, "topo", [53, 12], 5);
    var html = "";
    EIS.forEach(function (e) {
      L.polyline(e[2], { color: e[1], weight: 4, opacity: 0.9 }).bindTooltip(e[0], { sticky: true }).addTo(map);
      html += swatch(e[1], e[0]);
    });
    L.tooltip({ permanent: true, direction: "center", className: "geomap-label" })
      .setLatLng([55.6, 13.5]).setContent("↑ Vereisungsgebiet<br>(Inlandeis)").addTo(map);
    legend(map, html);
    note(el, "Stark vereinfachter Verlauf der Eisrandlagen (Lehrbuch-Schema), nicht maßstäblich genau. Nördlich der Linien lag jeweils das Inlandeis; im Süden schließen sich Sander und Urstromtäler an.");
  }

  /* ---------- Klimazonen und Windsysteme ---------- */
  var ZONEN = [
    ["Tropen", 0, 23.5, "#ef4444"], ["Subtropen", 23.5, 40, "#f59e0b"],
    ["Gemäßigte Zone", 40, 66.5, "#22c55e"], ["Polare Zone", 66.5, 85, "#93c5fd"]
  ];
  function klima(el) {
    var map = makeMap(el, "topo", [10, 10], 2);
    var zonen = L.layerGroup().addTo(map), wind = L.layerGroup().addTo(map);
    ZONEN.forEach(function (z) {
      [1, -1].forEach(function (s) {
        var a = s * z[1], b = s * z[2];
        L.rectangle([[a, -180], [b, 180]], { color: z[3], weight: 1, fillColor: z[3], fillOpacity: 0.22 })
          .bindTooltip(z[0] + " (" + z[1] + "°–" + z[2] + "° " + (s > 0 ? "N" : "S") + ")", { sticky: true }).addTo(zonen);
      });
    });
    var systems = [
      ["Passat (Nordost)", "#b91c1c", function (l) { return [[28, l + 30], [8, l]]; }],
      ["Passat (Südost)", "#b91c1c", function (l) { return [[-28, l + 30], [-8, l]]; }],
      ["Westwindzone (Nord)", "#1d4ed8", function (l) { return [[35, l], [55, l + 30]]; }],
      ["Westwindzone (Süd)", "#1d4ed8", function (l) { return [[-35, l], [-55, l + 30]]; }],
      ["Polare Ostwinde (Nord)", "#475569", function (l) { return [[80, l + 30], [66, l]]; }],
      ["Polare Ostwinde (Süd)", "#475569", function (l) { return [[-80, l + 30], [-66, l]]; }]
    ];
    systems.forEach(function (s) {
      for (var l = -180; l < 180; l += 60) {
        L.polyline(s[2](l), { color: s[1], weight: 3, className: "wind-line" }).bindTooltip(s[0]).addTo(wind);
      }
    });
    L.control.layers(null, { "Klimazonen (Breitenkreise)": zonen, "Windsysteme (animiert)": wind }, { collapsed: false }).addTo(map);
    legend(map, swatch("#b91c1c", "Passatwinde") + swatch("#1d4ed8", "Westwinddrift") + swatch("#475569", "Polare Ostwinde"));
    note(el, "Modell der Klimazonen nach Breitenkreisen. Die reale Verteilung weicht durch Meeresströmungen, Gebirge und Land-Meer-Verteilung ab. Die animierten Strichlinien zeigen die Strömungsrichtung der Winde.");
  }

  /* ---------- Vergleichs-Schieberegler (Satellit ↔ Topografie) ---------- */
  function swipe(el) {
    var lat = parseFloat(el.getAttribute("data-lat")), lng = parseFloat(el.getAttribute("data-lng"));
    var zoom = parseInt(el.getAttribute("data-zoom") || "10", 10);
    var map = L.map(el, { scrollWheelZoom: false }).setView([lat, lng], zoom);
    var left = tile("sat").addTo(map), right = tile("topo").addTo(map);
    var range = document.createElement("input");
    range.type = "range"; range.min = 0; range.max = 100; range.value = 50;
    range.className = "geomap-swipe"; range.setAttribute("aria-label", "Kartenvergleich verschieben");
    el.appendChild(range);
    L.DomEvent.disableClickPropagation(range);
    function clip() {
      var size = map.getSize(), nw = map.containerPointToLayerPoint([0, 0]), se = map.containerPointToLayerPoint(size);
      var x = nw.x + size.x * range.value / 100;
      left.getContainer().style.clip = "rect(" + [nw.y, x, se.y, nw.x].join("px,") + "px)";
      right.getContainer().style.clip = "rect(" + [nw.y, se.x, se.y, x].join("px,") + "px)";
    }
    range.addEventListener("input", clip);
    map.on("move zoom viewreset resize", clip);
    clip();
    legend(map, "<div>◀ Satellitenbild</div><div>Topografie ▶</div>", "topleft");
    el.addEventListener("click", function () { map.scrollWheelZoom.enable(); }, { once: true });
  }

  /* ---------- Quiz: Orte auf stummer Karte finden ---------- */
  function quiz(el) {
    var map = makeMap(el, "blank", [30, 10], 2);
    var bar = document.createElement("div");
    bar.className = "geoquiz-bar";
    el.parentNode.insertBefore(bar, el);
    var layer = L.layerGroup().addTo(map);
    var cur, done, score = 0, asked = 0;
    function next() {
      layer.clearLayers();
      cur = places.places[Math.floor(Math.random() * places.places.length)];
      done = false;
      bar.innerHTML = "<strong>Wo liegt: " + esc(cur.name) + "?</strong> Klicke auf die Karte. <span class=\"geoquiz-score\">Treffer (≤ 500 km): " + score + " / " + asked + "</span>";
    }
    map.on("click", function (e) {
      if (done) return;
      done = true; asked++;
      var km = Math.round(map.distance(e.latlng, [cur.lat, cur.lng]) / 1000);
      if (km <= 500) score++;
      L.marker(e.latlng).addTo(layer);
      L.circleMarker([cur.lat, cur.lng], { radius: 9, color: "#fff", fillColor: places.types[cur.type].color, fillOpacity: 1 })
        .bindTooltip(cur.name, { permanent: true }).addTo(layer);
      L.polyline([e.latlng, [cur.lat, cur.lng]], { color: "#475569", dashArray: "6 6" }).addTo(layer);
      bar.innerHTML = "<strong>" + esc(cur.name) + "</strong>: Abweichung " + km.toLocaleString("de-DE") + " km — " +
        (km <= 500 ? "Treffer!" : "daneben.") + " <button type=\"button\" class=\"text-btn\">Nächste Frage</button> <span class=\"geoquiz-score\">Treffer: " + score + " / " + asked + "</span>";
      bar.querySelector("button").addEventListener("click", next);
    });
    next();
  }

  /* ---------- Einzugsgebiete Rhein und Elbe ---------- */
  var GEBIETE = [
    {
      name: "Rhein", color: "#2563eb", info: "Länge ≈ 1.230 km · Einzugsgebiet ≈ 185.000 km² · Quelle: Alpenrhein (Tomasee) → Mündung: Nordsee",
      basin: [[46.4, 8.6], [46.6, 10.2], [47.4, 10.2], [48.2, 10.0], [48.8, 9.2], [49.4, 9.3], [49.9, 10.1], [50.4, 9.7], [50.9, 9.6], [51.5, 8.9], [52.0, 8.3], [52.3, 7.5], [52.2, 6.4], [52.0, 5.4], [51.8, 4.3], [51.3, 5.8], [50.7, 6.0], [49.8, 5.9], [49.0, 5.3], [48.3, 5.8], [47.8, 6.7], [47.3, 7.0], [46.5, 8.2]],
      river: [[46.62, 8.67], [46.85, 9.53], [47.5, 9.5], [47.7, 8.6], [47.56, 7.59], [48.58, 7.78], [49.0, 8.3], [50.0, 8.27], [50.36, 7.6], [50.94, 6.96], [51.43, 6.75], [51.85, 5.9], [51.95, 4.1]]
    },
    {
      name: "Elbe", color: "#16a34a", info: "Länge ≈ 1.095 km · Einzugsgebiet ≈ 148.000 km² · Quelle: Riesengebirge → Mündung: Nordsee",
      basin: [[48.7, 14.5], [49.0, 16.0], [50.2, 16.8], [50.8, 16.2], [51.5, 15.5], [51.6, 14.8], [52.2, 14.5], [52.6, 13.9], [53.0, 13.0], [53.5, 11.8], [53.6, 10.5], [53.8, 9.6], [53.9, 8.9], [53.3, 9.2], [52.9, 10.0], [52.6, 10.6], [52.2, 10.5], [51.8, 10.3], [51.4, 9.8], [50.8, 10.2], [50.3, 10.7], [50.1, 11.9], [49.6, 12.4], [49.3, 13.3], [48.8, 13.9]],
      river: [[50.77, 15.55], [50.2, 15.83], [51.05, 13.74], [51.56, 13.0], [52.13, 11.64], [52.99, 11.75], [53.53, 9.98], [53.87, 8.7]]
    }
  ];
  function einzugsgebiete(el) {
    var map = makeMap(el, "topo", [50.5, 10], 5);
    var html = "";
    GEBIETE.forEach(function (g) {
      L.polygon(g.basin, { color: g.color, weight: 2, fillColor: g.color, fillOpacity: 0.15 })
        .bindPopup("<strong>Einzugsgebiet " + g.name + "</strong><br>" + g.info).addTo(map);
      L.polyline(g.river, { color: g.color, weight: 4 }).bindTooltip(g.name, { sticky: true }).addTo(map);
      html += swatch(g.color, g.name + " (Fluss und Einzugsgebiet)");
    });
    legend(map, html);
    note(el, "Einzugsgebiete stark vereinfacht eingezeichnet (Schema, keine amtlichen Grenzen). Ein Einzugsgebiet umfasst alle Flächen, deren Wasser über denselben Fluss abfließt; Wasserscheiden bilden die Grenze.");
  }

  /* ---------- Städte: Megacities und Global Cities ---------- */
  var MEGA = [
    ["Tokio", 35.68, 139.69, 37], ["Delhi", 28.61, 77.21, 31], ["Shanghai", 31.23, 121.47, 27], ["São Paulo", -23.55, -46.63, 22],
    ["Mexiko-Stadt", 19.43, -99.13, 22], ["Kairo", 30.04, 31.24, 21], ["Mumbai", 19.08, 72.88, 20], ["Peking", 39.9, 116.4, 20],
    ["Dhaka", 23.81, 90.41, 21], ["Osaka", 34.69, 135.5, 19], ["New York", 40.71, -74.0, 19], ["Karatschi", 24.86, 67.0, 16],
    ["Buenos Aires", -34.6, -58.38, 15], ["Chongqing", 29.56, 106.55, 16], ["Istanbul", 41.01, 28.98, 15], ["Kolkata", 22.57, 88.36, 15],
    ["Lagos", 6.52, 3.38, 14], ["Kinshasa", -4.44, 15.27, 14], ["Manila", 14.6, 120.98, 14], ["Rio de Janeiro", -22.9, -43.17, 13],
    ["Moskau", 55.75, 37.62, 12], ["Los Angeles", 34.05, -118.24, 12]
  ];
  var GLOBAL = [
    ["New York", 40.71, -74.0], ["London", 51.51, -0.13], ["Tokio", 35.68, 139.69], ["Paris", 48.86, 2.35],
    ["Hongkong", 22.32, 114.17], ["Singapur", 1.35, 103.82], ["Frankfurt am Main", 50.11, 8.68], ["Shanghai", 31.23, 121.47]
  ];
  function staedte(el) {
    var map = makeMap(el, "topo", [25, 10], 2);
    var mega = L.layerGroup().addTo(map), glob = L.layerGroup().addTo(map);
    MEGA.forEach(function (c) {
      L.circleMarker([c[1], c[2]], { radius: 4 + c[3] * 0.4, color: "#9a3412", weight: 1, fillColor: "#f97316", fillOpacity: 0.55 })
        .bindTooltip(c[0] + " (≈ " + c[3] + " Mio. Einwohner)").addTo(mega);
    });
    GLOBAL.forEach(function (c) {
      L.circleMarker([c[1], c[2]], { radius: 5, color: "#fff", weight: 2, fillColor: "#1d4ed8", fillOpacity: 1 })
        .bindTooltip(c[0] + " (Global City)").addTo(glob);
    });
    L.control.layers(null, { "Megastädte (Größe = Einwohner)": mega, "Global Cities (Auswahl)": glob }, { collapsed: false }).addTo(map);
    note(el, "Einwohnerzahlen der Agglomerationen gerundet (Größenordnung, UN-Schätzung um 2018). Global Cities nach Sassen/GaWC als Auswahl: Steuerungszentren der Weltwirtschaft, nicht zwingend die größten Städte.");
  }

  /* ---------- Länder: Einkommensgruppen und BIP pro Kopf ---------- */
  var INCOME = { 1: ["#1e3a8a", "Hohes Einkommen (OECD)"], 2: ["#3b82f6", "Hohes Einkommen (Nicht-OECD)"], 3: ["#fbbf24", "Oberes mittleres Einkommen"], 4: ["#f97316", "Unteres mittleres Einkommen"], 5: ["#b91c1c", "Niedriges Einkommen"] };
  var BIP = [[30000, "#1e3a8a"], [12000, "#3b82f6"], [4000, "#fbbf24"], [1000, "#f97316"], [0, "#b91c1c"]];
  function bipColor(f) {
    if (!f.p || !f.g) return "#d1d5db";
    var v = f.g * 1e6 / f.p;
    for (var i = 0; i < BIP.length; i++) if (v >= BIP[i][0]) return BIP[i][1];
  }
  function laender(el) {
    var map = makeMap(el, "blank", [25, 10], 2);
    var ctrl = document.createElement("div");
    ctrl.className = "geoquiz-bar";
    ctrl.innerHTML = "Darstellung: <select aria-label=\"Darstellung\"><option value=\"i\">Einkommensgruppe (Weltbank)</option><option value=\"b\">BIP pro Kopf (US-$)</option></select>";
    el.parentNode.insertBefore(ctrl, el);
    var mode = "i", layer, leg;
    function style(ft) {
      var pr = ft.properties;
      return { color: "#fff", weight: 0.6, fillOpacity: 0.85, fillColor: mode === "i" ? INCOME[pr.i][0] : bipColor(pr) };
    }
    function draw() {
      layer.setStyle(style);
      if (leg) leg.remove();
      var h = "";
      if (mode === "i") Object.keys(INCOME).forEach(function (k) { h += swatch(INCOME[k][0], INCOME[k][1]); });
      else {
        h = swatch(BIP[0][1], "> 30.000") + swatch(BIP[1][1], "12.000–30.000") + swatch(BIP[2][1], "4.000–12.000") +
          swatch(BIP[3][1], "1.000–4.000") + swatch(BIP[4][1], "< 1.000") + swatch("#d1d5db", "keine Angabe");
      }
      leg = L.control({ position: "bottomleft" });
      leg.onAdd = function () { var d = L.DomUtil.create("div", "geomap-legend"); d.innerHTML = h; return d; };
      leg.addTo(map);
    }
    loadData("laender", function () {
      layer = L.geoJSON(window.GEOMAP_DATA.laender, {
        style: style,
        onEachFeature: function (ft, l) {
          var pr = ft.properties, v = pr.p && pr.g ? Math.round(pr.g * 1e6 / pr.p).toLocaleString("de-DE") + " US-$" : "k. A.";
          l.bindTooltip("<strong>" + esc(pr.n) + "</strong><br>" + INCOME[pr.i][1] + "<br>BIP/Kopf ≈ " + v, { sticky: true });
        }
      }).addTo(map);
      draw();
    });
    ctrl.querySelector("select").addEventListener("change", function (e) { mode = e.target.value; draw(); });
    note(el, "Daten: Natural Earth (vereinfachte Grenzen, Stand ca. 2019; Einkommensgruppen der Weltbank, BIP/Kopf = BIP geteilt durch Einwohner). Grenzen sind vereinfacht und politisch nicht verbindlich.");
  }

  var LAYERS = {
    plattengrenzen: plattengrenzen, eiszeit: eiszeit, klima: klima, swipe: swipe, quiz: quiz,
    einzugsgebiete: einzugsgebiete, staedte: staedte, laender: laender
  };
  Array.prototype.forEach.call(els, function (el) {
    (LAYERS[el.getAttribute("data-layer")] || placesLayer)(el);
  });
})();
