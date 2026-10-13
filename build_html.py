#!/usr/bin/env python3
"""build_html.py — HTML-Export für das GeoWiki.

Liest alle .md-Dateien (außer _backup/, SCHEMA.md, log.md) und schreibt für jede eine
.flache HTML-Datei ins Wurzelverzeichnis (wie im bestehenden Export).
Keine externen Abhängigkeiten (reines stdlib).

Aufruf: python build_html.py   (im Wiki-Wurzelverzeichnis ausführen)
"""
import os, re, html, glob, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
EXCLUDE_DIRS = {".git", "_backup_pre_language_tool_fix"}
EXCLUDE_FILES = {"SCHEMA.md", "README.md"}

CSS = """
    :root {
      --bg: #fafafa;
      --sidebar-bg: #f4f4f4;
      --text: #1a1a1a;
      --muted: #666;
      --border: #ddd;
      --link: #1a5fb4;
      --wikilink: #b45f06;
      --active-bg: #e8e8e8;
      --code-bg: #f0f0f0;
      --blockquote-border: #ccc;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      color: var(--text);
      background: var(--bg);
      margin: 0;
      padding: 0;
      display: flex;
      min-height: 100vh;
    }
    .sidebar {
      width: 280px;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border);
      padding: 1.5rem 1rem;
      overflow-y: auto;
      flex-shrink: 0;
    }
    .sidebar h2 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
      margin: 0 0 0.75rem 0;
      padding-bottom: 0.25rem;
      border-bottom: 1px solid var(--border);
    }
    .sidebar ul { list-style: none; padding: 0; margin: 0; }
    .sidebar li { margin: 0.2rem 0; font-size: 0.9rem; }
    .sidebar li a { color: var(--text); text-decoration: none; display: block; padding: 0.1rem 0; }
    .sidebar li a:hover { color: var(--link); }
    .sidebar li.active { background: var(--active-bg); border-radius: 3px; padding-left: 0.3rem; }
    .tag { font-size: 0.75rem; color: var(--muted); font-weight: normal; }
    .main { flex: 1; padding: 2rem 3rem; max-width: 900px; min-width: 0; }
    .main h1 { font-size: 1.8rem; margin-bottom: 0.3rem; border-bottom: 2px solid var(--link); padding-bottom: 0.4rem; }
    .main .meta { color: var(--muted); font-size: 0.85rem; margin-bottom: 1.5rem; display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .tag-badge { display: inline-block; background: #e6eef6; color: var(--link); font-size: 0.75rem; padding: 0.1rem 0.4rem; border-radius: 3px; margin-right: 0.3rem; }
    .wikilink { color: var(--wikilink); text-decoration: underline; text-decoration-style: dotted; }
    .wikilink:hover { color: #8a4400; }
    .wiki-table { border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 0.9rem; }
    .wiki-table th, .wiki-table td { border: 1px solid var(--border); padding: 0.4rem 0.6rem; text-align: left; vertical-align: top; }
    .wiki-table th { background: #f0f0f0; font-weight: 600; }
    .wiki-table tr:nth-child(even) td { background: #fafafa; }
    blockquote { border-left: 3px solid var(--blockquote-border); padding: 0.5rem 1rem; margin: 1rem 0; background: #f9f9f9; color: var(--muted); font-style: italic; }
    pre.codeblock { background: var(--code-bg); border: 1px solid var(--border); padding: 0.8rem; overflow-x: auto; font-size: 0.85rem; line-height: 1.3; white-space: pre; }
    code.inline-code { background: var(--code-bg); padding: 0.1rem 0.2rem; border-radius: 2px; font-size: 0.9em; }
    hr { border: none; border-top: 1px solid var(--border); margin: 1.5rem 0; }
    h2 { font-size: 1.3rem; margin-top: 1.5rem; color: var(--link); }
    h3 { font-size: 1.1rem; margin-top: 1.2rem; }
    h4 { font-size: 1rem; margin-top: 1rem; }
    p { margin: 0.6rem 0; }
    ul, ol { padding-left: 1.5rem; }
    li { margin: 0.2rem 0; }
    a { color: var(--link); }
    a:hover { text-decoration: underline; }
    .backlinks { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.85rem; }
    .backlinks h3 { font-size: 0.95rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
    .backlinks ul { columns: 2; column-gap: 1.5rem; padding-left: 0.5rem; }
    .backlinks li { margin: 0.15rem 0; break-inside: avoid; }
    .no-link { color: var(--muted); font-style: italic; }
    img { max-width: 100%; }
    @media (max-width: 768px) {
      body { flex-direction: column; }
      .sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--border); max-height: 200px; overflow-y: auto; }
      .main { padding: 1rem; }
      .backlinks ul { columns: 1; }
    }
"""


