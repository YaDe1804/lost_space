# Admin-Handbuch – Leerstandskataster

Diese Anleitung richtet sich an **Personen ohne Programmiererfahrung**, die die Daten zum Leerstand pflegen möchten.

---

## Erste Schritte – die Anleitung nutzen

Öffnen Sie die Datei **`admin.html`** im Browser (am besten über einen lokalen Webserver). Im Bereich **„Neuer Eintrag“** gibt es den Button **„Anleitung“**: Er startet eine **geführte Tour**, die **Schritt für Schritt** durch alle wichtigen Felder führt – mit kurzen Erklärungen und Beispielen. Sie können die Tour **jederzeit beenden** und später von vorne **neu starten**, wenn Sie sich noch einmal orientieren möchten.

---

## Datenschutz bei Live-Betrieb

**Hinweis:** Diese Hinweise ersetzen keine Rechtsberatung.

Echte **Adressen von Leerständen** sind **keine personenbezogenen Daten** im Sinne der DSGVO, **solange** keine **Eigentümer- oder Mieterdaten** gespeichert werden. Das Feld **„Notiz“** sollte **niemals** für **Personennamen**, private **Kontaktdaten** oder ähnliche Angaben genutzt werden – dort gehören sachliche Hinweise zur Gebäudesituation (Zustand, öffentlich bekannte Fakten, Quellen ohne Personenbezug).

---

## Einen neuen Eintrag hinzufügen

1. Öffnen Sie die Datei **`data/leerstände.json`** mit einem **Texteditor** (unter Windows z. B. Notepad, Notepad++ oder VS Code – kein Word).
2. Die Datei enthält eine **Liste** von Objekten in eckigen Klammern `[ ... ]`. Jedes Objekt steht in geschweiften Klammern `{ ... }` und ist vom **nächsten** durch ein **Komma** getrennt.
3. Fügen Sie **nach dem letzten bestehenden Objekt** ein Komma ein (falls noch keins da ist, **nur zwischen** zwei Objekten ein Komma setzen – **nie** ein Komma nach dem allerletzten Eintrag).
4. Kopieren Sie den folgenden Baustein und passen Sie die Werte an. **`id`** soll eine neue, noch nicht vergebene Nummer sein. **`stadtteil`** entspricht dem Stadtbezirk (z. B. *Innenstadt*, *Weststadt* – siehe bestehende Einträge in der Datei).

```json
{
  "id": 11,
  "adresse": "Musterweg 5",
  "ort": "Musterstadt",
  "stadtteil": "Innenstadt",
  "status": "leer",
  "wohneinheiten": 2,
  "leer_seit": "2025-01",
  "notiz": "Kurze Beschreibung für die Kolleg:innen",
  "lat": 48.7994,
  "lng": 9.7978
}
```

5. Datei **speichern**. Seite im Browser **neu laden** (F5), damit die Karte die Änderung lädt.

---

## Einen Eintrag bearbeiten

1. Öffnen Sie wieder **`data/leerstände.json`**.
2. Suchen Sie das Objekt anhand der **Adresse** oder der **`id`**.
3. **Status** ändern: nur die Wörter `leer`, `teilweise` oder `sanierung` verwenden (siehe Tabelle unten).
4. **Stadtteil**, **Notiz** oder **Wohneinheiten** anpassen.
5. Speichern und die Webseite im Browser neu laden.

---

## Koordinaten (lat / lng) herausfinden

Die Karte braucht **Breitengrad** (`lat`) und **Längengrad** (`lng`).

1. Öffnen Sie **[OpenStreetMap](https://www.openstreetmap.org/)** im Browser.
2. Suchen Sie die Adresse oder navigieren Sie zur Stelle.
3. **Rechtsklick** auf den genauen Punkt auf der Karte.
4. Wählen Sie **„Adresse zeigen“** bzw. die Option, die **Koordinaten** anzeigt (je nach Sprache leicht unterschiedlich).
5. Tragen Sie die Zahlen in `leerstände.json` ein: erst **Breite**, dann **Länge** – wie in der Beispieldatei.

---

## Status – welcher Begriff wofür?

| Wert in der Datei | Bedeutung auf der Karte |
|-------------------|-------------------------|
| `leer` | Komplett leer (roter Marker) |
| `teilweise` | Teilweise leer (oranger Marker) |
| `sanierung` | In Sanierung (blauer Marker) |

Schreiben Sie die Wörter **klein** und **ohne Leerzeichen**, genau wie in der Tabelle.

---

## Kartenhintergrund wählen (oben rechts)

Auf der **Karte** befindet sich **oben rechts** ein kleines Steuerelement („Ebenen“ / Layer-Symbol). Dort können Sie den **Kartenhintergrund** wechseln:

| Anzeigename in der Karte | Kurz erklärt |
|--------------------------|--------------|
| **Ruhig** | Schlichter, heller Hintergrund (Carto Positron, ohne viele Beschriftungen) – **Standard**, wenn Sie die Seite öffnen |
| **Beschriftet** | Ebenfalls hell, aber mit **mehr Straßennamen und Ortsbezeichnungen** (Carto Positron *light_all*) |
| **Detailliert** | Vollere OpenStreetMap-Karte mit vielen Details – gut, wenn Sie Umgebung und Verkehrswege genauer sehen möchten |

**Hinweis:** Diese Auswahl betrifft nur den **Hintergrund**. Ihre eingetragenen **Leerstands-Marker** bleiben dabei erhalten; es ändert sich nur die Darstellung der Basiskarte.

---

## Häufige Fehler

| Problem | Was tun |
|---------|---------|
| Die Karte lädt keine Daten mehr | Prüfen Sie, ob nach jedem Eintrag **ein Komma** steht – **außer** nach dem letzten Eintrag in der Liste. |
| „Syntaxfehler“ oder leere Karte | JSON erlaubt nur **gerade doppelte Anführungszeichen** `"` für Text – **keine** typografischen „Anführungszeichen“ aus Word. |
| Falscher Ort auf der Karte | `lat` und `lng` vertauscht? Koordinaten bei OSM erneut ablesen. |
| Seite zeigt alte Daten | Browser-Seite **hart neu laden** (Strg+F5) oder Cache leeren; Datei wirklich gespeichert? |

**Tipp:** Wenn Sie unsicher sind, ob die Datei noch gültig ist, können Sie den Inhalt in einem **JSON-Validator** im Internet einfügen (Suchbegriff: „JSON validator“).

---

## Karte auf einem neuen Rechner öffnen

1. Kopieren Sie den gesamten Ordner **`leerstandskarte`** auf den Rechner.
2. **Variante A:** Öffnen Sie **`index.html`** mit einem Browser (Doppelklick). Wenn die Liste und die Punkte erscheinen, passt alles.
3. **Variante B:** Zeigt der Browser keine Daten an, starten Sie kurz einen **kleinen lokalen Server** (siehe **Schnellstart** in der [README](README.md)) und öffnen Sie die angezeigte Adresse (z. B. `http://127.0.0.1:8765/`).

---

Bei strukturellen Fragen (API, Hosting) siehe **[ROADMAP](ROADMAP.md)** und die **ADR**-Dokumente im Ordner `docs/ADR/`.
