# Feature: Druckfunktionen

**App:** Bazaar Haupt-App
**Auslöser:** Automatisch nach Artikelannahme · Manuell über „Drucken"-Button in der Abrechnung

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
