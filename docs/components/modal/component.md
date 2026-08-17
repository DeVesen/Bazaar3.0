---
id: C-012
status: draft
updated: 2026-08-17
---

# Component: Modal (`p-dialog`)

**Bibliothek:** PrimeNG — `p-dialog`
**Verwendung:** Beide Apps — überall dort, wo Inhalte in einem modalen Dialog angezeigt oder bearbeitet werden.

## Index

- Überblick — Konzept
- 1. Backdrop & Schatten — Visuelle Rahmenbedingungen
- 2. Größenvarianten — sm / Standard / lg
- 3. Dialog-Bereiche — Header / Body / Footer
- 4. Footer-Muster — Schaltflächen-Kombinationen
- 5. Responsive — Mobile Anpassung
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Thematische Einordnung

**Beschreibung:** Modaler Dialog auf Basis von `p-dialog` mit einheitlichem Backdrop, Schatten, drei Größenvarianten und definierten Footer-Mustern.

**Verwendungszweck:** Wird für Erstellen/Bearbeiten von Datensätzen, Bestätigungs-Aktionen und einfache Lookup-Dialoge eingesetzt.

---

## Überblick

Das Modal ist die einheitliche Lösung für alle modalen Interaktionen in beiden Apps. Es definiert Backdrop, Schatten, Border-Radius, drei Größenvarianten (`sm`, Standard, `lg`) sowie drei Footer-Muster. Die Footer-Muster sind in beiden Apps identisch.

---

## 1. Backdrop & Schatten

| Eigenschaft | Wert |
|---|---|
| Backdrop | `rgba(0,0,0,0.52)` |
| Box-Shadow | `0 20px 60px rgba(0,0,0,0.3)` |
| Border-radius | 10 px (Desktop) / 0 (Mobile ≤ 768 px) |
| Max-Height | 90 vh |

---

## 2. Größenvarianten

| Größe | Max-Breite | Einsatz Bazaar-App | Einsatz Voranmelde-App |
|---|---|---|---|
| `sm` | 420 px | Checkout, Marke, Kategorie, Typ | Marke, Kategorie, Typ |
| Standard | 80 % / max 700 px | Seller-Edit, Freigabe, Rückgabe | Artikel-Dialog |
| `lg` | max 940 px | — | Admin-Seller-Dialog |

> `lg` wird ausschließlich in der Voranmelde-App verwendet.

---

## 3. Dialog-Bereiche

| Bereich | Padding | Details |
|---|---|---|
| Header | 17 px 20 px | Titel 700 / 16 px; Schließen-Button kein BG, 22 px, muted |
| Body | 20 px | `overflow-y: auto` |
| Footer | 13 px 20 px | Standard: `flex-end`, gap 8 px · Mit Löschen: `space-between` |

---

## 4. Footer-Muster

| Muster | Layout |
|---|---|
| Standard | Rechts: `[Abbrechen (secondary outlined)]` `[Speichern (primary)]` |
| Mit Löschen | Links: `[Löschen (danger)]` · Rechts: `[Abbrechen]` `[Speichern]` |
| Nur Schließen | Rechts: `[Schließen (secondary outlined)]` |
| Standard + Zweitaktion | Rechts: `[Abbrechen (text)]` `[Zweitaktion (secondary outlined)]` `[Speichern (primary)]` |

Alle vier Muster gelten identisch für beide Apps.

**Muster „Standard + Zweitaktion":** für Dialoge, die neben dem regulären
Speichern eine zweite, gleichwertige Speicher-Variante anbieten — heute nur
„Speichern + kopieren" im
[artikel-dialog](../../requirements/advance-registration/components/forms/artikel-dialog.md).
Abbrechen fällt hier auf `text` zurück: drei Buttons in einer Reihe, von denen
zwei gleich aussehen, lesen sich nicht mehr als Rangfolge. Die Rangfolge von
links nach rechts ist Abbruch → Nebenweg → Hauptweg. Genau **eine** Zweitaktion,
kein Sammelplatz für weitere Buttons; ab der zweiten gehört die Aktion in ein
Split-Button-Menü.

---

## 5. Responsive

| Viewport | Border-radius |
|---|---|
| Desktop (> 768 px) | 10 px |
| Mobil (≤ 768 px) | 0 |

---

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL den Backdrop mit `rgba(0,0,0,0.52)` und den Dialog-Schatten mit `0 20px 60px rgba(0,0,0,0.3)` rendern.
2. **AC-2** — THE SYSTEM SHALL die Größenvarianten `sm` (max 420 px), Standard (80 % / max 700 px) und `lg` (max 940 px) unterstützen.
3. **AC-3** — THE SYSTEM SHALL den Header mit Padding 17 px 20 px, Titel in 700 / 16 px und einem Schließen-Button ohne Hintergrund (22 px, muted) rendern.
4. **AC-4** — THE SYSTEM SHALL den Body mit Padding 20 px und `overflow-y: auto` rendern.
5. **AC-5** — THE SYSTEM SHALL den Footer im Muster „Standard" als `flex-end` mit gap 8 px rendern, im Muster „Mit Löschen" als `space-between` mit dem Löschen-Button (danger) links und Abbrechen/Speichern rechts.
6. **AC-6** — WHEN der Viewport ≤ 768 px ist, THEN SHALL das System den Border-radius auf 0 setzen.
7. **AC-7** — THE SYSTEM SHALL den Footer im Muster „Standard + Zweitaktion" als `flex-end` mit gap 8 px rendern, in der Reihenfolge Abbrechen (text) · Zweitaktion (secondary outlined) · Speichern (primary), und höchstens eine Zweitaktion zulassen.

---

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #modal #dialog #primeng #p-dialog #footer-muster #groessenvarianten
