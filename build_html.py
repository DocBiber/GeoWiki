#!/usr/bin/env python3
"""build_html.py — HTML-Export für das Geografie Wiki (Design v2).

Erzeugt aus den .md-Dateien:
- index.html            Startseite (Explore-Layout: Suche, Kategorien, Listen)
- <slug>.html           Artikelseiten (Header, Sidebar, Breadcrumb, TOC)
- assets/search-index.js  clientseitiger Suchindex (funktioniert über file://)

CSS (assets/style.css) und JS (assets/wiki.js) liegen als Dateien im Repo und
werden NICHT überschrieben — Designänderungen dort direkt möglich.

Aufruf: python build_html.py   (im Wiki-Wurzelverzeichnis)
"""
import os, re, html, glob, json, urllib.parse

ROOT = os.path.dirname(os.path.abspath(__file__))
EXCLUDE_DIRS = {".git", "_backup_pre_language_tool_fix"}
EXCLUDE_FILES = {"SCHEMA.md", "README.md"}
ASSETS = ("assets/style.css", "assets/wiki.js")
REPO_URL = "https://github.com/DocBiber/GeoWiki"
PAGES_URL = "https://docbiber.github.io/GeoWiki/"

# ---------------------------------------------------------------- Frontmatter

def parse_frontmatter(text):
    fm = {}
    if text.startswith("---"):
        m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", text, re.S)
        if m:
            for line in m.group(1).splitlines():
                kv = re.match(r"^(\w[\w-]*):\s*(.*)$", line)
                if kv:
                    fm[kv.group(1)] = kv.group(2).strip()
            return fm, m.group(2)
    return fm, text


# ---------------------------------------------------------------- Icons

ICONS = {
    "search": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="9" cy="9" r="5.5"/><path d="m13.5 13.5 3.5 3.5"/></svg>',
    "menu": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 5.5h14M3 10h14M3 14.5h14"/></svg>',
    "star": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M10 2.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 15.0l-4.94 2.6.94-5.5-4-3.9 5.53-.8z"/></svg>',
    "link": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M8.5 11.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5l-1 1"/><path d="M11.5 8.5a3.5 3.5 0 0 0-5 0l-2.5 2.5a3.5 3.5 0 0 0 5 5l1-1"/></svg>',
    "moon": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M16.5 12.5A7 7 0 0 1 7.5 3.5a7 7 0 1 0 9 9z"/></svg>',
    "github": '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 1.5a8.5 8.5 0 0 0-2.69 16.57c.42.08.58-.18.58-.4v-1.5c-2.2.44-2.66-1.06-2.66-1.06-.36-.92-.88-1.17-.88-1.17-.72-.49.05-.48.05-.48.8.06 1.22.82 1.22.82.7 1.2 1.85.85 2.3.65.07-.5.27-.85.5-1.05-1.76-.2-3.6-.88-3.6-3.9 0-.87.3-1.57.8-2.12-.08-.2-.35-1 .08-2.08 0 0 .65-.2 2.13.8a7.3 7.3 0 0 1 3.88 0c1.48-1 2.12-.8 2.12-.8.43 1.08.16 1.88.08 2.08.5.55.8 1.25.8 2.12 0 3.03-1.85 3.7-3.62 3.9.29.24.54.72.54 1.46v2.16c0 .22.16.49.59.4A8.5 8.5 0 0 0 10 1.5z"/></svg>',
    "home": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3.5 9 10 3.5 16.5 9v7.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1z"/><path d="M8 17.5v-5h4v5"/></svg>',
    "chevron": '<svg class="chev" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 6 6 4-6 4"/></svg>',
    "warn": '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 2.5 16.5h15z"/><path d="M10 8.5v3.5M10 14.5v.01"/></svg>',
}


# ---------------------------------------------------------------- Kategorien aus index.md

