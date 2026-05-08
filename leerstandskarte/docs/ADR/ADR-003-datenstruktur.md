# ADR-003: Datenstruktur und Speicherort

**Datum:** 2026-05-07  
**Status:** Akzeptiert

## Kontext

Leerstandsdaten müssen in der ersten Ausbaustufe ohne Backend auskommen, sollen aber perspektivisch zentral verwaltbar sein.

## Entscheidung

- **Phase Prototyp:** Daten liegen als **lokale JSON-Datei** (`data/leerstände.json`) im Projekt und werden per HTTP geladen.
- **Spätere Phase:** Migration zu einer **REST-API mit Backend**, die dieselbe fachliche Datenstruktur (Felder, Bedeutung der Statuswerte) abbildet.

## Begründung

- Der **Prototyp soll ohne Server-Anwendung** lauffähig sein (statisches Hosting oder lokaler Test).
- JSON ist für Menschen und Programme gut lesbar und eignet sich als Vertrag („Contract“) zwischen Frontend und künftiger API.
- Ein späteres Backend kann die Ressource `/api/leerstände` o. Ä. liefern, ohne dass das Frontend neu konzipiert werden muss, wenn die **Response-Form** der heutigen Dateistruktur entspricht.

## Konsequenzen

- Das **Datenformat wird von Anfang an stabil und API-tauglich** gehalten (klare Feldnamen, typisierte Werte wo möglich, einheitliche Status-Codes).
- Beim Übergang zur API sind Anpassungen nur dort nötig, wo heute `fetch('data/leerstände.json')` steht – idealerweise eine konfigurierbare Basis-URL oder ein kleiner Daten-Layer im `app.js`.
- Sicherheit und Mehrbenutzerbetrieb entfallen in der reinen JSON-Phase – Zugriffskontrolle und Datenschutz folgen mit dem Backend (siehe ROADMAP).

## Demo-Modus (Admin-Panel)

Im **Prototyp** simuliert der Button **„Speichern“** im Admin-Formular eine echte Datenbank: **Neue Einträge** werden im **Arbeitsspeicher des Browsers** (`items`-Array in `admin.js`) gehalten, **oben** in der Tabellen-**Übersicht** angezeigt und gehen beim **Neuladen der Seite** vollständig verloren. Die Datei **`data/leerstände.json`** wird dabei **nicht** verändert.

Die **finale Implementierung** ersetzt diesen Mock durch einen **API-Aufruf** an das Backend (z. B. **`POST /api/leerstände`**) mit **persistenter Speicherung** und Fehlerbehandlung.
