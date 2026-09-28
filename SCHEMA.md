# Wiki Schema — Geographie LK BW

## Domain
Physische Geographie im Leistungskurs (LK) an Gymnasien in Baden-Württemberg.
Ausrichtung: Bildungsplan 2016 (Gymnasium), Gültigkeitsstufe V2 vom 22.02.2023.
Mid-2026: Überarbeitungsbedarf gem. Kultusministerkonferenz (KMK) 2025; neue Fassung wird erwartet.

## Konventionen
- Dateinamen: Kleinbuchstaben, Bindestriche, keine Leerzeichen.
  Beispiel: `vulkanismus-ueberblick.md`
- Jede Wiki-Seite beginnt mit YAML-Frontmatter (s. unten).
- Verlinkung: `[[wikilinks]]` zur Verknüpfung untereinander (mindestens 2 ausgehende Links pro Seite).
- Bei Updates: `updated`-Datum immer aktualisieren.
- Neue Seiten: müssen zu `index.md` unter korrekter Sektion hinzugefügt werden.
- Jede Aktion: in `log.md` eintragen.
- Rohquellen (`raw/`) sind **immutable** — Korrekturen nur in Wiki-Seiten.

## Frontmatter (Wiki-Seiten)
```yaml
---
title: Seiten-Titel (deutsch, kurz)
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: entity | concept | comparison | query | summary
tags: [aus Taxonomie s. u.]
sources: [raw/articles/quelle.md]
# Wahlweise Qualitätssignale:
confidence: high | medium | low        # Wie gut gestützte Behauptungen
contested: true                        # Bei ungeklärten Widersprüchen
contradictions: [andere-seite-slug]   # Konflikt mit anderen Seiten
---
```

- `confidence: high` nur bei breiter Quellenbasis.
- `confidence: medium` bei Einzelquellen oder schnell bewegten Themen.
- `confidence: low` bei ungesicherten Behauptungen / in Bearbeitung.
- Auf Seiten mit 3+ Quellen: Provenienz-Marker `^[raw/articles/quelle.md]` am Ende von Absätzen.

## Frontmatter (Rohquellen)
Jede Datei in `raw/` erhält gleiche Frontmatter, damit spätere Re-Ingests Drift erkennen:

```yaml
---
source_url: https://beispiel.de/artikel   # ursprüngliche URL, falls zutreffend
ingested: YYYY-MM-DD
sha256: <hex digest des Inhalts unterhalb des Frontmatter-Blocks>
---
```
sha256: über den Körper (alles nach der schließenden `---`) — ermöglicht Skipping bei identischer Quelle.

## Tag-Taxonomie
Folgende Tags dürfen verwendet werden. Neue Tags müssen hier erst eingetragen werden.

### Themengebiete
- vulkanismus — Vulkanismus, Vulkanformen, Prozesse, Förderprodukte
- glazialmorphologie — Gletscher, Eiszeiten, Moränen, glaziale Serie, Permafrost
- vulnerabilitaet — Vulnerabilität, Resilienz, Risiko, Naturgefahren
- bildungsplan — Bildungsplan 2016, Kompetenzen, LK-Struktur
- abitur — Abiturformat, Operatoren, Prüfungsanforderungen
- raumbeispiele — konkrete geographische Räume als Lernfeld
- prozesse — endogene / exogene Prozesse
- methodik — Kartennutzung, Analyse, Modellbildung
- skizzen — Zeichenvorlagen für Abitur/Prüfung
- uebung — Übungsaufgaben, Kompetenzstufen
- vulkan-raumbeispiele — Vulkanraum-Beispiele (Vesuv, Kilauea, Laacher See, Eyafjöll)
- glazial-raumbeispiele — Glazialraum-Beispiele (Alpen, Norddeutschland, Island)

### Entitätstypen
- vulkan — ein Vulkan / Vulkanismo-Objekt
- gletscher — ein Gletscher / Eisform
- landschaft — Landschaftstyp (vulkanisch, glazial, küstennah etc.)
- modell — konzeptionelles Modell (z.B. BBC, Risiko-Rahmen)
- aufgabe — Abitur- oder Übungsaufgabe

### Entitätstypen
- vulkan — ein Vulkan / Vulkanismo-Objekt
- gletscher — ein Gletscher / Eisform
- landschaft — Landschaftstyp (vulkanisch, glazial, küstennah etc.)
- modell — konzeptionelles Modell (z.B. BBC, Risiko-Rahmen)

## Seiten-Grenzen
- Seite erstellen, wenn Entität/Konzept in 2+ Quellen vorkommt ODER zentrale Bedeutung hat.
- Seite NICHT erstellen für nebenbei erwähnte Details.
- Seite aufspalten bei >200 Zeilen — in Teilthemen mit Cross-Links.
- Seite archivieren, wenn outdated: nach `_archive/` verschieben, aus Index entfernen.

## Entity-Seiten
Je Entität: Überblick, Kernfakten/Daten, Beziehungen zu anderen Entitäten ([[wikilink]]), Quellen.

## Konzept-Seiten
Je Konzept: Definition, Erklärung, aktueller Wissensstand, offene Fragen, verwandte Konzepte.

## Vergleichs-Seiten
Seite-Seite-Analysen: Was wird verglichen und warum, Vergleichsdimensionen (Tabelle bevorzugt),
Urteil/Synthese, Quellen.

## Update-Politik bei Widersprüchen
1. Daten prüfen — neuere Quellen überwiegen.
2. Bei echtem Widerspruch: Beide Positionen mit Daten und Quellen darstellen.
3. Im Frontmatter markieren: `contradictions: [andere-seite]` + `contested: true`.
4. Im Lint-Bericht als Prüfling aufführen — Nutzer entscheidet.
