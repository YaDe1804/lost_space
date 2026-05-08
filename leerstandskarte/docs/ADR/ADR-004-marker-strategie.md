# ADR-004: Marker-Strategie auf der Karte

**Datum:** 2026-05-07  
**Status:** Akzeptiert

## Kontext

Leerstände sollen auf der Karte gut erkennbar und nach Status unterscheidbar dargestellt werden. Technisch stehen u. a. einfache Punkte bzw. Kreis-Marker (`L.circleMarker`), **Div-Icons mit SVG** oder **Gebäudeumrisse als Polygone** (z. B. aus OpenStreetMap via Overpass API) zur Verfügung.

## Entscheidung

- Im **Prototyp** werden **`L.divIcon`**-Marker mit einem **SVG-Haussymbol** verwendet (farbig nach Status). Es erfolgt **kein** Einsatz von Gebäude-Polygonen aus der Overpass API in dieser Phase.
- **Gebäude-Polygone** bzw. eine tiefere geometrische Darstellung ist für **Phase 2** vorgesehen (gemeinsam mit Datenpflege und ggf. Backend).

## Begründung

- **Polygone aus OSM/Overpass** erfordern zuverlässige Zuordnung (Adresse → Way/Relation), **Fehlertoleranz**, oft **Caching** und mitunter eine **Server-Komponente** oder regelmäßige Jobs – erhöhter Pflege- und Implementierungsaufwand.
- **`L.divIcon` mit SVG** ist **sofort** umsetzbar, rein im Frontend, ohne zusätzliche API-Aufrufe, und für einen **politischen Prototyp** mit überschaubarer Objektanzahl **ausreichend** gut erkennbar.
- Kreis-Marker sind reduziert, aber weniger intuitiv als ein Gebäude-Symbol; das Icon verbessert die Lesbarkeit ohne die Komplexität von Polygonen.

## Konsequenzen

- Positiv: Schnelle Iteration, keine Abhängigkeit von Overpass-Verfügbarkeit oder Rate-Limits im Live-Betrieb des Prototyps.
- Negativ: Position bleibt punktuell; exakte Grundstücksumrisse werden **nicht** abgebildet, bis Phase 2 geklärt ist.
- Später: Übergang zu Polygonen oder Hybrid (Icon + Polygon) erfordert neue ADRs zu Datenquellen und Performance.
