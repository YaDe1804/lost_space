# Security- und Qualitäts-Audit (Leerstandskarte)

**Prüfungsumfang:** `j:\LostSpace\leerstandskarte\` (HTML, JS, JSON; CSS nicht sicherheitskritisch für injizierten Inhalt).  
**Stand der Bewertung:** Code-Review, keine dynamische Penetrationstests.

---

## XSS (Cross-Site-Scripting) und `leerstände.json`

**Status:** ✅ Erledigt (Validierung `item.id` + bestehendes `escapeHtml`)

**Beschreibung:**  
Benutzer-/datenbasierte Werte aus der JSON-Quelle werden weiterhin über `escapeHtml()` eingebettet (Popups, Liste, Fehler beim Laden).

**Umgesetzt:** Vor jedem `querySelector` mit `data-entry-id` prüft `isSafeEntryId(item.id)` (`/^[0-9A-Za-z-]+$/`). Ungültige IDs: Überspringen; bei `DEBUG === true` zusätzlich `console.error`. Flag: `const DEBUG = false` am Anfang von `app.js`.

---

## CSV-Import und Rendering

**Status:** ✅ OK

**Beschreibung:** Zellen und Fehlertexte mit `escapeHtml`; keine `eval`-Verarbeitung von CSV.

---

## Nominatim-Anfragen

**Status:** ✅ Erledigt (Fehlerarten) / 🔜 Phase 2 (User-Agent)

**API-URL & Encoding:** `encodeURIComponent(q)` – ✅.

**Fair-Use (1 s):** Pause zwischen Serien-Anfragen – ✅.

**Fehlermeldungen (umgesetzt):** In `geocodeAdresse()` werden getrennt zurückgegeben:
- **Netzwerk / HTTP-Fehler** → Nutzer: *„Verbindungsfehler – bitte Internetverbindung prüfen.“* (Button „Koordinaten ermitteln“ und CSV-Vorschau mit entsprechendem `nominatimNote`)
- **Leeres Ergebnis / nicht gefunden** → *„Adresse nicht gefunden – bitte Koordinaten manuell prüfen.“*

**🔜 Phase 2:** Verbindlicher **User-Agent** und ggf. **Server-Proxy** für Nominatim (Browser erlaubt UA-Header meist nicht) – siehe `docs/ADR/ADR-006-geocoding.md`.

---

## Externe Ressourcen und SRI

**Status:** ✅ OK (Leaflet in `index.html`) / ℹ️ Kachel-URLs ohne SRI (üblich)

| Ressource | Datei | SRI |
|-----------|--------|-----|
| Leaflet 1.9.4 CSS | `index.html` | vorhanden ✅ |
| Leaflet 1.9.4 JS | `index.html` | vorhanden ✅ |

**admin.html:** keine CDN-Skripte.

**Kartenkacheln (Carto/OSM):** Laufzeit-URLs in Leaflet – SRI für Einzeltiles üblicherweise nicht anwendbar.

---

## Sensible Daten (Hardcoding)

**Status:** ✅ OK

Keine API-Keys oder Passwörter in den geprüften Quell- und Datendateien.

---

## `data/leerstände.json` – Beispieldaten & Datenschutz

**Status:** ✅ Dokumentiert (Handbuch)

**Beschreibung:** Beispieldaten bleiben sachlich anonym. Zusätzlich wurde im **[ADMIN-HANDBUCH](ADMIN-HANDBUCH.md)** der Abschnitt **„Datenschutz bei Live-Betrieb“** ergänzt (Adressen vs. personenbezogene Daten; Feld **Notiz** ohne Namen/Kontakte).

---

# Code-Qualität (`app.js` & `admin.js`)

## Fehlerbehandlung bei `fetch()` / Geocoding

**Status:** ✅ Erledigt (Geocoding differenziert)

`fetch` für JSON-Dateien: Nutzerhinweise über `.catch` unverändert sinnvoll. Geocoding unterscheidet Netzwerk vs. „nicht gefunden“ wie oben.

---

## Nominatim Fair-Use und User-Agent

**Status:** ✅ OK (Delay) / 🔜 Phase 2 (User-Agent über Backend/eigene Instanz)

---

## Konsistenz der Statuswerte

**Status:** ✅ OK

---

## Tote Funktionen

**Status:** ✅ OK

---

## `console.error` / `DEBUG`

**Status:** ✅ Erledigt / 🔜 Phase 2 optional

**Umgesetzt:** `const DEBUG = false` in **`app.js`** und **`admin.js`**. Alle bisherigen **`console.error`‑Aufrufe** loggen nur, wenn `DEBUG === true` (sonst stille Fehlerbehandlung).

**🔜 Phase 2:** Im **Produktivbetrieb** optional zentrales Logging/Monitoring statt Konsole; `DEBUG` für interne Diagnose belassen.

---

## Barrierefreiheit (Basis)

**Status:** ✅ Erledigt

**Umgesetzt:** Buttons mit Emoji in **`admin.html`** haben **`aria-label`** (Anleitung, Koordinaten ermitteln, Speichern). Tour-Dialog in **`admin.js`:** `aria-label` für **Weiter** / **Fertig** (dynamisch) und **Tour beenden**.

---

## Zusammenfassung

| Thema | Status |
|-------|--------|
| XSS / `escapeHtml` | ✅ |
| `item.id` / Selektor | ✅ validiert |
| CSV-Rendering | ✅ |
| Nominatim URL + Encoding | ✅ |
| Nominatim Fehlertexte | ✅ |
| Nominatim User-Agent (Server) | 🔜 Phase 2 |
| SRI Leaflet | ✅ |
| Geheimnisse | ✅ |
| Beispieldaten / Datenschutz-Doku | ✅ |
| `DEBUG` + `console.error` | ✅ (Konsole prod-still / 🔜 Phase 2 Logging) |
| A11y Emoji-Buttons + Tour | ✅ |

---

*Dieses Dokument ersetzt keine professionelle Pentest-Prüfung oder Rechtsberatung (Datenschutz, Impressum, Kartennutzung).*