def parse_frontmatter(text):
    """Gibt (frontmatter-dict, body) zurück."""
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


def inline(text):
    """Inline-Transformationen: escapen, dann Fett, Kursiv, Code, Links, Wikilinks."""
    # Rohes HTML (iframes etc.) schützen
    placeholders = []

    def stash(m):
        placeholders.append(m.group(0))
        return f"\x00{len(placeholders)-1}\x00"
    text = re.sub(r"<iframe.*?</iframe>|<img[^>]*/?>|<br\s*/?>", stash, text, flags=re.S | re.I)

    text = html.escape(text, quote=False)

    def wiki(m):
        slug = m.group(1).strip()
        label = m.group(2).strip() if m.group(2) else slug
        return f'<a class="wikilink" href="{slug}.html">{html.escape(label, quote=True)}</a>'
    text = re.sub(r"\[\[([^\]|]+)(?:\|([^\]]+))?\]\]", wiki, text)

    text = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)",
                  lambda m: f'<img alt="{html.escape(m.group(1), quote=True)}" src="{m.group(2)}"/>', text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)",
                  lambda m: f'<a href="{m.group(2)}">{m.group(1)}</a>', text)

    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"<em>\1</em>", text)
    text = re.sub(r"`([^`]+)`", r'<code class="inline-code">\1</code>', text)

    for i, raw in enumerate(placeholders):
        text = text.replace(f"\x00{i}\x00", raw)
    return text


def md_to_html(body):
    lines = body.split("\n")
    out = []
    i = 0
    in_code = False
    code_buf = []
    in_list = None  # 'ul' | 'ol'

    def close_list():
        nonlocal in_list
        if in_list:
            out.append(f"</{in_list}>")
            in_list = None

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
            out.append(f"<h{lvl}>{inline(m.group(2))}</h{lvl}>")
            i += 1
            continue

        if re.match(r"^---+$", stripped):
            close_list()
            out.append("<hr/>")
            i += 1
            continue

        if stripped.startswith(">"):
            close_list()
            quote = re.sub(r"^>\s?", "", stripped)
            out.append(f"<blockquote>{inline(quote)}</blockquote>")
            i += 1
            continue

        # Tabelle: aktuelle + nächste Zeile sind | ... |, danach Trennzeile
        if stripped.startswith("|") and i + 1 < len(lines) and re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1]):
            close_list()
            header = [c.strip() for c in stripped.strip("|").split("|")]
            i += 2
            rows = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                rows.append([c.strip() for c in lines[i].strip().strip("|").split("|")])
                i += 1
            t = ['<table class="wiki-table"><thead><tr>']
            t += [f"<th>{inline(c)}</th>" for c in header]
            t.append("</tr></thead><tbody>")
            for r in rows:
                t.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>")
            t.append("</tbody></table>")
            out.append("".join(t))
            continue

        m = re.match(r"^(\s*)[-*]\s+(.*)$", line)
        if m:
            if in_list != "ul":
                close_list()
                out.append("<ul>")
                in_list = "ul"
            out.append(f"<li>{inline(m.group(2))}</li>")
            i += 1
            continue

        m = re.match(r"^(\s*)\d+\.\s+(.*)$", line)
        if m:
            if in_list != "ol":
                close_list()
                out.append("<ol>")
                in_list = "ol"
            out.append(f"<li>{inline(m.group(2))}</li>")
            i += 1
            continue

        if "<iframe" in line or "<img" in line.lower():
            close_list()
            out.append(line)
            i += 1
            continue

        close_list()
        out.append(f"<p>{inline(stripped)}</p>")
        i += 1

    close_list()
    return "\n".join(out)