def parse_categories():
    """Liest index.md und gibt [{'name': …, 'pages': [(slug, beschreibung), …]}, …] zurück."""
    path = os.path.join(ROOT, "index.md")
    if not os.path.exists(path):
        return []
    text = open(path, encoding="utf-8").read()
    cats = []
    current = None
    for line in text.splitlines():
        h = re.match(r"^##\s+(.+)$", line.strip())
        if h:
            name = h.group(1).strip()
            if name.upper().startswith("NOCH LEER"):
                current = None
                continue
            current = {"name": name, "pages": []}
            cats.append(current)
            continue
        li = re.match(r"^-\s+\[\[([^\]|]+)\]\](?:\s*[—-]\s*(.*))?$", line.strip())
        if li and current is not None:
            current["pages"].append((li.group(1).strip(), (li.group(2) or "").strip()))
    return cats


def nice_cat_name(name):
    """Aus 'BODEN & WASSER (3.5.2.1 + 3.5.2.4)' wird 'Boden & Wasser'."""
    n = re.sub(r"\s*\([^)]*\)\s*$", "", name).strip()
    small = {"&", "UND", "IM", "FÜR", "DER", "DES"}
    words = []
    for i, w in enumerate(n.split()):
        if w.upper() in small and i > 0:
            words.append(w.lower())
        else:
            words.append(w.capitalize() if w.isupper() else w)
    return " ".join(words)


# ---------------------------------------------------------------- Markdown → HTML

def slugify(s):
    s = s.lower()
    s = (s.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue")
          .replace("ß", "ss"))
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_]+", "-", s.strip())
    return re.sub(r"-+", "-", s).strip("-")


def inline(text, known_slugs):
    placeholders = []

    def stash(m):
        placeholders.append(m.group(0))
        return f"\x00{len(placeholders)-1}\x00"
    text = re.sub(r"<iframe.*?</iframe>|<img[^>]*/?>|<br\s*/?>", stash, text, flags=re.S | re.I)

    def stash_code(m):
        placeholders.append(
            f'<code class="inline-code">{html.escape(m.group(1), quote=False)}</code>')
        return f"\x00{len(placeholders)-1}\x00"
    text = re.sub(r"`([^`]+)`", stash_code, text)

    text = html.escape(text, quote=False)

    def wiki(m):
        slug = m.group(1).strip()
        label = (m.group(2) or slug).strip()
        if slug in known_slugs:
            return (f'<a class="wikilink" href="{slug}.html" '
                    f'title="{html.escape(label, quote=True)}">{html.escape(label, quote=True)}</a>')
        return (f'<a class="wikilink wikilink-broken" '
                f'title="Diese Seite existiert noch nicht: {html.escape(slug, quote=True)}">'
                f'{html.escape(label, quote=True)}</a>')
    text = re.sub(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]", wiki, text)

    text = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)",
                  lambda m: f'<img alt="{html.escape(m.group(1), quote=True)}" src="{m.group(2)}"/>', text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)",
                  lambda m: f'<a href="{m.group(2)}">{m.group(1)}</a>', text)

    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"<em>\1</em>", text)
    for i, raw in enumerate(placeholders):
        text = text.replace(f"\x00{i}\x00", raw)
    return text


CALLOUT_RE = re.compile(r"^\*\*(wichtig|hinweis|achtung|tipp|quellen?)\s*:?\*\*:?\s*(.*)$", re.I)


