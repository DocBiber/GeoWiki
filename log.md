# Wiki Log

> Chronologischer Aktionsjournal. Nur-Ergänzung. Nicht löschen.
> Format: `## [JJJJ-MM-TT] aktion | betreff`
> Aktionen: ingest, update, query, lint, create, archive, delete
> Bei >500 Einträgen: rotieren → `log-YYYY.md`, neu starten.

## [2026-09-27] create | Wiki initialisiert
- Domain: Physische Geografie LK BW (Vulkansimus, Glazialmorphologie, Vulnerabilität)
- Bildungsplan 2016-Leistungskurs (Gymnasium), Fassung V2 2023
- Aufbau: SCHEMA.md, index.md, log.md + Unterordner für Rohquellen und Wiki-Ebenen
- Quelle: bildungsplaene-bw.de (Vulv.-/Glaz.-Kompetenzen §3.4.3.2, §3.5)
- Nächste Schritte: Rohquellen zu Vulkansimus, Glazialmorphologie, Vulnerabilität einsammeln

## [2026-09-27] create | 14 Wiki-Seiten angelegt + Struktur vollendet
- domains: Vulkansimus, Glazialmorphologie, Vulnerabilität, Bildungsplan, Abitur
- Seiten:
  - entities/bildungsplan-2016-lk.md
  - entities/vulkanarten.md
  - entities/abitur-ubersicht-lk.md
  - concepts/vulkanismus-ueberblick.md
  - concepts/vulkanprozesse.md
  - concepts/glazialmorphologie-ueberblick.md
  - concepts/glaziale-serie.md
  - concepts/moränen-und-gletscherformen.md
  - concepts/permafrost-und-solifluktion.md
  - concepts/vulnerabilitaet-begriffe.md
  - concepts/vulnerabilitaet-raumbeispiele.md
  - concepts/resilienz-massnahmen.md
  - concepts/vulnerabilitaet-vulkanraume.md
  - comparisons/vergleich-vulkan-gletscher-prozesse.md
- index.md + SCHEMA.md + log.md vorhanden
- Quellenreihen: Bildungsplan-BW (offiziell), ESKP, Serlo, Wikipedia, Geohilfe
- Nächste Schritte: mehr Raumbeispiele, Diagramme, Abituraufgaben, ggf. Obsidian-Vault

## [2026-09-27] create | Skizzen + Raumbeispiele + Abitur-Aufgaben + Übungsaufgaben
- concepts/skizzen/uebersicht-skizzen.md — 6 Skizzen (Glaziale Serie, Vulkanformen, Vulnerabilitätsmodell, Gletscher-Querschnitt, Trogtal vs. Flusstal, Vulkan-Ausbruch-Schema)
- concepts/raumbeispiele/vulkan-raumbeispiele.md — Vesuv, Kilauea, Laacher See, Eyafjöll + Vergleichstabelle
- concepts/raumbeispiele/glazial-raumbeispiele.md — Alpen (Aletsch), Norddeutsches Tiefland, Island (Vatnajökull) + Vergleichstabelle
- concepts/raumbeispiele/uebersicht-raumbeispiele.md — Übersicht alle 5 Landschaften + Auswahl-Tabelle LK-Abitur
- exercises/abitur-aufgaben.md — 4 Abitur-Muster-Aufgaben mit Lösungshinweisen + Bewertungsaspekte
- exercises/uebungsaufgaben.md — 16 Übungsaufgaben (Stufen 1–3, nach Operatoren gegliedert)
- Nächste Schritte: Flusslandschaft, Küstenlandschaft, Karstlandschaft (Raumbeispiele), ggf. JSON-Export für Obsidian

## [2026-10-13] create | Flusslandschaft als Raumbeispiel angelegt (M5 begonnen)
- concepts/raumbeispiele/fluss-raumbeispiele.md — 3 Beispiele: Elbe-Hochwasser 2002 (Vb-Wetterlage, Verwundbarkeit der Aue), Rhein (Tulla-Regulierung, Sohlenerosion, Rückhaltebecken, IKSR), Donaudelta (Sedimentstau, Überschwemmungspulse, Ökosystemleistungen) + Vergleichstabelle + LK-Hinweisen
- index.md: Eintrag ergänzt, aus „NOCH LEER" entfernt
- uebersicht-raumbeispiele.md: Flusszeile auf Live-Status gesetzt, Verknüpfung ergänzt
- SCHEMA.md: Tag fluss-raumbeispiele in Taxonomie eingetragen
- Medien: Unsplash-/Commons-Galerien verlinkt; YouTube-Animationen folgen beim nächsten Medienlauf (M3-Muster)
- Nächste Schritte: Küstenlandschaft, Karstlandschaft-Raumbeispiele, YouTube-Medien für Flussseite

