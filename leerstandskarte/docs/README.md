# Leerstandskataster

Der **Leerstandskataster** ist eine einfache Webkarte zur Darstellung von Leerständen – **anpassbar für jede Gemeinde, Stadt oder Region**. Er dient als **Werkzeug für kommunalpolitische Arbeit**: Übersicht schaffen, Fakten sichtbar machen und Gespräche mit Verwaltung, Lokalpolitik und Öffentlichkeit vorbereiten. Ort, Kartenausschnitt und Objektdaten konfiguriert und pflegt ihr in den Projektdateien (u. a. `app.js`, `data/leerstände.json`).

## Lizenz & Nutzung

Dieses Projekt steht unter der **MIT-Lizenz** und kann von jedem Orts-, Kreis- oder Landesverband frei genutzt, angepasst und weiterentwickelt werden. Der vollständige Lizenztext befindet sich in der Datei [`LICENSE`](../LICENSE) im Projektordner `leerstandskarte`.

![Screenshot der Karte – Platzhalter](_screenshots/karte-platzhalter.png)

*Hinweis: Legen Sie hier einen Screenshot der Kartenansicht ab (z. B. `docs/_screenshots/karte-platzhalter.png`).*

## Schnellstart

Es gibt **keinen Build-Schritt**. Die Anwendung besteht aus statischen Dateien.

1. Repository klonen oder den Ordner `leerstandskarte` kopieren.
2. **Am einfachsten:** Einen lokalen Webserver starten (damit die Daten aus `data/leerstände.json` geladen werden können), z. B. im Ordner `leerstandskarte`:
   - **Python:** `python -m http.server 8765`
   - Im Browser öffnen: `http://127.0.0.1:8765/`
3. Alternativ die Datei `index.html` direkt öffnen – je nach Browser kann das Laden der JSON-Datei eingeschränkt sein; dann bitte wie unter 2. vorgehen.

Weitere Hinweise für Pflege der Daten: **[ADMIN-HANDBUCH](ADMIN-HANDBUCH.md)**.

## Projektstruktur

```
leerstandskarte/
├── index.html          # Startseite, Einbindung von Karte und Sidebar
├── style.css           # Darstellung
├── app.js              # Karte, Marker, Statistik, Liste
├── data/
│   └── leerstände.json # Objektdaten (Leerstände)
└── docs/               # Dokumentation (dieser Ordner)
    ├── README.md
    ├── ROADMAP.md
    ├── ADMIN-HANDBUCH.md
    └── ADR/
```

## Weiterführende Dokumentation

| Dokument | Inhalt |
|----------|--------|
| **[ADMIN-HANDBUCH](ADMIN-HANDBUCH.md)** | Daten pflegen ohne Entwicklerkenntnisse |
| **[ROADMAP](ROADMAP.md)** | Geplante Entwicklungsphasen |

## Architekturentscheidungen

Technische Entscheidungen sind als Architecture Decision Records (ADR) festgehalten:

- [ADR-001: Technologie-Stack](ADR/ADR-001-technologie-stack.md)
- [ADR-002: Kartendaten](ADR/ADR-002-kartendaten.md)
- [ADR-003: Datenstruktur](ADR/ADR-003-datenstruktur.md)
- [ADR-004: Marker-Strategie](ADR/ADR-004-marker-strategie.md)
- [ADR-005: Kartenebenen](ADR/ADR-005-kartenebenen.md)
- [ADR-006: Geocoding (Nominatim)](ADR/ADR-006-geocoding.md)
- [ADR-007: Guided Tour im Admin](ADR/ADR-007-guided-tour.md)
- [ADR-008: Open Source (MIT)](ADR/ADR-008-open-source.md)