def md_to_html(body, known_slugs, page_title):
    lines = body.split("\n")
    out = []
    i = 0
    in_code = False
    code_buf = []
    in_list = None
    first_h1_skipped = False
    used_ids = set()

    def close_list():
        nonlocal in_list
        if in_list:
            out.append(f"</{in_list}>")
            in_list = None

    def head_id(text, lvl):
        base = slugify(re.sub(r"<[^>]+>", "", text)) or f"sec{lvl}"
        hid, n = base, 2
        while hid in used_ids:
            hid, n = f"{base}-{n}", n + 1
        used_ids.add(hid)
        return hid

    while i < len(lines):
        line = lines[i]

        if line.strip().startswith("```"):
            if in_code:
                out.append(f'<pre class="codeblock">{html.escape(chr(10).join(code_buf))}</pre>')
                in_code = False
                code_buf = []
            else:
                close_list()
                in_code = True
            i += 1
            continue
        if in_code:
            code_buf.append(line)
            i += 1
            continue

        stripped = line.strip()

        if not stripped:
            close_list()
            i += 1
            continue

        m = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if m:
            close_list()
            lvl = len(m.group(1))
            content = inline(m.group(2), known_slugs)
            if lvl == 1:
                # Doppelten Seitentitel im Körper unterdrücken
                if not first_h1_skipped and re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", content)).strip().lower() == \
                        re.sub(r"\s+", " ", page_title).strip().lower():
                    first_h1_skipped = True
                    i += 1
                    continue
                first_h1_skipped = True
            hid = head_id(content, lvl) if lvl in (2, 3) else ""
            idattr = f' id="{hid}"' if hid else ""
            out.append(f"<h{lvl}{idattr}>{content}</h{lvl}>")
            i += 1
            continue

        if re.match(r"^---+$", stripped):
            close_list()
            out.append("<hr/>")
            i += 1
            continue

        if stripped.startswith(">"):
            close_list()
            quote_lines = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote_lines.append(re.sub(r"^>\s?", "", lines[i].strip()))
                i += 1
            joined = " ".join(quote_lines)
            cm = CALLOUT_RE.match(joined)
            if cm:
                rest_html = inline(joined[cm.end():].strip(), known_slugs)
                out.append(
                    '<div class="callout"><div class="callout-label">'
                    + ICONS["warn"] + html.escape(cm.group(1).capitalize()) +
                    "</div><div>" + rest_html + "</div></div>")
            else:
                out.append(f"<blockquote>{inline(joined, known_slugs)}</blockquote>")
            continue

        if stripped.startswith("|") and i + 1 < len(lines) and re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1]):
            close_list()
            header = [c.strip() for c in stripped.strip("|").split("|")]
            i += 2
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")])
                i += 1
            t = ['<table class="wiki-table"><thead><tr>']
            t += [f"<th>{inline(c, known_slugs)}</th>" for c in header]
            t.append("</tr></thead><tbody>")
            for r in rows:
                t.append("<tr>" + "".join(f"<td>{inline(c, known_slugs)}</td>" for c in r) + "</tr>")
            t.append("</tbody></table>")
            out.append("".join(t))
            continue

        m = re.match(r"^(\s*)[-*]\s+(.*)$", line)
        if m:
            if in_list != "ul":
                close_list()
                out.append("<ul>")
                in_list = "ul"
            out.append(f"<li>{inline(m.group(2), known_slugs)}</li>")
            i += 1
            continue

        m = re.match(r"^(\s*)\d+\.\s+(.*)$", line)
        if m:
            if in_list != "ol":
                close_list()
                out.append("<ol>")
                in_list = "ol"
            out.append(f"<li>{inline(m.group(2), known_slugs)}</li>")
            i += 1
            continue

        if "<iframe" in line:
            close_list()
            out.append(f'<div class="video-frame">{line}</div>')
            i += 1
            continue

        m_sk = re.fullmatch(r'\{\{skizze:([^|}]+)(?:\|(.*))?\}\}', stripped)
        if m_sk:
            close_list()
            base = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "skizzen")
            parts = [p.strip() for p in m_sk.group(1).split("+")]
            views = []
            for p in parts:
                name, _, label = p.partition(":")
                with open(os.path.join(base, name + ".svg"), encoding="utf-8") as fh:
                    views.append((label or name, fh.read().strip()))
            cap = f"<figcaption>{inline(m_sk.group(2), known_slugs)}</figcaption>" if m_sk.group(2) else ""
            if len(views) == 1:
                out.append(f'<figure class="skizze">{views[0][1]}{cap}</figure>')
            else:
                tabs = "".join(
                    f'<button type="button" role="tab" class="sk-tab{" is-active" if n == 0 else ""}" data-view="{n}">{html.escape(lab)}</button>'
                    for n, (lab, _) in enumerate(views)
                )
                body = "".join(
                    f'<div class="sk-view{" is-active" if n == 0 else ""}">{svg}</div>' for n, (_, svg) in enumerate(views)
                )
                out.append(f'<figure class="skizze skizze-multi"><div class="sk-tabs" role="tablist">{tabs}</div>{body}{cap}</figure>')
            i += 1
            continue

        if re.fullmatch(r'<div class="geomap"(?: data-[a-z-]+="[^"]*")*></div>', stripped):
            close_list()
            out.append(stripped)
            i += 1
            continue

        m_med = re.fullmatch(r"\[([^\]]*)\]\((https://(?:commons\.wikimedia\.org/wiki/|unsplash\.com/s/photos/)[^)\s]+)\)", stripped)
        if m_med:
            label, url = m_med.group(1), m_med.group(2)
            label_e, url_e = html.escape(label), html.escape(url)
            m_file = re.match(r"https://commons\.wikimedia\.org/wiki/File:(.+)$", url)
            m_cat = re.match(r"https://commons\.wikimedia\.org/wiki/(Category:.+)$", url)
            m_uns = re.match(r"https://unsplash\.com/s/photos/([^/?#]+)$", url)
            if m_file:
                close_list()
                out.append(
                    f'<figure class="media-img"><a href="{url_e}" target="_blank" rel="noopener">'
                    f'<img loading="lazy" src="https://commons.wikimedia.org/wiki/Special:FilePath/{html.escape(m_file.group(1))}?width=900" alt="{label_e}"></a>'
                    f"<figcaption>{label_e} · Wikimedia Commons</figcaption></figure>"
                )
                i += 1
                continue
            if m_cat or m_uns:
                close_list()
                attr = (f'data-cat="{html.escape(urllib.parse.unquote(m_cat.group(1)).replace("_", " "))}"' if m_cat
                        else f'data-q="{html.escape(m_uns.group(1).replace("-", " "))}"')
                out.append(
                    f'<div class="media-gallery" {attr}><p class="mg-fallback"><a href="{url_e}" target="_blank" rel="noopener">{label_e}</a></p>'
                    f'<noscript></noscript></div>'
                )
                i += 1
                continue

        if "<img" in line.lower():
            close_list()
            out.append(line)
            i += 1
            continue

        close_list()
        out.append(f"<p>{inline(stripped, known_slugs)}</p>")
        i += 1

    close_list()
    return "\n".join(out)


