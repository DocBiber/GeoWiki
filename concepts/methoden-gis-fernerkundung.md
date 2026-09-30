---
title: Geographische Methoden — GIS, Fernerkundung, Kartographie
created: 2026-10-01
updated: 2026-10-01
type: concept
tags: [methodik, gis, fernerkundung, kartographie, analyse, technologie]
sources: []
confidence: high
---

# Geographische Methoden — GIS, Fernerkundung, Kartographie

## Überblick

Moderne Geographie benutzt eine Reihe von Methoden, um räumliche Daten zu erfassen, zu analysieren, zu visualisieren und zu interpretieren. Für den Leistungskurs sind besonders diese drei Methodenfamilien relevant:

1. **Geographische Informationssysteme (GIS):** Digitale Systeme zur Erfassung, Speicherung, Analyse und Darstellung räumlicher Daten
2. **Fernerkundung (Remote Sensing):** Erfassung von Erdoberflächen-Informationen aus der Ferne (Satelliten, Flugzeuge)
3. **Kartographie:** Wissenschaft und Praxis der Kartenerstellung — Visualisierung räumlicher Informationen

> Bezug zum Spektrum Lexikon der Geographie: Kartographie / GIS / Fernerkundung / Methoden

## Geographische Informationssysteme (GIS)

**Definition:** Ein GIS ist ein softwarebasiertes System zur Erfassung, Verwaltung, Analyse und Darstellung geographischer Daten — sowohl räumlicher Lage (Koordinaten) als auch Attributdaten (Eigenschaften von Orten, Einheiten).

**Kernkomponenten:**
- **Geodatenspeicherung:** Vektordaten (Punkte, Linien, Flächen — Polygone) + Rasterdaten (Gitter, Pixel — z. B. Höhenmodelle, Satellitenbilder)
- **Datenbank:** Verknüpfung von Geometrie + Attributen (Tabellen)
- **Analyse-Funktionen:** Layer-Analyse, Overlay, Puffer, Distanzberechnung, räumliche Interpolation, Netzwerk-Analyse, statistische Analyse
- **Darstellung:** Kartenerstellung, symbolische Darstellung, Layout

**Anwendungen:**
- Landwirtschaft: Feldbetrieb, Bodenkarte, Wassermanagement
- Stadtplanung: Flächennutzung, Infrastruktur, Bauleitpläne
- Umwelt: Umweltverträglichkeit, Gefahrenanalyse, Naturschutz
- Notfall: Katastrophenmanagement, Evakuierung, Ressourcenverteilung
- Wirtschaft: Marktanalyse, Standortwahl, Lieferkette

**Beispiele GIS-Layer:**
- Höhenmodell (DEM = Digital Elevation Model) — Raster, Höhen information
- Landnutzung (Landbedeckung — Wälder, Acker, Siedlung, Wasser)
- Bodenkarte (Bodentypen, Bodenart)
- Infrastruktur (Straßen, Eisenbahn, Gebäude, Schienen)
- Gewässer (Flüsse, Seen, Grundwasser)
- Bevölkerungsdichte (Attribute)
- Klimadaten (Temperatur, Niederschlag — Punkte, Raster)

**Fähigkeiten (relevant für Abitur):**
- Layer-Überlagerung (Overlay-Analyse): Z. B. Flächennutzung mit Landschaftsschutzgebiet überschneiden
- Pufferanalyse: Z. B. Puffer um Fluss (Flussnahe Siedlungen innerhalb 500 m)
- Distanz- und Nähe-Analyse: Z. B. Entfernung zu Next City, Schulen, Krankenhäuser
- Räumliche Interpolation: Z. B. Temperatur oder Niederschlag von Messstationen auf ganze Fläche interpolieren (IDW, Kriging)
- Netzwerk-Analyse: Z. B. Fahrzeit, Wege im Verkehrsnetz
- Attributabfrage: Z. B. "Welche Flächen sind waldreich und innerhalb 1 km vom Fluss?"

## Fernerkundung (Remote Sensing)

**Definition:** Fernerkundung bezeichnet das Erfassen von Informationen über Objekte oder Flächen ohne physische Berührung — meist mit Sensoren an Bord von Satelliten, Flugzeugen, Drohnen.

