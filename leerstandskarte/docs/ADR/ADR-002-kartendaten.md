# ADR-002: Kartendaten (Basiskarte)

**Datum:** 2026-05-07  
**Status:** Akzeptiert

## Kontext

Die Karte benötigt Geodaten: Hintergrundkarte (Straßen, Gebäude) und eine Bibliothek zur Darstellung von Markern und Popups. Es stehen kommerzielle Anbieter (z. B. Google Maps, Mapbox) sowie offene Alternativen zur Auswahl.

## Entscheidung

Es wird **OpenStreetMap (OSM)** als Kartengrundlage in Verbindung mit **Leaflet** verwendet – **nicht** Google Maps, Mapbox oder andere kommerzielle Karten-APIs mit verpflichtenden API-Schlüsseln für den hier beschriebenen Standardbetrieb.

## Begründung

- **Kosten:** Nutzung der öffentlich verfügbaren OSM-Kacheln ohne kostenpflichtigen Vertrag.
- **Keine API-Keys:** Weniger Verwaltungsaufwand und kein „Secret“-Management für eine einfache statische Seite.
- **Keine nutzungsbedingten Abrechnungsmodelle** im gleichen Maße wie bei kommerziellen Diensten (Stand der Entscheidung: Fokus auf einfachen Prototyp und Bürgernähe).
- **Datenschutz:** Für eine politische Organisation ist es sinnvoll, keine zusätzlichen Tracker oder Konten bei Kartendienst-Anbietern zu erzwingen, sofern mit einer offenen Lösung gearbeitet werden kann.

## Konsequenzen

- **Fair-Use / Nutzungsrichtlinien:** Die Nutzung der Standard-OSM-Kachelserver sollte den Vorgaben von [OpenStreetMap](https://wiki.openstreetmap.org/wiki/Tile_usage_policy) entsprechen (insbesondere bei hohem Traffic oder eingebetteten Apps).
- **Produktivbetrieb:** Bei steigender Nutzung können **eigene Kachel-Server**, **Kachel-Proxys** oder kostenpflichtige/hosting-freundliche Tile-Angebote nötig werden – das ist bewusst später zu planen.
- **Wartung:** URLs und Attribution für Kacheln und Leaflet müssen bei Umstellungen angepasst werden.
