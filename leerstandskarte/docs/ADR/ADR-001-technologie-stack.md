# ADR-001: Technologie-Stack

**Datum:** 2026-05-07  
**Status:** Akzeptiert

## Kontext

Für den Leerstandskataster soll eine leicht wartbare Lösung gefunden werden, die ohne spezielle Entwicklungsumgebung auskommt und von ehrenamtlich Engagierten oder kommunalpolitisch Aktiven mit geringem technischen Aufwand betrieben werden kann.

## Entscheidung

- **Reines HTML, CSS und JavaScript** ohne Frontend-Framework (kein React, Vue, Angular usw.).
- **Leaflet.js** zur Darstellung der interaktiven Karte.
- **Kein Build-Tool** (kein Webpack, Vite, npm-Skripte für die Kern-Anwendung).

Externe Abhängigkeiten sind auf das vertretbare Minimum beschränkt (z. B. Leaflet per CDN, wie in der aktuellen `index.html`).

## Begründung

- **Maximale Einfachheit:** Weniger bewegliche Teile, weniger Schulung, weniger Fehlerquellen.
- **Keine Abhängigkeiten vom Node-Ökosystem** für den Betrieb der statischen Seite – die Dateien können auf jedem Webspace oder lokal geöffnet werden.
- **Jede Person mit Admin-Zugang** kann Texte, `style.css` oder `data/leerstände.json` direkt bearbeiten, ohne IDE, Compiler oder Paketmanager zu kennen.

## Konsequenzen

- Positiv: Schneller Einstieg, geringe Einarbeitungszeit, gut nachvollziehbare Codebasis.
- Negativ: Kein automatisches State-Management oder Komponenten-Baukasten; bei sehr großem Funktionsumfang kann die Wartbarkeit ohne Disziplin leiden – dann sollten weitere ADRs die Einführung von Werkzeugen prüfen.
