/* ============================================================
   Geografie Wiki — Interaktionen
   Theme, Sidebar, Suche, Favoriten, Zuletzt gesehen, TOC.
   Keine Abhängigkeiten. Läuft über file://.
   ============================================================ */
(function () {
  "use strict";

  var WIKI = (window.WIKI = window.WIKI || {});
  function getIndex() { return window.SEARCH_INDEX || []; }

  /* ---------- Raumbeispiel-Karte (Leaflet wird nur bei Bedarf geladen) ---------- */
  function loadScript(src, cb) {
    var s = document.createElement("script");
    s.src = src; s.onload = cb;
    document.head.appendChild(s);
  }
  function initGeomap() {
    if (!document.querySelector(".geomap")) return;
    var css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", function () {
      loadScript("assets/raumbeispiele.js", function () { loadScript("assets/karte.js"); });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initGeomap);
  else initGeomap();

  /* ---------- Startseite: drehende Weltkugel ---------- */
  function initGlobe() {
    if (!document.querySelector("canvas.globe")) return;
    loadScript("assets/land.js", function () { loadScript("assets/globus.js"); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initGlobe);
  else initGlobe();

  /* ---------- Skizzen: Animation beim Sichtbarwerden starten, Button zum Neustarten ---------- */
  function initSkizzen() {
    var figs = document.querySelectorAll("figure.skizze");
    if (!figs.length) return;
    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle("is-visible", e.isIntersecting); });
    }, { threshold: 0.25 }) : null;
    figs.forEach(function (f) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "sk-replay";
      b.textContent = "↻ Animation";
      b.title = "Animation neu starten";
      b.addEventListener("click", function () {
        var svg = f.querySelector(".sk-view.is-active svg") || f.querySelector("svg");
        var p = svg.parentNode;
        p.removeChild(svg);
        void p.offsetWidth;
        p.insertBefore(svg, p.firstChild);
        f.classList.add("is-visible");
      });
      f.querySelectorAll(".sk-tab").forEach(function (t) {
        t.addEventListener("click", function () {
          var n = t.getAttribute("data-view");
          f.querySelectorAll(".sk-tab").forEach(function (x) { x.classList.toggle("is-active", x === t); });
          f.querySelectorAll(".sk-view").forEach(function (v, k) { v.classList.toggle("is-active", String(k) === n); });
        });
      });
      f.appendChild(b);
      if (io) io.observe(f); else f.classList.add("is-visible");
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initSkizzen);
  else initSkizzen();

  /* ---------- Fotogalerien: Bilder live von Wikimedia Commons laden ---------- */
  function initGalleries() {
    document.querySelectorAll(".media-gallery").forEach(function (g) {
      var cat = g.getAttribute("data-cat"), q = g.getAttribute("data-q");
      var p = "action=query&format=json&origin=*&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=420&generator=";
      p += cat
        ? "categorymembers&gcmtype=file&gcmlimit=12&gcmtitle=" + encodeURIComponent(cat)
        : "search&gsrnamespace=6&gsrlimit=12&gsrsearch=" + encodeURIComponent(q + " filetype:bitmap");
      fetch("https://commons.wikimedia.org/w/api.php?" + p).then(function (r) { return r.json(); }).then(function (d) {
        var pages = Object.keys((d.query && d.query.pages) || {}).map(function (k) { return d.query.pages[k]; });
        pages.sort(function (a, b) { return (a.index || 0) - (b.index || 0); });
        var wrap = document.createElement("div");
        wrap.className = "mg-grid";
        pages.forEach(function (pg) {
          var ii = pg.imageinfo && pg.imageinfo[0];
          if (!ii || !/^image\/(jpeg|png|webp)/.test(ii.mime || "")) return;
          var m = ii.extmetadata || {};
          var strip = function (s) { var t = document.createElement("div"); t.innerHTML = s || ""; return t.textContent.trim(); };
          var a = document.createElement("a");
          a.href = ii.descriptionurl; a.target = "_blank"; a.rel = "noopener";
          var img = document.createElement("img");
          img.loading = "lazy"; img.src = ii.thumburl; img.alt = strip(m.ObjectName && m.ObjectName.value) || pg.title.replace(/^File:/, "");
          var cap = document.createElement("span");
          cap.textContent = [strip(m.Artist && m.Artist.value), strip(m.LicenseShortName && m.LicenseShortName.value)].filter(Boolean).join(" · ");
          a.appendChild(img); a.appendChild(cap); wrap.appendChild(a);
        });
        if (wrap.children.length) {
          var src = document.createElement("p");
          src.className = "mg-src";
          src.textContent = "Bilder: Wikimedia Commons (Urheber und Lizenz unter dem Bild; Klick öffnet die Quelle).";
          g.innerHTML = ""; g.appendChild(wrap); g.appendChild(src);
        }
      }).catch(function () {});
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initGalleries);
  else initGalleries();

  /* ---------- Theme ---------- */
  var THEME_KEY = "wiki-theme";
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
  }
  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  }
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    var next = cur === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
  }
  WIKI.toggleTheme = toggleTheme;

  /* ---------- Sidebar ---------- */
  var SIDE_KEY = "wiki-sidebar-collapsed";
  function isNarrow() { return window.innerWidth <= 1100; }

  var layout = document.querySelector(".layout");

  if (!isNarrow()) {
    try {
      if (localStorage.getItem(SIDE_KEY) === "1") layout.classList.add("collapsed");
    } catch (e) {}
  }

  document.querySelectorAll("[data-sidebar-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (isNarrow()) {
        layout.classList.toggle("mobile-open");
      } else {
        layout.classList.toggle("collapsed");
        try {
          localStorage.setItem(SIDE_KEY, layout.classList.contains("collapsed") ? "1" : "0");
        } catch (e) {}
      }
    });
  });

  var overlay = document.querySelector(".overlay");
  if (overlay) overlay.addEventListener("click", function () { layout.classList.remove("mobile-open"); });

  window.addEventListener("resize", function () {
    if (!isNarrow()) layout.classList.remove("mobile-open");
  });

  /* ---------- Kategorie-Baum auf-/zuklappen ---------- */
  document.querySelectorAll(".cat-toggle").forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    if (!panel) return;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.classList.toggle("open", !open);
    });
  });

  /* ---------- Suche ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function plain(html) {
    var d = document.createElement("div");
    d.innerHTML = html;
    return d.textContent || "";
  }

  function search(q, limit) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    var INDEX = getIndex();
    var terms = q.split(/\s+/);
    var scored = [];
    for (var i = 0; i < INDEX.length; i++) {
      var it = INDEX[i];
      var title = (it.t || "").toLowerCase();
      var desc = (it.d || "").toLowerCase();
      var text = (it.x || "").toLowerCase();
      var score = 0;
      var matchedAll = true;
      for (var j = 0; j < terms.length; j++) {
        var t = terms[j];
        if (title.indexOf(t) === 0) score += 10;
        else if (title.indexOf(t) > -1) score += 6;
        if (desc.indexOf(t) > -1) score += 3;
        if (text.indexOf(t) > -1) score += 1;
        if (title.indexOf(t) === -1 && desc.indexOf(t) === -1 && text.indexOf(t) === -1) {
          matchedAll = false;
        }
      }
      if (matchedAll && score > 0) scored.push({ it: it, score: score });
    }
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, limit || 8).map(function (s) { return s.it; });
  }

  function highlight(text, q) {
    var terms = q.trim().split(/\s+/).filter(Boolean).map(function (t) {
      return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    });
    if (!terms.length) return esc(text);
    var re = new RegExp("(" + terms.join("|") + ")", "gi");
    return esc(text).replace(re, "<mark>$1</mark>");
  }

  function renderResults(box, q) {
    var hits = search(q, 8);
    if (!hits.length) {
      box.innerHTML = '<div class="search-empty">Keine Treffer für „' + esc(q) +
        "“. Andere Schreibweise versuchen?</div>";
      box.classList.add("open");
      return;
    }
    var html = "";
    for (var i = 0; i < hits.length; i++) {
      var it = hits[i];
      html += '<a class="search-hit" href="' + esc(it.u) + '">' +
        '<div class="hit-title">' + highlight(it.t, q) + "</div>" +
        '<div class="hit-desc">' + highlight((it.c || "") + (it.c && it.d ? " · " : "") + (it.d || ""), q) + "</div>" +
        "</a>";
    }
    box.innerHTML = html;
    box.classList.add("open");
  }

  document.querySelectorAll("[data-search]").forEach(function (input) {
    var box = document.querySelector(input.getAttribute("data-results"));
    if (!box) return;
    var timer = null;
    input.addEventListener("input", function () {
      clearTimeout(timer);
      var q = input.value;
      if (!q.trim()) { box.classList.remove("open"); return; }
      timer = setTimeout(function () { renderResults(box, q); }, 120);
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { box.classList.remove("open"); input.blur(); }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        var hits = box.querySelectorAll(".search-hit");
        if (!hits.length) return;
        e.preventDefault();
        var cur = box.querySelector(".search-hit.active");
        var idx = cur ? Array.prototype.indexOf.call(hits, cur) : -1;
        if (cur) cur.classList.remove("active");
        var next = e.key === "ArrowDown"
          ? Math.min(idx + 1, hits.length - 1)
          : Math.max(idx - 1, 0);
        hits[next === -1 ? 0 : next].classList.add("active");
      }
      if (e.key === "Enter") {
        var act = box.querySelector(".search-hit.active");
        if (act) { e.preventDefault(); window.location.href = act.getAttribute("href"); }
      }
    });
    input.addEventListener("focus", function () {
      if (input.value.trim()) renderResults(box, input.value);
    });
    document.addEventListener("click", function (e) {
      if (!input.contains(e.target) && !box.contains(e.target)) box.classList.remove("open");
    });
  });

  /* ---------- Favoriten ---------- */
  var FAV_KEY = "wiki-favs";
  function getFavs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || "[]"); } catch (e) { return []; }
  }
  function setFavs(f) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(f)); } catch (e) {}
  }

  var slug = document.body.getAttribute("data-slug");
  var pageTitle = document.body.getAttribute("data-title") || document.title;

  function paintFavButtons() {
    var favs = getFavs();
    var isFav = favs.some(function (f) { return f.s === slug; });
    document.querySelectorAll("[data-fav]").forEach(function (btn) {
      btn.classList.toggle("on", isFav);
      btn.setAttribute("aria-pressed", String(isFav));
      btn.title = isFav ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen";
    });
  }

  document.querySelectorAll("[data-fav]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var favs = getFavs();
      var i = favs.findIndex(function (f) { return f.s === slug; });
      if (i > -1) favs.splice(i, 1);
      else favs.push({ s: slug, t: pageTitle });
      setFavs(favs);
      paintFavButtons();
      renderFavList();
    });
  });

  function renderFavList() {
    var box = document.getElementById("fav-list");
    if (!box) return;
    var favs = getFavs();
    if (!favs.length) {
      box.innerHTML = '<li class="recent-empty">Noch keine Favoriten — Stern auf einer Seite antippen.</li>';
      return;
    }
    box.innerHTML = favs.map(function (f) {
      return '<li><a href="' + esc(f.s) + '.html"' + (f.s === slug ? ' class="active"' : "") + ">" + esc(f.t) +
        '</a><button class="fav-star on" data-unfav="' + esc(f.s) + '" title="Entfernen">★</button></li>';
    }).join("");
    box.querySelectorAll("[data-unfav]").forEach(function (b) {
      b.addEventListener("click", function () {
        var favs = getFavs().filter(function (f) { return f.s !== b.getAttribute("data-unfav"); });
        setFavs(favs);
        paintFavButtons();
        renderFavList();
      });
    });
  }

  /* ---------- Zuletzt angesehen ---------- */
  var REC_KEY = "wiki-recent";
  function pushRecent() {
    if (!slug || slug === "index") return;
    var rec = [];
    try { rec = JSON.parse(localStorage.getItem(REC_KEY) || "[]"); } catch (e) {}
    rec = rec.filter(function (r) { return r.s !== slug; });
    rec.unshift({ s: slug, t: pageTitle });
    rec = rec.slice(0, 8);
    try { localStorage.setItem(REC_KEY, JSON.stringify(rec)); } catch (e) {}
    renderRecentList();
  }

  function renderRecentList() {
    var box = document.getElementById("recent-list");
    if (!box) return;
    var rec = [];
    try { rec = JSON.parse(localStorage.getItem(REC_KEY) || "[]"); } catch (e) {}
    if (!rec.length) {
      box.innerHTML = '<li class="recent-empty">Noch nichts angesehen — stöbere in den <a href="index.html">Kategorien</a>.</li>';
      return;
    }
    box.innerHTML = rec.map(function (r) {
      return '<li><a href="' + esc(r.s) + '.html"' + (r.s === slug ? ' class="active"' : "") + ">" + esc(r.t) +
        '</a><button class="recent-del" data-delrec="' + esc(r.s) + '" title="Entfernen">×</button></li>';
    }).join("");
    box.querySelectorAll("[data-delrec]").forEach(function (b) {
      b.addEventListener("click", function () {
        var rec = [];
        try { rec = JSON.parse(localStorage.getItem(REC_KEY) || "[]"); } catch (e) {}
        rec = rec.filter(function (r) { return r.s !== b.getAttribute("data-delrec"); });
        try { localStorage.setItem(REC_KEY, JSON.stringify(rec)); } catch (e) {}
        renderRecentList();
      });
    });
  }

  /* ---------- Link kopieren ---------- */
  document.querySelectorAll("[data-copy-link]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var url = window.location.href;
      var done = function () {
        var old = btn.innerHTML;
        btn.innerHTML = "✓ Kopiert";
        setTimeout(function () { btn.innerHTML = old; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { fallbackCopy(url, done); });
      } else {
        fallbackCopy(url, done);
      }
    });
  });

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- Inhaltsverzeichnis (rechts) ---------- */
  var body = document.querySelector(".wiki-body");
  var rail = document.getElementById("toc-rail-list");
  if (body && rail) {
    var heads = body.querySelectorAll("h2[id], h3[id]");
    if (heads.length) {
      rail.innerHTML = Array.prototype.map.call(heads, function (h) {
        var cls = h.tagName === "H3" ? "toc-h3" : "";
        return '<li class="' + cls + '"><a href="#' + h.id + '">' + esc(h.textContent) + "</a></li>";
      }).join("");
      var links = rail.querySelectorAll("a");
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) { l.classList.remove("active"); });
          var id = en.target.id;
          for (var i = 0; i < links.length; i++) {
            if (links[i].getAttribute("href") === "#" + id) links[i].classList.add("active");
          }
        });
      }, { rootMargin: "-80px 0px -70% 0px" });
      heads.forEach(function (h) { spy.observe(h); });
    } else {
      var r = document.querySelector(".toc-rail");
      if (r) r.style.display = "none";
    }
  }

  /* ---------- Init ---------- */
  paintFavButtons();
  renderFavList();
  renderRecentList();
  pushRecent();
})();