# ---------------------------------------------------------------- Seiten sammeln

def collect_pages():
    pages = {}
    for path in glob.glob(os.path.join(ROOT, "**", "*.md"), recursive=True):
        rel = os.path.relpath(path, ROOT)
        parts = rel.split(os.sep)
        if any(p in EXCLUDE_DIRS for p in parts[:-1]):
            continue
        if os.path.basename(path) in EXCLUDE_FILES:
            continue
        slug = os.path.splitext(os.path.basename(path))[0]
        fm, body = parse_frontmatter(open(path, encoding="utf-8").read())
        title = fm.get("title", "").strip()
        if not title:
            hm = re.search(r"^#\s+(.*)$", body, re.M)
            title = hm.group(1).strip() if hm else slug
        title = re.sub(r"\s+", " ", title).strip()
        pages[slug] = {
            "slug": slug, "rel": rel, "fm": fm, "body": body, "title": title,
            "type": fm.get("type", "concept"),
            "updated": fm.get("updated") or fm.get("created") or "",
            "created": fm.get("created") or "",
            "tags": [t.strip() for t in re.split(r"[,\[\]]+", fm.get("tags", "")) if t.strip()],
        }
    return pages


def first_paragraph(body):
    """Kurzbeschreibung: Blockquote-Einleitung nach dem ersten H1,
    sonst erster echter Prosa-Absatz (Bild-/Quellen-/Tabellenzeilen werden übersprungen)."""
    # 1) Einleitungs-Blockquote direkt nach dem ersten H1
    lines = body.split("\n")
    h1_seen = False
    for i, line in enumerate(lines):
        s = line.strip()
        if s.startswith("# ") and not h1_seen:
            h1_seen = True
            continue
        if h1_seen and s.startswith(">"):
            parts = []
            for l in lines[i:]:
                ls = l.strip()
                if not ls.startswith(">"):
                    if not ls:
                        continue
                    break
                parts.append(ls.lstrip("> ").strip())
            if parts:
                return " ".join(p for p in parts if p)[:220]
    # 2) erster Prosa-Absatz
    for line in lines:
        s = line.strip()
        if not s or s.startswith(("#", "---", ">", "![", "|")):
            continue
        if s.startswith("*Bild:") or s.startswith("*Quelle:"):
            continue
        s = re.sub(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]", lambda m: m.group(2) or m.group(1), s)
        s = re.sub(r"[*`]", "", s)
        if len(s) > 15:
            return s[:220]
    return ""