def collect_pages():
    pages = []  # (slug, title, type, rel_path)
    for path in glob.glob(os.path.join(ROOT, "**", "*.md"), recursive=True):
        rel = os.path.relpath(path, ROOT)
        parts = rel.split(os.sep)
        if any(p in EXCLUDE_DIRS for p in parts[:-1]):
            continue
        if os.path.basename(path) in EXCLUDE_FILES:
            continue
        with open(path, encoding="utf-8") as f:
            fm, body = parse_frontmatter(f.read())
        slug = os.path.splitext(os.path.basename(path))[0]
        title = fm.get("title") or re.search(r"^#\s+(.*)$", body, re.M)
        title = title.group(1).strip() if hasattr(title, "group") else (title or slug)
        pages.append((slug, title, fm.get("type", "concept"), rel))
    pages.sort(key=lambda p: p[1].lower())
    return pages


def compute_backlinks(pages):
    """slug -> [titel der verlinkenden Seiten]"""
    links = {}
    texts = {}
    for slug, title, typ, rel in pages:
        with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
            texts[slug] = f.read()
    for slug, title, typ, rel in pages:
        for target, _, _, _ in pages:
            if target == slug:
                continue
            if re.search(r"\[\[" + re.escape(target) + r"(\]|\|)", texts[slug]):
                links.setdefault(target, []).append(title)
    return links


def render_page(slug, title, typ, body, all_pages, backlinks_map):
    body_html = md_to_html(body)

    sidebar = ['<aside class="sidebar">', '<h2>Wiki navigieren</h2>', '<ul>',
               '<li><a href="index.html">📖 Index</a> <span class="tag">[Übersicht]</span></li>',
               '</ul>', '<h2>Seiten nach Typ</h2>', '<ul>']
    for s, t, ty, _ in all_pages:
        cls = ' class="active"' if s == slug else ""
        label = f"<strong>{html.escape(t)}</strong>" if s == slug else html.escape(t)
        sidebar.append(f'<li{cls}><a href="{s}.html">{label}</a> <span class="tag">[{ty}]</span></li>')
    sidebar.append("</ul></aside>")

    bl = backlinks_map.get(slug, [])
    backlinks_html = ""
    if bl:
        items = "".join(f"<li>{html.escape(t)}</li>" for t in sorted(set(bl)))
        backlinks_html = f'<div class="backlinks"><h3>Verlinkt von</h3><ul>{items}</ul></div>'

    tags = []
    with open(os.path.join(ROOT, [p[3] for p in all_pages if p[0] == slug][0]), encoding="utf-8") as f:
        fm, _ = parse_frontmatter(f.read())
    for tag in re.findall(r"[\w-]+", fm.get("tags", "")):
        tags.append(f'<span class="tag-badge">{html.escape(tag)}</span>')

    return f"""<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>{html.escape(title)} — Geographie Wiki LK BW</title>
  <style>{CSS}</style>
</head>
<body>
  {''.join(sidebar)}
  <main class="main">
    <h1>{html.escape(title)}</h1>
    <div class="meta">
      <span>Typ: {html.escape(typ)}</span>
      <span style="margin-left:auto">{''.join(tags)}</span>
    </div>
    {body_html}
    {backlinks_html}
  </main>
</body>
</html>
"""


def main():
    pages = collect_pages()
    backlinks_map = compute_backlinks(pages)
    written = 0
    for slug, title, typ, rel in pages:
        with open(os.path.join(ROOT, rel), encoding="utf-8") as f:
            fm, body = parse_frontmatter(f.read())
        html_out = render_page(slug, title, typ, body, pages, backlinks_map)
        out_path = os.path.join(ROOT, slug + ".html")
        with open(out_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(html_out)
        written += 1
        print(f"  {slug}.html  ({typ})")
    print(f"\n{written} HTML-Dateien geschrieben.")


if __name__ == "__main__":
    main()
