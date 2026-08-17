---
id: F-BA-011
status: draft
updated: 2026-08-17
---

# Epic: Druckfunktionen

## Index
- Überblick — Druckdokumente
- 1. Artikelannahme-Liste — Annahme-Ausdruck
- 2. Verkäufer-Übersicht — Abrechnungs-Ausdruck
- 3. Druck-Technisches — Print-CSS
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Auslöser:** Automatisch nach Artikelannahme · Manuell über „Drucken"-Button in der Abrechnung

**Ziel:** Kassenpersonal druckt Artikelquittungen nach Annahme und Abrechnungsübersichten.

**User Story:** Als Kassenpersonal möchte ich nach der Artikelannahme und bei der Abrechnung einen Ausdruck erstellen, damit der Verkäufer eine physische Bestätigung erhält.

---

## Überblick

Zwei Druckdokumente werden unterstützt. Beim Drucken wird nur der relevante Content gerendert — keine Sidebar, kein Layout-Chrome.

---

## 1. Artikelannahme-Liste

**Auslöser:** Wird **automatisch** nach der Artikelannahme (Klick auf „Buchen" in Wizard Schritt 2) gestartet.

**Inhalt:**
- QR-Code mit der Verkäufer-ID
- Profilinformationen des Verkäufers (Name, Anschrift, Kontakt)
- Liste aller abgegebenen Artikel (im Verkauf)

**Zweck:** Wird dem Verkäufer mitgegeben als Bestätigung der Abgabe.

---

## 2. Verkäufer-Übersicht (bei Abrechnung)

**Auslöser:** Klick auf **„🖨️ Drucken"** in der Abrechnung-Seite.

**Inhalt:** Gleiche Struktur wie Artikelannahme-Liste, jedoch mit drei Artikelgruppen:

| Gruppe | Beschreibung |
|---|---|
| **Im Verkauf** | Artikel noch nicht verkauft — Verkäufer holt diese zurück |
| **Verkauft** | Erfolgreich verkauft |
| **Sonstige** | Z. B. beschädigt, zurückgezogen |

**Zweck:** Verkäufer nutzt diesen Ausdruck, um seine „Im Verkauf"-Artikel physisch einzusammeln.

---

## 3. Druck-Technisches

**Dieses Epic hat keine eigene Seite und keine Route.** Beide Ausdrucke entstehen als Aktion innerhalb eines Arbeitsschritts — automatisch nach dem Buchen in der Artikelannahme, per Button in der Abrechnung. Ein Menüpunkt „Drucken", hinter dem erst ausgewählt werden müsste, was zu drucken ist, wäre ein Umweg.

**Abgrenzung zur App Shell:** Die Basisregel „Sidebar und Layout-Chrome beim Drucken ausblenden" liefert [Epic_App_Shell](../Epic_App_Shell/epic.md) (BSHELL-S02 AC-6) für **jede** Seite. Dieses Epic ergänzt nur die beiden fachlichen Druckansichten mit ihrem eigenen Inhalt und Aufbau — kein gemeinsames Print-Stylesheet, das beides bedienen will.

- QR-Code wird client-seitig generiert (kein externer Service — Offline-Anforderung!) über die Shared-Component [`qr-code`](../../../../components/qr-code/component.md) (`@zxing/library`, SVG); dieselbe Komponente nutzt die Voranmelde-App für die Verkäufernummer-Anzeige

## Akzeptanzkriterien

1. **AC-1** — WHEN „Buchen" in der Artikelannahme geklickt wird, THEN SHALL das System den Druckdialog automatisch starten ohne weiteren Nutzereingriff.
2. **AC-2** — THE SYSTEM SHALL beim Druck QR-Code, Profilinformationen des Verkäufers und die Liste aller abgegebenen Artikel rendern.
3. **AC-3** — WHEN „🖨️ Drucken" in der Abrechnung geklickt wird, THEN SHALL das System den Druckdialog mit drei Artikelgruppen öffnen: Im Verkauf, Verkauft und Sonstige.
4. **AC-4** — THE SYSTEM SHALL für beide Ausdrucke eine eigene Druckansicht mit eigenem Aufbau rendern und dabei die Print-Basisregel der App Shell nutzen, statt Sidebar und Chrome erneut selbst auszublenden.
5. **AC-5** — THE SYSTEM SHALL den QR-Code ausschließlich clientseitig ohne externen Service generieren.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #druck #print-css #qr-code #artikelannahme #abrechnung
