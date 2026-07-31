---
id: F-BA-011
status: draft
updated: 2026-07-31
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

- Print-CSS: Sidebar und alle Layout-Chrome-Elemente werden ausgeblendet (`display: none`)
- Nur der relevante Content-Bereich wird gedruckt
- QR-Code wird client-seitig generiert (kein externer Service — Offline-Anforderung!)

## Akzeptanzkriterien

1. **AC-1** — WHEN „Buchen" in der Artikelannahme geklickt wird, THEN SHALL das System den Druckdialog automatisch starten ohne weiteren Nutzereingriff.
2. **AC-2** — THE SYSTEM SHALL beim Druck QR-Code, Profilinformationen des Verkäufers und die Liste aller abgegebenen Artikel rendern.
3. **AC-3** — WHEN „🖨️ Drucken" in der Abrechnung geklickt wird, THEN SHALL das System den Druckdialog mit drei Artikelgruppen öffnen: Im Verkauf, Verkauft und Sonstige.
4. **AC-4** — THE SYSTEM SHALL beim Drucken Sidebar und alle Layout-Chrome-Elemente via Print-CSS auf `display: none` setzen, sodass nur der relevante Content gerendert wird.
5. **AC-5** — THE SYSTEM SHALL den QR-Code ausschließlich clientseitig ohne externen Service generieren.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #druck #print-css #qr-code #artikelannahme #abrechnung
