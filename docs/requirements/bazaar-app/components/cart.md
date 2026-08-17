---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: cart

**Bibliothek:** [`card`](../../../components/card/component.md) + [`button`](../../../components/button/component.md)
**Verwendung:** Nur Haupt-App — Kassenseite ([Epic_Verkauf](../epics/Epic_Verkauf/epic.md))

## Index
- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Aufbau — Zeilen, Summe, Footer
- 3. Verhalten — Hinzufügen, Entfernen, Leeren
- 4. Nach dem Buchen — Storno
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Warenkorb des Kassenvorgangs — Liste der gescannten Artikel mit Summe und Abschluss-Aktionen.

---

## Überblick

Der Warenkorb existiert **ausschließlich im Frontend**. Gespeichert wird erst die Buchung, und zwar als ein Vorgang über alle Artikel. Es gibt keine Kassenvorgang-Entität — der Umsatz ist die Summe der Preise der Artikel mit `soldAt`.

Damit ist der Warenkorb ein reiner Zustandshalter: Er weiß, was der Kunde gerade auf den Tresen gelegt hat, und verliert diesen Zustand beim Reload. Das ist gewollt; ein abgebrochener Kassenvorgang soll nichts hinterlassen.

---

## 1. ASCII-Darstellung

```
┌─────────────────────────────┐
│  🛒 Warenkorb                │
├─────────────────────────────┤
│  1043 Winterjacke   12,00 € 🗑│
│  1044 Gummistiefel   8,00 € 🗑│
│  1102 Puzzle         3,00 € 🗑│
├─────────────────────────────┤
│                Gesamt: 23,00 €│
├─────────────────────────────┤
│  [🗑 Leeren]     [💳 BUCHEN] │
└─────────────────────────────┘
```

Leerer Zustand: nur der Hinweistext „Warenkorb ist leer" (muted, 13 px, zentriert, padding 20 px 0). Der Footer erscheint dann **nicht**.

---

## 2. Aufbau

| Element | Stil |
|---|---|
| Cart-Item | flex `space-between`, `align-items: center`, padding 8 px 0, `border-bottom: 1 px #f2f4f6`, 13.5 px |
| Gesamt-Zeile | 700, 18 px, rechtsbündig, `padding-top: 10 px` |
| Footer | flex `space-between`, gap 8 px, `margin-top: 12 px`; nur sichtbar wenn nicht leer |
| „🗑 Leeren" | `p-button severity="secondary" [outlined]="true"` |
| „💳 BUCHEN" | `p-button severity="primary"`, 15 px |

---

## 3. Verhalten

| Aktion | Wirkung |
|---|---|
| Artikel hinzufügen (Preis-Button) | Eintrag anfügen, Eingabefeld leeren, **Fokus zurück** auf das Eingabefeld |
| Löschen-Button pro Eintrag | Eintrag entfernen, Eingabefeld leeren, Fokus zurück |
| „Leeren" | alle Einträge und das Eingabefeld leeren, Fokus zurück |

**Ein Artikel kann nur einmal im Korb liegen.** Wird eine Nummer gescannt, die schon enthalten ist, erscheint eine **gelbe** Meldung „Artikel ist bereits im Warenkorb" und **kein** Preis-Button.

Ohne diese Sperre zählt ein doppelt ausgelöster Handscanner den Artikel zweimal: Der Kunde zahlt doppelt, gebucht wird einmal, und in der Abstimmung fehlt Geld — zugunsten des Basars. Gelb und nicht rot, weil es kein Fehler des Kassenpersonals ist.

Der Fokus kehrt nach **jeder** Korb-Aktion ins Eingabefeld zurück. An der Kasse wird mit einem Handscanner gearbeitet, der wie eine Tastatur tippt — liegt der Fokus woanders, landet die nächste Nummer im Nirgendwo.

---

## 4. Nach dem Buchen

„BUCHEN" öffnet das [`payment-panel`](../../../components/payment-panel/component.md) (`totalLabel="Gesamtbetrag"`, `confirmLabel="Bezahlt"`). Nach erfolgreicher Buchung leert sich der Korb, und neben der Meldungsfläche erscheint **„Letzten Vorgang stornieren"**.

Der Storno-Button gilt nur für die eben gebuchten Artikel und verschwindet beim nächsten Scan. Die IDs hält das Frontend im Speicher — nach einem Reload ist Korrigieren wieder Admin-Sache über das [`article-status-popup`](article-status-popup.md).

**Stornierte Artikel kommen nicht in den Korb zurück.** Die Kasse scannt neu, was tatsächlich mitgeht; sonst wird aus „einen Artikel zurücklegen" ein Korb, den niemand mehr geprüft hat.

**Bei fehlgeschlagener Buchung bleibt der Korb unverändert stehen** — kein Artikel ist dann verkauft, und es kann erneut gebucht werden. Nennt die Antwort einen nicht mehr verkäuflichen Artikel, markiert der Korb den betroffenen Eintrag.

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL den Warenkorb ausschließlich im Frontend halten und nur die Buchung persistieren.
2. **AC-2** — IF eine Nummer gescannt wird, die bereits im Korb liegt, THEN SHALL das System eine gelbe Meldung anzeigen und keinen Preis-Button einblenden.
3. **AC-3** — WHEN ein Eintrag hinzugefügt, entfernt oder der Korb geleert wird, THEN SHALL der Fokus auf das Artikelnummer-Eingabefeld zurückkehren.
4. **AC-4** — WHILE der Korb leer ist, SHALL das System den Footer nicht rendern und den Hinweistext „Warenkorb ist leer" anzeigen.
5. **AC-5** — WHEN eine Buchung erfolgreich war, THEN SHALL das System den Korb leeren und den Storno-Button bis zum nächsten Scan anzeigen.
6. **AC-6** — WHEN ein Vorgang storniert wird, THEN SHALL das System die Artikel **nicht** in den Korb zurücklegen.
7. **AC-7** — IF eine Buchung fehlschlägt, THEN SHALL der Korb unverändert bleiben und der betroffene Eintrag markiert werden.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #verkauf #warenkorb #kasse #haupt-app
