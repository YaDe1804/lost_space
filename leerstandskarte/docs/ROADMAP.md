# Roadmap – Leerstandskataster

Übersicht der geplanten Entwicklung in drei Phasen.

---

## Phase 1 – Prototyp (jetzt)

- Kartenansicht zentriert auf Schwäbisch Gmünd
- Marker nach **Status** (farbcodiert)
- **Popup** mit Adresse, Status, Wohneinheiten, Notiz
- **Sidebar** mit Statistiken und Objektliste (Klick zentriert die Karte)
- Datenquelle: **lokale JSON-Datei** (`data/leerstände.json`)
- **Admin:** Guided Tour („Anleitung“) im Formular **Neuer Eintrag** (siehe [ADR-007](ADR/ADR-007-guided-tour.md))
- **Admin:** Geocoding mit **Nominatim** für Button „Koordinaten automatisch ermitteln“ und **CSV-Import** mit automatischer Koordinatenermittlung bei fehlenden Werten (siehe [ADR-006](ADR/ADR-006-geocoding.md))

---

## Phase 2 – Admin-Panel

- Einträge **hinzufügen, bearbeiten und löschen** über ein Webformular
- **Einfaches, passwortgeschütztes Login**
- Persistenz in einer **lokalen SQLite-Datenbank** oder einem schlanken Backend, z. B.:
  - **Node.js mit Express**, oder
  - **Python mit Flask**
- **Granulare Kartenebenen via Overpass API** – POI-Kategorien (Gastronomie, Parkplätze, Einzelhandel u. a.) als **einzeln umschaltbare Vektorlayer**, unabhängig vom gewählten Basis-Tile-Stil (siehe [ADR-005](ADR/ADR-005-kartenebenen.md))

---

## Phase 3 – Produktiv

- **Mehrbenutzer-Login** mit Rollen (z. B. Admin, Redakteur, Leser)
- **Export-Funktionen** (CSV, PDF)
- **Einbettung** in die bestehende Webseite der Partei (iframe oder integrierte Seite)
- **Optional:** Anbindung an **offizielle Geodatenbanken** (z. B. LGL Baden-Württemberg / ALKIS) für abgestimmte Geoinformationen

---

*Stand: 2026-05-07*
