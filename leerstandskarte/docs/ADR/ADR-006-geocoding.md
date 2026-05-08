# ADR-006: Geocoding (Nominatim)

**Datum:** 2026-05-07  
**Status:** Akzeptiert

## Kontext

Für Karte und Datenerfassung werden geographische Koordinaten (`lat` / `lng`) benötigt. Manuelles Ablesen ist fehleranfällig; ein automatischer Abgleich mit Adressen soll die Qualität erhöhen.

## Entscheidung

Die Koordinatenermittlung erfolgt über **Nominatim** (OpenStreetMap-Geocoding-API), d. h. per HTTP-Anfrage an den öffentlichen Dienst unter `nominatim.openstreetmap.org` mit Abfrageparameter `format=json` und Freitextsuche (Adresse, Ort, Deutschland).

## Begründung

- **Kostenlos** und ohne Registrierung für überschaubare Nutzung.
- **Keine API-Keys** nötig.
- **Datenschutz:** Es werden nur Suchbegriffe an den Dienst übergeben, keine personenbezogenen Zusatzprofile im Projekt.
- Für **deutsche Adressen** in kommunaler Skala ist die Trefferqualität in der Regel **ausreichend** für Kartendarstellung und Kampagnenarbeit.

## Konsequenzen

1. **Fair-Use-Policy** von Nominatim einhalten: insbesondere **höchstens eine Anfrage pro Sekunde** bei Serienabfragen (z. B. CSV); bei parallelen Clients zusätzlich Vorsicht.
2. **User-Agent:** Nominatim erwartet eine erkennbare Kennung des aufrufenden Programms. In **reinem Browser-JavaScript** lässt sich der `User-Agent`-Header oft **nicht setzen** (Sicherheitsrichtlinien). Daher: im Admin-Client möglichst begleitende Header (`Accept`, `Accept-Language`); für **Serienlast oder Produktivbetrieb** einen **Server-Proxy** oder **eigene Nominatim-Instanz** in Phase 2 evaluieren, dort einen **verbindlichen User-Agent** setzen.
3. **`lat` / `lng`** im CSV-Import sind **optional**; fehlende Werte können **automatisch per Nominatim** ergänzt werden (mit Wartezeit zwischen Anfragen).
4. **Phase 2:** Bei deutlich höherem **Datenvolumen** prüfen, ob ein **eigener Nominatim-Server** (oder dedizierter Dienst) sinnvoll ist, um Nutzungsgrenzen und Verfügbarkeit zu entkoppeln.

Siehe auch [ADR-007](ADR-007-guided-tour.md) (Bedienhilfen im Admin) und [ROADMAP – Phase 2](ROADMAP.md).
