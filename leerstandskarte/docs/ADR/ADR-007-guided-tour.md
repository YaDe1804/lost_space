# ADR-007: Guided Tour im Admin-Panel

**Datum:** 2026-05-07  
**Status:** Akzeptiert

## Kontext

Das Admin-Panel soll von **Ehrenamtlichen** genutzt werden, die nicht zwingend technische Vorkenntnisse mitbringen. Eine geführte Erstbedienung kann Orientierung und Selbstvertrauen beim Ausfüllen des Formulars „Neuer Eintrag“ erhöhen.

## Entscheidung

Im Admin-Bereich wird ein **interaktiver Schritt-für-Schritt-Assistent** („**Guided Tour**“ / Walkthrough) für das Formular **„Neuer Eintrag“** angeboten. Die Umsetzung erfolgt mit **reinem JavaScript** und **ohne externe Tour-Bibliothek**.

## Begründung

- Zielgruppe: **ehrenamtliche Admins** ohne technischen Hintergrund – eine **geführte Erstbedienung** senkt die Hemmschwelle beim Einstieg.
- **Keine zusätzliche Abhängigkeit** (kein npm-Paket, kein CDN) – konsistent zum Ansatz des übrigen Prototyps.
- Volle **Kontrolle über Texte, Reihenfolge und Barrierearmut** (Sprache, ARIA, Tastatur) ohne Fremd-API eines Plugins.

## Konsequenzen

- Bei jedem **neuen Pflichtfeld** oder **geänderten Flow** im Formular muss die Tour **manuell** um weitere Schritte bzw. Anpassungen ergänzt werden.
- Wartung liegt beim Projektteam; es gibt keinen deklarativen „Form-Scan“ durch eine Bibliothek.

Siehe [ROADMAP – Phase 1](ROADMAP.md) und das [Admin-Handbuch](../ADMIN-HANDBUCH.md) zur Nutzerführung.
