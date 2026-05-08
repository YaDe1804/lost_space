# ADR-005: Kartenebenen (Basis-Tiles vs. granulare POI-Steuerung)

**Datum:** 2026-05-07  
**Status:** Teilweise akzeptiert

## Kontext

Nutzer sollen den Kartenhintergrund zur besseren Lesbarkeit wählen können. Zugleich besteht der Wunsch, Informationen wie einzelne POI-Kategorien (Gastronomie, Parkplätze, Einzelhandel u. a.) gezielt ein- oder auszublenden.

## Entscheidung

- **Phase 1:** Es werden **vorgefertigte Tile-Layer-Stile** zur Auswahl angeboten (z. B. **CartoDB Positron** in Varianten, **OpenStreetMap** als Standard-Rasterkarte) über die integrierte **Basis-Layer-Auswahl** der Kartenbibliothek.
- **Kein** per-Kategorie-Filterschalter für POIs auf der **Rasterkachel-Ebene** in Phase 1: Die genutzten Dienste liefern **Vorgerenderte Bild-Kacheln**; eine selektive Steuerung einzelner Inhaltskategorien ist damit **technisch nicht möglich**.

## Begründung

Tile-basierte Hintergrundkarten sind **Bitmaps** pro Zoomstufe und Ausschnitt. Welche Objekte (Straßen, Labels, POIs) darauf gezeichnet sind, entscheidet der **Tile-Anbieter** beim Rendern – das Frontend kann **keine** einzelnen POI-Layer eines solchen Bildes zuverlässig trennen oder ausblenden.

## Konsequenzen

- Für **granulare Layer-Kontrolle** (z. B. Gastronomie, Parkplätze einzeln ein/aus) ist in **Phase 2** die **Overpass API** (bzw. vergleichbare Abfragen auf OSM-Daten) zu **evaluieren**: POI-Kategorien werden dann als **eigene Leaflet-`VectorLayer`** (oder vergleichbare Vektor-Ebene) geladen und können **unabhängig vom gewählten Basis-Tile-Style** umgeschaltet werden.

Siehe **[ROADMAP – Phase 2](ROADMAP.md)** (Erweiterung: granulare Kartenebenen via Overpass).