## [2026-10-13] create | Küstenlandschaft als Raumbeispiel angelegt (M5 fortgesetzt)
- concepts/raumbeispiele/kuesten-raumbeispiele.md — 4 Beispiele: Nordsee (Sturmfluten 1954/1962/Xaver, Deiche, Sperrwerke, Wattenmeer-Welterbe, „Schutz + Anpassung"), Sylt (Inselwanderung, Sandaufspülung, Dünenstabilisierung, Tourismus-Dauersiedlungen), Ostsee (Steilküste Fehmarn/Waabs, Wellenschlag-Abbruch, fehlende Tide, isostatische Landhebung), Niederlande (Deltawerke nach 1953, „Room for the River") + Vergleichstabelle + LK-Hinweisen
- index.md: Eintrag ergänzt, aus „NOCH LEER" entfernt (nur Karst-Raumbeispieldatei bleibt offen)
- uebersicht-raumbeispiele.md: Küstenzeile auf Live-Status gesetzt, Verknüpfung ergänzt
- SCHEMA.md: Tag kuesten-raumbeispiele in Taxonomie eingetragen
- Medien: Unsplash-/Commons-Galerien verlinkt; YouTube-Animationen folgen beim nächsten Medienlauf (M3-Muster)
- Nächste Schritte: Karstlandschaft-Raumbeispiele, YouTube-Medien für Fluss- und Küstenseite

## [2026-10-13] fix | Fachfehler in Glazial-Seiten korrigiert (QA-Nacharbeit Punkt 1)
- moränen-und-gletscherformen.md: Nährgebiet/Zehrgebiet waren vertauscht — korrigiert
  (Nährgebiet = Akkumulationsgebiet oberhalb ELA; Zehrgebiet = Ablationsgebiet darunter)
- glaziale-serie.md: Trogtal war als „V-förmig" beschrieben (Gegenbeispiel!) — korrigiert auf
  „U-förmig, breit, steile Wände"; Serien-Beschreibung „links vom Gletscher" präzisiert
  (quer vor der Gletscherzunge, Richtung Vorland)
- glazialmorphologie-ueberblick.md: Trogtal „spitz Zungen-Form" korrigiert; erfundenes
  „Karbälge" durch „Kar" ersetzt; „Gletscher-Granit" → Geschiebe; „EoZ-Linie" korrigiert;
  wirre Gletschertyp-Tabelle bereinigt (Kar/Firnfeld, Tal-Gletscher)
- index.md: „Karbälge" in der Seitenbeschreibung durch „Endmoräne, Kar" ersetzt
- Nächste Schritte: Sprachputz der Glazial-Seiten (Punkt 2), HTML-Export-Neubau (Punkt 3)

## [2026-10-13] fix | Sprachputz Glazial-Seiten + Fremdsprachen-Reste (QA-Punkt 2)
- LanguageTool-Auto-Lauf über die 4 Glazial-Seiten getestet — verworfen: der Auto-Fixer
  erzeugte schädliche Korrekturen („GletsCherrückzug", „boom-alÄhnliChe"). Manueller
  Sprachputz stattdessen.