def plain_text(body):
    text = re.sub(r"<iframe.*?</iframe>", " ", body, flags=re.S)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)
    text = re.sub(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]", lambda m: m.group(2) or m.group(1), text)
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"[#*`>|]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def compute_backlinks(pages):
    links = {}
    for slug, p in pages.items():
        for target in pages:
            if target == slug:
                continue
            if re.search(r"\[\[" + re.escape(target) + r"(\]|\|)", p["body"]):
                links.setdefault(target, []).append(p["title"])
    return links


# ---------------------------------------------------------------- Layout-Bausteine

def header_html():
    return f'''<header class="header">
  <button class="header-menu-btn" data-sidebar-toggle aria-label="Navigation umschalten">{ICONS["menu"]}</button>
  <a class="brand" href="index.html"><span class="brand-mark">G</span><span class="brand-name">Geografie&nbsp;Wiki</span><span class="brand-sub">Geographie LK BW</span></a>
  <div class="header-search">
    <span class="search-icon">{ICONS["search"]}</span>
    <input type="search" data-search data-results=".header-search .search-results"
           placeholder="Suchen …" aria-label="Wiki durchsuchen" autocomplete="off">
    <div class="search-results" role="listbox"></div>
  </div>
  <div class="header-actions">
    <a class="icon-btn" href="{REPO_URL}" target="_blank" rel="noopener" title="GitHub-Repository" aria-label="GitHub-Repository">{ICONS["github"]}</a>
    <button class="icon-btn" onclick="window.WIKI.toggleTheme()" title="Dark Mode umschalten" aria-label="Dark Mode umschalten">{ICONS["moon"]}</button>
  </div>
</header>'''


def sidebar_html(pages, cats, current_slug):
    items = []
    items.append('<a class="nav-home" href="index.html">' + ICONS["home"] + ' Startseite</a>')

    if cats:
        items.append("<h3>Themen</h3>")
        for idx, cat in enumerate(cats):
            open_default = any(s == current_slug for s, _ in cat["pages"])
            panel_id = f"cat-panel-{idx}"
            items.append(
                f'<button class="cat-toggle cat-{idx}" aria-expanded="{"true" if open_default else "false"}" '
                f'aria-controls="{panel_id}">{ICONS["chevron"]}<span class="cat-dot"></span>'
                f'<span>{html.escape(nice_cat_name(cat["name"]))}</span>'
                f'<span class="cat-count">{len(cat["pages"])}</span></button>')
            lis = []
            for slug, desc in cat["pages"]:
                cls = ' class="active"' if slug == current_slug else ""
                label = pages[slug]["title"] if slug in pages else slug
                lis.append(
                    f'<li><a href="{slug}.html"{cls}>{html.escape(label)}</a>'
                    f'<button class="fav-star" data-fav="{slug}" title="Zu Favoriten">★</button></li>')
            items.append(f'<ul class="cat-items{" open" if open_default else ""}" id="{panel_id}">'
                         + "".join(lis) + "</ul>")

    items.append("<h3>Favoriten</h3>")
    items.append('<ul id="fav-list"></ul>')

    items.append("<h3>Zuletzt angesehen</h3>")
    items.append('<ul id="recent-list"></ul>')

    items.append("<h3>Links</h3>")
    items.append(f'<a class="ext-link" href="{REPO_URL}" target="_blank" rel="noopener">{ICONS["github"]} Repository</a>')
    items.append(f'<a class="ext-link" href="{PAGES_URL}" target="_blank" rel="noopener">{ICONS["link"]} Online-Version</a>')

    return '<aside class="sidebar">' + "".join(items) + "</aside>"