**Sensor-Typen:**
- **Passive Sensoren:** Empfangen natürliche Strahlung (Sonnenlicht, Wärmestrahlung) — z. B. optische Kameras, multispektrale Scanner (Landsat, Sentinel-2), thermische Sensoren
- **Aktive Sensoren:** Senden eigene Strahlung aus und messen Rückkehr — z. B. Radar (Synthetic Aperture Radar, SAR — kann durch Wolken durchdringen), LidR (Laser) für Höhenmodelle

**Wellenlängen-Bereiche:**
- **Sichtbares Licht (VIS):** RGB — natürliche Farben, gut für Landnutzung, Vegetation (Grün), Wasser (blau)
- **Infrarot (NIR, SWIR):** Nahinfrarot (Pflanzengesundheit / NDVI), kurzwelliges Infrarot (Wasserinhalt, Mineralogie)
- **Thermal Infrared (TIR):** Temperaturmessung (Oberflächentemperatur, städtische Hitzeinseln, Feuer)
- **Mikrowelle (Radar):** Durchdringt Wolken, Nutzung bei Wolken/Hitze, Höhenmessung (LidR)

**Satelliten-Beispiele:**
- **Landsat (USA):** Lange Zeitreihe seit 1972, 30 m Auflösung, gut für Veränderungsanalyse (z. B. Entwaldung, städtisches Wachstum, Urbanisierung)
- **Sentinel-2 (ESA):** Kostenlos, 10–20 m Auflösung, 5-Tage Wiederholung — standard für Landbedeckung, Vegetationsmonitoring
- **MODIS (NASA):** Grob aufgelöst (250–1000 m), täglich — globale Monitoring (Vegetationsindex, Temperatur, Wolken)
- **Sentinel-1 (Radar):** Durch Wolken, tagsüber/nachts, 5–20 m — Überschwemmungserkennung, Bodendisplacement
- **Sentinel-3 (Optical + Altimeter):** Ozean, Land, Atmosphäre

**Anwendungen:**
- **Vegetationsindizes:** NDVI (Normalized Difference Vegetation Index) = (NIR - R) / (NIR + R) — zeigt Vegetationsdichte, -gesundheit; hoher Wert = dicht, gesund (Vorteil: einfach, gut verständlich)
- **Veränderungsdetektion:** Vorher/Nachher Vergleich: Z. B. Epidemie-Detekektion, Degradierung, Urbanisierung
- **Höhenmodelle:** LidR, Radar-Uplink — liefert digitales Höhenmodell (DEM), Hangneigung, Geländeanalyse
- **Wasser / Überschwemmung:** Sentinel-1 (Radar) — flüssiges Wasser reflektiert anders als trockene Fläche; gut für Hochwasserkartierung
- **Temperatur:** TIR — städtische Hitzeinseln, Landwirtschaft (Wasserstress), Vulkanismus (Thermalflächen)

** 한계 (für Abitur relevant):**
- Auflösung (räumlich: Pixelgröße; zeitlich: Wiederholung) — höhere Auflösung = kleinere Fläche, aber weniger Abdeckung
- Wolken (optisch) — Radar beim Durchdringen
- Daten aufbereiten (Kalibrierung, Atmosphären-Korrektur, geometrische Korrektur)
- Interpretation: NDVI ist nicht direkt "Biomasse" — Interpretation braucht Kontext

## Kartographie

**Definition:** Kartographie ist die Kunst und Wissenschaft der Kartenerstellung — Abbildung räumlicher Informationen auf Papier oder Bildschirm.

**Grundarten von Karten:**
- **Allgemeine Karte:** Zeigt viele Elemente (Topographische Karte: Höhen, Gewässer, Straßen, Siedlungen, Vegetation) — z. B. Topographische Karte 1:25.000, 1:50.000
- **Spezielle Karte (Themenkarte):** Ein Thema im Fokus — z. B. Bevölkerungsdichte, Niederschlag, Vegetation, Bodenkarte, Verkehrskarte
- **Digitale Karten:** Interaktiv (Web-GIS, OpenStreetMap, Google Maps) — Zoom, Layerwahl, Messung
- **Satellitenbild (falschfarbig / Natural Color):** Optisches Bild — nicht primär "Karte", aber geographische Information

**Kartenelemente:**
- **Titel.** Was wird dargestellt?
- **Legend (Erklärung).** Symbole, Farben, Werte
- **Maßstab.** Verhältnis (1:50.000 = 1 cm = 500 m) oder grafische Strecke
- **Koordinaten / Bezugssystem:** (z. B. UTM, Gauß-Krüger, WGS84)
- **Nordpfeil / Richtung**
- **Kartennetz:** Gitternetz (Längen- und Breitengrade) für Referenz
- **Quellenangabe** (wichtig für wissenschaftliche Arbeit!)

