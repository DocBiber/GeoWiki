/* Interaktive Karte der Raumbeispiele (Leaflet + OpenStreetMap).
   Wird von wiki.js nachgeladen, sobald ein Element .geomap auf der Seite steht. */
(function () {
  "use strict";
  var data = window.RAUMBEISPIELE;
  var el = document.querySelector(".geomap");
  if (!data || !el || !window.L) return;

  var map = L.map(el, { scrollWheelZoom: false }).setView([45, 10], 3);
  // OSM- und CARTO-Kacheln sind ohne Referer (file://) bzw. ohne API-Key gesperrt; Esri Topo funktioniert in beiden Fällen.
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 17,
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
  }).addTo(map);

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c];
    });
  }

  var only = el.getAttribute("data-type");
  var here = location.pathname.split("/").pop().replace(/\.html.*$/, "");
  var places = data.places.filter(function (p) { return !only || p.type === only; });

  var groups = {};
  var bounds = [];
  places.forEach(function (p) {
    var t = data.types[p.type];
    var m = L.circleMarker([p.lat, p.lng], {
      radius: 8, color: "#fff", weight: 2, fillColor: t.color, fillOpacity: 0.95
    });
    var link = p.page === here ? "" :
      "<br><a href=\"" + esc(p.page) + ".html\">Zur Raumbeispiel-Seite →</a>";
    m.bindPopup("<strong>" + esc(p.name) + "</strong><br>" + esc(t.label) + " – " + esc(p.note) + link);
    m.bindTooltip(p.name);
    (groups[p.type] = groups[p.type] || L.layerGroup()).addLayer(m);
    bounds.push([p.lat, p.lng]);
  });

  var overlays = {};
  Object.keys(data.types).forEach(function (k) {
    if (!groups[k]) return;
    groups[k].addTo(map);
    overlays["<span style=\"color:" + data.types[k].color + "\">●</span> " + data.types[k].label] = groups[k];
  });
  if (!only) L.control.layers(null, overlays, { collapsed: false }).addTo(map);
  map.fitBounds(bounds, { padding: [30, 30], maxZoom: 7 });
  el.addEventListener("click", function () { map.scrollWheelZoom.enable(); }, { once: true });
})();