def page(title, body_html):
    return f'''<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>{html.escape(title)} — Geografie Wiki</title>
  <link rel="stylesheet" href="assets/style.css"/>
</head>
<body>
{header_html()}
{body_html}
<script src="assets/search-index.js"></script>
<script src="assets/wiki.js"></script>
</body>
</html>
'''


def meta_html(p, cat_name):
    tags = "".join(f'<span class="tag-badge">{html.escape(t)}</span>' for t in p["tags"][:6])
    updated = f' · aktualisiert {html.escape(p["updated"])}' if p["updated"] else ""
    created = f'erstellt {html.escape(p["created"])}' if p["created"] else ""
    return f'''<div class="page-meta">
  <span class="type-badge">{html.escape(p["type"])}</span>
  {tags}
  <span>{html.escape(cat_name or "")}{" · " if cat_name and (created or updated) else ""}{html.escape(created)}{updated}</span>
  <div class="page-actions">
    <button class="text-btn" data-fav title="Zu Favoriten">{ICONS["star"]} Favorit</button>
    <button class="text-btn" data-copy-link title="Link kopieren">{ICONS["link"]} Link kopieren</button>
  </div>
</div>'''


def breadcrumb_html(cat_name, title, cat_idx=None):
    parts = ['<a href="index.html">Startseite</a>']
    if cat_name:
        chip_cls = f'cat-chip cat-{cat_idx}' if cat_idx is not None else "cat-chip"
        parts.append(f'<a class="{chip_cls}" href="index.html#cat-{slugify(cat_name)}">{html.escape(nice_cat_name(cat_name))}</a>')
    parts.append(f'<span class="current">{html.escape(title)}</span>')
    return '<nav class="breadcrumb" aria-label="Brotkrumen">' + \
        ' <span class="sep">/</span> '.join(parts) + "</nav>"


# ---------------------------------------------------------------- Suchindex

def build_search_index(pages, cats):
    cat_of = {}
    for cat in cats:
        for slug, _ in cat["pages"]:
            cat_of[slug] = nice_cat_name(cat["name"])
    entries = []
    for slug, p in pages.items():
        desc = first_paragraph(p["body"])
        excerpt = plain_text(p["body"])[:400]
        entries.append({
            "t": p["title"], "u": slug + ".html",
            "c": cat_of.get(slug, p["type"]), "d": desc, "x": excerpt,
        })
    js = "window.SEARCH_INDEX = " + json.dumps(entries, ensure_ascii=False, indent=0) + ";\n"
    with open(os.path.join(ROOT, "assets", "search-index.js"), "w", encoding="utf-8", newline="\n") as f:
        f.write(js)
    return len(entries)


# ---------------------------------------------------------------- Startseite