**Projektionen (Abbildung der Kugel auf Ebene):**
- **Problem:** Kugel → ebene Fläche = Verzerrung (entweder Fläche, Form, Abstand, Richtung bleibt richtig)
- **Beispiele:**
  - Mercator-Projektion: Winkeltreue (Conform), gut für Navigation — aber polare Länder stark vergrößert (Grüneland vs. Afrika)
  - Kugelkeil / Lambertsche Kreiskegelprojektion: Flächentreue in Polaren — gut für mittlere Breiten (Deutschland)
  - Gauß-Krüger (UTM): Konform, für kleine Gebiete — Standard in Deutschland (3-Grad-Sektoren)
  - Robinson / Winkel tripel: Kompromiss, für Weltkarten

**Kartografische Gestaltprinzipien:**
- **Generalisierung:** Vereinfachung bei kleinerem Maßstab (weniger Details)
- **Visual Hierarchy:** Wichtige Elemente hervorstechen
- **Leichtigkeit:** Klar ohne Überladung
- **Farbgebung:** Sinnvoll, einprägsam, nicht irreführend

**Fähigkeiten (Abitur):**
- Karten lesen und interpretieren (Topographische Karte, Themenkarte, Satellitenbild)
- Eigene Karten erstellen (simple Layout: Layer, Symbole, Legende, Maßstab, Titel)
- Bei GIS: Layer kombinieren, Analyse durchführen, Ergebnis kartieren

## Beziehung zwischen Methoden

GIS, Fernerkundung und Kartographie sind sich ergänzend:

- **Fernerkundung** liefert Daten (Satellitenbilder, LiDAR, Radar)
- **GIS** analysiert diese Daten (Overlay, Klassifikation, Modellierung)
- **Kartographie** stellt Ergebnisse dar (Karten, Diagramme, 3D-Visualisierung)

Beispiel: Landnutzungsänderung:
1. Fernerkundung: Satellite-Bilder aus 1990 und 2020 herunterladen (Landsat)
2. GIS: NDVI berechnen, Landbedeckung klassifizieren, Overlay-Vergleich
3. Kartographie: Karte erstellen mit Landbedeckung 1990, 2020, Änderung, Legende, Maßstab, Quelle

## Verwandte Seiten

- [[disparitaet-entwicklungen]] — Entwicklungszusammenarbeit: GIS in Entwicklungsländern, Geoinformations-Technologie
- [[klimawandel]] — Überwachung: Fernerkundung von Eis, Vegetation, Temperatur
- [[boden-und-boden]] — Bodenkarten, GIS-Analyse Boden
- [[atmosphaere-wetter-klima]] — Wetterkarten, Satellitenbilder lesen

## Offene Fragen

- Welche konkreten GIS-Übungen / Map-Aufgaben für Abitur? (z. B. ArcGIS, QGIS, OpenStreetMap-basiert?)
- Welche Satellitenbilder-Beispiele für Abitur? (z. B. Google Earth, Sentinel Hub, USGS EarthExplorer)

---

## Visuelle Darstellungen & Beispiele

> Quellen: YouTube (Animationen/Erklärungen), Wikimedia Commons (Bilder/Diagramme, meist CC BY-SA / Public Domain), Unsplash (Fotografien, free to use). Alle Links führen zu externen Plattformen.

#### 📸 Fotogalerie: GIS, Kartierung, digitale Karten (Unsplash)

[Freie Fotos von GIS-Desktop, digitale Karten, Geoinformationssysteme.](https://unsplash.com/s/photos/gis-mapping)

#### 📸 Fotogalerie: Satellitenbilder, Fernerkundung (Unsplash)

[Freie Fotos von Satellitenbildern, Erdbeobachtung, Fernerkundung.](https://unsplash.com/s/photos/satellite-imagery)

#### 📸 Fotogalerie: Kartographie, Landkarten, Kartenherstellung (Unsplash)

[Freie Fotos von Kartographie, alten und neuen Karten, Kartendesign.](https://unsplash.com/s/photos/cartography)

#### 📸 Fotogalerie: Topographische Karten, Höhenmodelle (Unsplash)

[Freie Fotos von topographischen Karten, Geländemodellen, Höhenlinien.](https://unsplash.com/s/photos/topographic-map)