- glazialmorphologie-ueberblick.md: „synergetismo Eiseinheit", „einä Jahresabfluss",
  „Alpen-Golassereie-Series/Veilchen-Penck", „Parabelrisse/Kiglental/Areth/Rostrand",
  „Diagnose von Gletscherschmuggel", „EoZ-Linie", „Wiirde-Formen", Moränen-Tabelle
  („Knöllchenfront", „Sandrhänner", „Schmelzgering") — alles ersetzt durch korrekte Begriffe
  (Geschiebe, Striemungen, Penck-Serie, Rundhöcker, Hängetal, Frostsprengung, …)
- glaziale-serie.md: „hCu halu", „Holz-Line", „Gummiboden", „Laschrigen", „Gergelenk",
  „boom-alähnliChe Zone", „Plainland/Alpenplättler", „verknÜpfen", „Glatzeal … 복습" —
  bereinigt; Endmoräne/Sander/Urstromtal/Zungenbecken sauber neu formuliert
- moränen-und-gletscherformen.md: „schüttungsdynorgt-argig", „anGrenz", „vorstarr-zeitlich",
  „Gletscherschulterbahn", „Nährgebit", „Wirigkeiten", „gräsern/kreidestrichig" — bereinigt
- permafrost-und-solifluktion.md: „präfekulter Schmierungsschicht", „Hangflucht",
  „Krawall", „Löschufen", „Lönche", „SPIG-Collection", „Okmad.", „V/a", „Bulun",
  „Fl^-zonen", „Gletscher-Vorderrand-Smandliche" — bereinigt
- karstlandschaft.md: „바트뒤셀도르프" (korean. Zeichen) entfernt
- Wiki-weite Zusatzsuche: weitere korean. Zeichen in Biogeographie, Boden, GIS,
  Vulkanismus-Überblick, Skizzen entfernt (Commit 8d561c7)
- Nächste Schritte: HTML-Export-Neubau (Punkt 3)

## [2026-10-13] feat | HTML-Export komplett neu gebaut (QA-Punkt 3)
- Problem: alter Export war ein Einzel-Handexport — Stand 2026-09-27, enthielt nur 20 Seiten,
  keine Medien (keine iframes), neue Seiten (Fluss/Küste) fehlten komplett
- build_html.py neu geschrieben (reines Python-stdlib, keine Abhängigkeiten): konvertiert
  alle .md-Seiten (außer _backup/SCHEMA/README) zu flachen HTML-Dateien; unterstützt
  Frontmatter (Titel/Typ/Tags), Tabellen, Wikilinks, Code-Blöcke, Blockquotes, iframes,
  Bilder, Backlinks („Verlinkt von") und eine vollständige Seiten-Navigation
- Export-Ergebnis: 40 Seiten, 22 YouTube-iframes eingebettet, 245 Wikilinks, 0 broken links
- Wikilink-Tippfehler in den .md-Quellen korrigiert: „vulkanismus-uebeRblick",
  „uEbersIcht-skizzen", „vulkan-prozesse", „exercises/abitur-aufgaben", „reSilienz-massnahmen",
  „vulkanbeispiele" (→ vulkan-raumbeispiele), „[[wikilinks]]" (Code-Beispiel, entschärft),
  tote Links „geologie-grundlagen"/„geomorphologie-ueberblick" (boden-Seite) entfernt
- Nächste Schritte: HTML-Ausgabe im Browser gegenprüfen (Punkt 4), danach Journal-Update

## [2026-10-13] feat | Wiki-Redesign: moderne Wissensplattform (Design v2)
- Auftrag: professionelles, übersichtliches HTML-Wiki-Design (Header-Suche, Sidebar mit
  Kategorien-Baum, Dark Mode, Breadcrumb, TOC, Favoriten, Zuletzt-angesehen, Startseite
  mit Suche/Kategorien/Listen)
- Umsetzung als Explore-Surface (Navigation/Suche/Lesen im Fokus), echte Daten statt erfundener Stats
- build_html.py komplett neu (v1 als build_html_v1_backup.py gesichert, danach entfernt):
  Kategorien-Baum wird aus index.md-Sektionen geparst; „Häufig verlinkt" und „Zuletzt
  aktualisiert" aus echten Backlink-/Update-Daten
- Neu: assets/style.css (Design-System: CSS-Variablen, Light/Dark, responsive),
  assets/wiki.js (Suche, Theme, Favoriten, Zuletzt-angesehen, TOC-Scrollspy, Copy-Link),
  assets/search-index.js (clientseitig, file://-tauglich)
- Bug beim Test gefunden & gefixt: Suchindex wurde nach wiki.js geladen → leerer Index;
  Reihenfolge getauscht + lazy read
- Browser-Test bestanden: Suche (5 Treffer, Hervorhebung), Dark Mode, Kategorien-Karten
  (12), Favoriten, Sidebar-Kollaps, mobil (Off-Canvas, TOC als <details>), Wikilink-Klick
- Schönheitsfehler aus Punkt 4 miterledigt: Titel-Doppelung behoben (H1-Unterdrückung im
  Builder); Pferde-Emoji war ein Artefakt des Test-Browsers, nicht der Dateien
- Nächste Schritte: Karst-Raumbeispiele, YouTube-IDs für Fluss/Küste, raw/-Verzeichnis

## [2026-10-13] fix | Rechtschreibprüfung komplettes Wiki (LanguageTool + Heuristik)
- LanguageTool (HTTP-API, Java 17) über alle 41 Live-.md-Dateien: 2 TYPOS-Meldungen —
  „dm" (Fehlalarm: korrekte Einheit Dezimeter in „wenige dm bis m/Jahr") und „High-Tech"
  (valide Schreibweise, nicht geändert) → keine LanguageTool-Autofixes nötig
- Zusatz-Heuristik (Binnenmajuskel ohne Bindestrich, Fremdzeichen): 26 echte Tippfehler
  gefunden, die LanguageTool nicht kennt (plausible Falschwörter), wortbasiert korrigiert:
  LandwirtschafT, ModifiKation, SatellitenbildeRn, EntwIcklung, HöhlEndecken, HitZewellen,
  HitZe, NachhaltigkeitskRiterien, alternAtiver, VulneRabilität, AlPen, lokalE,
  möglicherwEise, ResilieNz, TRogTAL, SubduktionsZonen, NachhaltigkEit, VulkanFormen, RIfT,
  WarnunGen, erodiErt, OpeRator, WirtschafT, LidR→LiDAR (3×)
- Fremdzeichen: kyrillisches „е" in „Wasserhaushaltskurvе" (wasserhaushalt.md) → „kurve";
  „(Stromer)" → „(Ströme)"
- Bewusst NICHT geändert: log.md (dokumentarische Fehler-Zitate), chemische Formeln
  (CaCO₃, Ca(HCO₃)₂), Formelzeichen (Δ, α), Eigennamen (AfCFTA, OpenStreetMap …)
- Gegenprobe: keine Binnenmajuskel-Fehler mehr außerhalb der Formeln; HTML-Export neu
  gebaut; 28 Korrekturen in 18 Dateien (Commit e21da74)
- Nächste Schritte: Karst-Raumbeispiele, YouTube-IDs für Fluss/Küste, raw/-Verzeichnis