def build_home(pages, cats, backlinks):
    # Begrüßungstext aus index.md
    idx_text = ""
    if "index" in pages:
        m = re.search(r"^>\s*(.+?)(?:\n\s*\n|\n>|$)", pages["index"]["body"], re.S | re.M)
        if m:
            idx_text = " ".join(l.strip("> ") for l in m.group(1).splitlines() if l.strip())
    idx_text = idx_text or "Persönliche Wissensbasis für den Geographie-Leistungskurs in Baden-Württemberg."

    # Kategorien-Karten
    cards = []
    for idx, cat in enumerate(cats):
        anchor = f"cat-{slugify(cat['name'])}"
        sample = cat["pages"][0][1] if cat["pages"] and cat["pages"][0][1] else ""
        first_slug = cat["pages"][0][0] if cat["pages"] else "index"
        cards.append(
            f'<a class="cat-card cat-{idx}" id="{anchor}" href="{first_slug}.html">'
            f'<div class="cat-name">{html.escape(nice_cat_name(cat["name"]))}</div>'
            f'<div class="cat-n">{len(cat["pages"])} Artikel</div>'
            f'<div class="cat-sample">{html.escape(sample[:110])}</div></a>')

    # Zuletzt aktualisiert
    updated = sorted(
        [p for p in pages.values() if p["slug"] != "index" and p["updated"]],
        key=lambda p: p["updated"], reverse=True)[:6]
    upd_list = "".join(
        f'<li><a href="{p["slug"]}.html">{html.escape(p["title"])}</a>'
        f'<span class="item-date">{html.escape(p["updated"])}</span></li>' for p in updated)

    # Häufig verlinkt
    counts = sorted(backlinks.items(), key=lambda kv: len(kv[1]), reverse=True)
    linked = [(s, len(t)) for s, t in counts if s in pages and s != "index"][:6]
    link_list = "".join(
        f'<li><a href="{s}.html">{html.escape(pages[s]["title"])}</a>'
        f'<span class="item-count">{n}× verlinkt</span></li>' for s, n in linked)

    # Neu
    new_pages = [p for p in pages.values()
                 if p["created"] >= "2026-10-01" and p["slug"] != "index"]
    new_strip = ""
    if new_pages:
        links = " · ".join(f'<a href="{p["slug"]}.html">{html.escape(p["title"])}</a>'
                           for p in new_pages[:4])
        new_strip = f'<div class="new-strip"><span class="new-label">Neu im Wiki:</span>{links}</div>'

    body = f'''<div class="layout" data-slug="index">
  <div class="overlay"></div>
{sidebar_html(pages, cats, "index")}
  <main class="content">
    <div class="content-inner">
      <section class="hero hero-with-globe">
        <div class="hero-text">
        <h1>Geografie Wiki</h1>
        <p>{html.escape(idx_text)}</p>
        <div class="hero-search">
          <span class="search-icon">{ICONS["search"]}</span>
          <input type="search" data-search data-results=".hero-search .hero-results"
                 placeholder="Wonach suchst du?" aria-label="Wiki durchsuchen" autocomplete="off">
          <div class="search-results hero-results"></div>
        </div>
        </div>
        <canvas class="globe" aria-label="Sich drehende Weltkugel" role="img" title="Ziehen, um die Erde zu drehen"></canvas>
      </section>

      {new_strip}

      <section class="section">
        <div class="section-head"><h2>Themen</h2><span class="section-sub">{len(cats)} Kategorien · {len(pages)} Artikel</span></div>
        <div class="cat-grid">{"".join(cards)}</div>
      </section>

      <div class="two-col">
        <section class="section">
          <div class="section-head"><h2>Zuletzt aktualisiert</h2></div>
          <ul class="list-card">{upd_list}</ul>
        </section>
        <section class="section">
          <div class="section-head"><h2>Häufig verlinkt</h2><span class="section-sub">zentrale Artikel</span></div>
          <ul class="list-card">{link_list}</ul>
        </section>
      </div>

      <p class="footer-note">Bildungsplan 2016 (LK Geografie BW) · lokal nutzbar über <code class="inline-code">index.html</code> · online unter <a href="{PAGES_URL}" target="_blank" rel="noopener">docbiber.github.io/GeoWiki</a></p>
    </div>
  </main>
</div>'''
    return page("Geografie Wiki — Leistungskurs BW", body)


# ---------------------------------------------------------------- Artikelseite

def build_article(p, pages, cats, backlinks):
    known = set(pages)
    cat_name = None
    for cat in cats:
        if p["slug"] in [s for s, _ in cat["pages"]]:
            cat_name = cat["name"]
            break

    body_html = md_to_html(p["body"], known, p["title"])
    desc = first_paragraph(p["body"])

    cat_name = None
    cat_idx = None
    for i, cat in enumerate(cats):
        if p["slug"] in [s for s, _ in cat["pages"]]:
            cat_name = cat["name"]
            cat_idx = i
            break

    h23 = re.findall(r"<h([23]) id=\"([^\"]+)\">(.*?)</h\1>", body_html, re.S)
    toc_mobile = ""
    if h23:
        lis = "".join(
            f'<li><a href="#{hid}">{re.sub(r"<[^>]+>", "", txt)}</a></li>'
            for _, hid, txt in h23)
        toc_mobile = f'<details class="toc-mobile"><summary>Inhalt</summary><ul>{lis}</ul></details>'

    bl = backlinks.get(p["slug"], [])
    bl_html = ""
    if bl:
        lis = "".join(f"<li>{html.escape(t)}</li>" for t in sorted(set(bl)))
        bl_html = f'<div class="backlinks"><h3>Verlinkt von</h3><ul>{lis}</ul></div>'

    toc_rail = f'''<div class="toc-rail"><div class="toc-rail-inner">
  <h3>Auf dieser Seite</h3><ul id="toc-rail-list"></ul>
</div></div>''' if h23 else ""

    body = f'''<div class="layout" data-slug="{p["slug"]}" data-title="{html.escape(p["title"], quote=True)}">
  <div class="overlay"></div>
{sidebar_html(pages, cats, p["slug"])}
  <main class="content">
    <div class="content-inner">
      {breadcrumb_html(cat_name, p["title"], cat_idx)}
      <div class="page-head">
        <div class="page-title-row">
          <h1>{html.escape(p["title"])}</h1>
          <button class="fav-btn" data-fav aria-label="Zu Favoriten">{ICONS["star"]}</button>
        </div>
        <p class="page-desc">{html.escape(desc)}</p>
        {meta_html(p, cat_name)}
      </div>
      {toc_mobile}
      <article class="wiki-body">
{body_html}
      </article>
      {bl_html}
    </div>
    {toc_rail}
  </main>
</div>'''
    return page(p["title"], body)


def build_schema(pages, cats):
    schema_path = os.path.join(ROOT, "SCHEMA.md")
    body = open(schema_path, encoding="utf-8").read()
    fm, body = parse_frontmatter(body)
    title = fm.get("title", "").strip()
    if not title:
        match = re.search(r"^#\s+(.*)$", body, re.M)
        title = match.group(1).strip() if match else "Wiki Schema"
    schema = {
        "slug": "schema", "title": title, "body": body, "type": "documentation",
        "updated": fm.get("updated", ""), "created": fm.get("created", ""),
        "tags": [],
    }
    rendered = build_article(schema, pages, cats, {})
    return re.sub(r"(?m)^[ \t]+$", "", rendered)


# ---------------------------------------------------------------- Hauptlauf

def main():
    pages = collect_pages()
    cats = parse_categories()
    backlinks = compute_backlinks(pages)
    os.makedirs(os.path.join(ROOT, "assets"), exist_ok=True)

    n_idx = build_search_index(pages, cats)

    with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8", newline="\n") as f:
        f.write(build_home(pages, cats, backlinks))

    written = 1
    for slug, p in pages.items():
        if slug == "index":
            continue
        with open(os.path.join(ROOT, slug + ".html"), "w", encoding="utf-8", newline="\n") as f:
            f.write(build_article(p, pages, cats, backlinks))
        written += 1

    with open(os.path.join(ROOT, "SCHEMA.html"), "w", encoding="utf-8", newline="\n") as f:
        f.write(build_schema(pages, cats))

    print(f"Startseite + {written - 1} Artikelseiten geschrieben; Suchindex: {n_idx} Einträge.")
    for a in ASSETS:
        path = os.path.join(ROOT, a)
        print(f"  {'OK ' if os.path.exists(path) else 'FEHLT'} {a}")


if __name__ == "__main__":
    main()
