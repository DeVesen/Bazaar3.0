---
id: F-BA-002
code: VERKAUF
status: draft
updated: 2026-08-18
---

# Epic: Verkauf

## Index
- Überblick — Kassenmodus
- 1. Seiten-Layout — Grid-Aufteilung
- 2. Artikelnummer-Eingabe — Scan & Suche
- 3. Warenkorb — Artikel & Summe
- 4. Buchung / Bezahlpopup — Abschluss
- 5. Storno des letzten Vorgangs — Korrektur an der Kasse
- 6. InfoArea-Zustände — Rückmeldungen
- 7. Fokus-Verhalten — Eingabefokus
- 8. Backend & API — Endpoints
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** Tagesgeschäft → Verkauf
**Route:** `/checkout`
**Sichtbar für:** Admin und Kassenpersonal

Component-Details → [`cart`](../../components/cart.md) · [`payment-panel`](../../../../components/payment-panel/component.md)

**Ziel:** Kassenpersonal scannt Artikel per Barcode und schließt den Bezahlvorgang ab.

**User Story:** Als Kassenpersonal möchte ich Artikel per Barcode-Scan zum Warenkorb hinzufügen und den Verkauf abrechnen, damit Kunden zügig bedient werden.

---

## Überblick

Kassenvorgang mit Artikelnummer-Eingabe (USB-Barcode-Scanner, Kamera-Scan oder Numpad), Warenkorb und Bezahlpopup.

---

## 1. Seiten-Layout

```
┌─────────────────────────┬─────────────────────────┐
│  Artikelnummer eingeben │  🛒 Warenkorb            │
│  (50 %)                 │  (50 %)                  │
│                         │                          │
│  [InputGroup]           │  [Artikel-Liste]         │
│  [InfoArea]             │  [Gesamt: XX,XX €]       │
│  [Preis-Button*]        │  [🗑 Leeren] [💳 BUCHEN] │
└─────────────────────────┴─────────────────────────┘
```
*erscheint nur nach erfolgreicher Artikel-Erkennung

- Outer-Grid: `grid-template-columns: 1fr 1fr`, gap 14 px

---

## 2. Artikelnummer-Eingabe

### Eingabemöglichkeiten

Das Artikelnummer-Feld ist eine [InputGroup](../../../../components/input-group/component.md)
mit `modes = ['keyboard', 'camera', 'numpad']`. Die Umschaltmechanik steht dort in
Abschnitt 3; hier stehen nur die Verkauf-spezifischen Ausprägungen.

| Modus | Ausprägung im Verkauf |
|---|---|
| Tastatur | Startmodus. Der **USB-Barcode-Scanner** tippt die Nummer hierhin und bestätigt mit Enter |
| Kamera | Inline-Kamerabild an der Position des Feldes ([Barcode-Scanner](../../../../components/barcode-scanner/component.md)) — kein Modal. Nach dem ersten Treffer kehrt das Feld in den zuvor aktiven Modus zurück |
| Numpad | `showDecimal="false"` (Artikelnummern sind ganzzahlig), `showEnter="true"`; `⏎` löst den Artikel-Lookup aus |

**Die Kamera verlässt sich nach einem Treffer selbst.** Anders als beim Dauerscan der
Artikelannahme ([ANNAHME-S01](../Epic_Artikelannahme/stories/ANNAHME-S01-inline-camera-mode.md))
wird hier kassiert: Der erkannte Artikel geht **nicht** direkt in den Warenkorb, sondern
erst per Klick auf den Preis-Button. Bliebe die Kamera aktiv, liefe der Scanner während
dieser Bestätigung weiter und erfasste den nächstbesten Artikel im Bild.

Details → [VERKAUF-S01](stories/VERKAUF-S01-eingabemodi.md)

### Artikel-Erkennung

Nach Eingabe / Scan wird der Artikel gesucht:

| Ergebnis | InfoArea | Text |
|---|---|---|
| **Erkannt & im Verkauf** | `success` | Preis des Artikels; Preis-Button wird aktiv |
| **Bereits im Warenkorb** | `warn` | „Artikel ist bereits im Warenkorb." — **kein** Preis-Button |
| Nummer unbekannt | `error` | „Artikelnummer *n* ist nicht bekannt." |
| noch nicht freigegeben (`Registriert`) | `error` | „Artikel *n* ist noch nicht freigegeben — zuerst annehmen." |
| bereits verkauft | `error` | „Artikel *n* ist bereits verkauft." |
| zurückgegeben | `error` | „Artikel *n* wurde an den Verkäufer zurückgegeben." |

**Konkrete Texte statt eines generischen Hinweises**, weil die Fälle verschiedene Handlungen nach sich ziehen: Bei „noch nicht freigegeben" gehört der Artikel in die Artikelannahme, bei „zurückgegeben" gar nicht mehr auf den Tresen.

Der Fall **zurückgegeben** ist der praktisch häufigste dieser Fehler: Ein zurückgegebener Artikel bleibt liegen, weil der Verkäufer ihn vergessen hat, und landet später an der Kasse. Ein generischer Text würde die Kasse rätseln lassen.

**Einen Fall „Verkäufer ist abgerechnet" gibt es hier nicht** — er kann regulär nicht entstehen: Abrechnen ist gesperrt, solange ein Artikel im Verkauf ist, also ist jeder Artikel eines abgerechneten Verkäufers verkauft oder zurückgegeben und fällt damit schon in eine der Zeilen oben.

**Ein Artikel kann nur einmal im Warenkorb liegen.** Ohne diese Sperre zählt ein doppelt ausgelöster Handscanner den Artikel zweimal: Der Kunde zahlt doppelt, gebucht wird einmal, und in der Abstimmung fehlt Geld — zugunsten des Basars. Die Warnung ist gelb und nicht rot, weil es kein Fehler des Kassenpersonals ist.

### Preis-Button

Erscheint nach erfolgreicher Erkennung. **Volle Breite** (`width: 100%`), font-size 16 px, `p-button severity="success"`.
Caption: **ausschließlich der Preis** (z. B. `24,00 €`), kein weiterer Text.

Klick → Artikel in den Warenkorb; Eingabefeld leert sich; InfoArea zeigt *„Nächsten Artikel eingeben …"* (grün).

---

## 3. Warenkorb

- Liste aller hinzugefügten Artikel der aktuellen Transaktion
- **Cart-Item:** flex space-between, align-items center, padding 8 px 0, border-bottom 1 px `#f2f4f6`, 13.5 px
- **Warenkorb leer:** Hinweistext „Warenkorb ist leer" (muted, 13 px, text-align center, padding 20 px 0)
- **Gesamt-Zeile:** 700, 18 px, text-align right, padding-top 10 px

**Löschen-Button pro Eintrag:**
- Entfernt den Eintrag aus dem Warenkorb
- Eingabefeld wird geleert
- Eingabefeld erhält den Fokus

**Footer** (nur sichtbar wenn Warenkorb nicht leer):
`display: flex; justify-content: space-between; gap: 8px; margin-top: 12px`
- Links: „🗑 Leeren" (`p-button severity="secondary" [outlined]="true"`)
- Rechts: „💳 BUCHEN" (`p-button severity="primary"`, 15 px)

**„Leeren"-Button:**
- Warenkorb und Eingabefeld werden geleert
- Eingabefeld erhält Fokus

Der Warenkorb wird **nicht** persistent in der DB gespeichert — nur die finale Buchung.

**Es gibt bewusst keine Kassenvorgang-Entität.** Gespeichert wird ausschließlich `soldAt` je Artikel; der Umsatz ist die Summe der Preise verkaufter Artikel. Eine Vorgangs-Tabelle brächte eine zweite Wahrheit über denselben Umsatz, die auseinanderläuft, sobald ein Admin einen Zeitstempel korrigiert. Kennzahlen wie Durchschnittsbon sind für einen Kinderbasar kein geäußerter Bedarf, und Belege werden nicht gedruckt. Eine Bon-Historie wäre ein eigenes Epic mit einer eigenen Entscheidung, welche der beiden Summen maßgeblich ist.

---

## 4. Buchung / Bezahlpopup

→ Komponente: [Payment-Panel](../../../../components/payment-panel/component.md) — `totalLabel="Gesamtbetrag"` · `confirmLabel="Bezahlt"`

Klick auf **„BUCHEN"** → Popup (Größe `sm`) öffnet sich — **ohne** nochmalige Artikelauflistung:

### Popup-Inhalt

1. **Gesamt-Zeile:** flex space-between, 700, 19 px, border-top 2 px `--border`, mt 6 px, pt 10 px
2. **InputGroup** „Betrag erhalten (€)" — `modes = ['keyboard', 'numpad']`, €-Addon rechts, mt 16 px. Aufbau und `⏎`-Verhalten → [Payment-Panel](../../../../components/payment-panel/component.md)
3. **Rückgeld-Box:** 32 px, 800, text-align center, padding 14 px, background `#e8f8f0`, radius 8 px, color `#1a5c38`, margin 12 px 0

**„Betrag erhalten" und Rückgeld werden nicht gespeichert** — reine Rechenhilfe für den Moment am Tresen. Der Umsatz steht ohnehin fest: Er ist die Summe der Preise der Artikel mit `soldAt`. Was der Kunde hingelegt und zurückbekommen hat, ergäbe eine Zahl, die niemand prüft. Dieselbe Regel gilt bei der Annahmegebühr ([Epic_Artikelannahme](../Epic_Artikelannahme/epic.md) Abschnitt 4).

### Buchungsablauf

Klick auf **„Bezahlt"** löst **einen** Request aus (`POST /api/sales`, Abschnitt 8):
1. Alle Warenkorb-Artikel erhalten in einer Transaktion `soldAt = jetzt`; `soldManually` bleibt dabei `false` — es kennzeichnet ausschließlich Verkäufe ohne Kassenvorgang ([Epic_Artikel](../Epic_Artikel/epic.md) Abschnitt 3)
2. Warenkorb leert sich
3. Artikelnummer-Eingabe leert sich
4. InfoArea zeigt: *„Ersten Artikel eingeben bitte …"* (blau)
5. Der Storno-Button für diesen Vorgang erscheint (Abschnitt 5)

Schlägt der Request fehl, bleibt der Warenkorb **unverändert** stehen, damit erneut gebucht werden kann — kein Artikel ist dann verkauft.

---

## 5. Storno des letzten Vorgangs

Direkt nach einer Buchung erscheint neben der InfoArea ein Button **„Letzten Vorgang stornieren"**. Er gilt ausschließlich für die eben gebuchten Artikel und verschwindet, sobald der nächste Artikel gescannt wird.

Klick → `soldAt` aller Artikel dieses Vorgangs wird zurückgesetzt. Die Artikel landen **nicht** wieder im Warenkorb: Die Kasse scannt neu, was tatsächlich mitgeht — sonst wird aus einem „einen Artikel zurücklegen" ein Korb, den niemand mehr geprüft hat.

**Auch für Kassenpersonal**, weil es der eigene Vorgang der letzten Sekunden ist. Der Fall ist an einer Basar-Kasse der häufigste überhaupt: Der Kunde legt an der Kasse doch etwas zurück, oder ein Artikel wurde zu viel gescannt. Ohne diesen Button müsste ein Admin auf einer anderen Seite einzeln korrigieren, während die Schlange wartet.

**Alles Ältere bleibt Admin-Sache** über das Artikel-Status-Popup ([Epic_Artikel](../Epic_Artikel/epic.md) Abschnitt 3). Der Button ist sitzungsgebunden — nach einem Reload ist er weg, weil es keine Kassenvorgang-Entität gibt (Abschnitt 3). Das ist bewusst: Er löst das Problem der nächsten zehn Sekunden, nicht die Historie.

---

## 6. InfoArea-Zustände (Verkauf-Kontext)

| Zeitpunkt | Typ | Text |
|---|---|---|
| Navigieren zur Verkauf-Seite | `info` | *„Ersten Artikel eingeben …"* |
| Nach Buchen | `info` | *„Ersten Artikel eingeben …"* |
| Nach Leeren des Warenkorbs | `info` | *„Ersten Artikel eingeben …"* |
| Nach erfolgreichem Scan | `success` | Preis des Artikels |
| Artikel schon im Warenkorb | `warn` | *„Artikel ist bereits im Warenkorb"* |
| Unbekannter Artikel / falscher Status | `error` | Fehlerhinweis |

---

## 7. Fokus-Verhalten

- Beim Navigieren zur Verkauf-Seite: Fokus auf Artikelnummer-Eingabefeld (`pAutoFocus`)
- Nach jedem Warenkorb-Vorgang: Fokus zurück auf Eingabefeld

---

## 8. Backend & API

API-Details → [`api/sales.md`](../../api/sales.md), [`api/articles.md`](../../api/articles.md)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/articles/by-number/{number}` | `authenticated` | Artikel-Erkennung beim Scan; liefert Artikel samt abgeleitetem Status |
| `POST /api/sales` | `authenticated` | **Ein atomarer Vorgang:** Liste der Artikel-IDs, setzt an allen `soldAt = jetzt` |
| `POST /api/sales/undo` | `authenticated` | Setzt `soldAt` der übergebenen Artikel-IDs zurück (Storno, Abschnitt 5) |

**`POST /api/sales` prüft den Status erneut.** Der Scan liegt bei einem großen Warenkorb Minuten vor dem Buchen; in der Zwischenzeit kann ein Artikel seinen Status geändert haben. Ist einer nicht mehr verkäuflich, wird der **ganze** Vorgang mit `409` abgelehnt und die betroffene Artikelnummer genannt, damit die Kasse weiß, welchen Artikel sie herausnehmen muss.

Entweder alle Artikel sind gebucht oder keiner: Ein halb gebuchter Kassenvorgang ist nicht mehr zu reparieren, wenn der Kunde bereits gegangen ist.

## Akzeptanzkriterien

1. **AC-1** — WHEN die Verkauf-Seite geöffnet wird, THEN SHALL das System den Fokus auf das Artikelnummer-Eingabefeld setzen und eine blaue InfoArea mit Text „Ersten Artikel eingeben …" anzeigen.
2. **AC-2** — WHEN eine Artikelnummer eingegeben wird und der Artikel im Verkauf ist (`releasedAt` gesetzt, `soldAt` und `returnedAt` leer), THEN SHALL das System eine grüne InfoArea mit dem Artikelpreis und einen aktiven Preis-Button anzeigen.
3. **AC-3** — IF eine Artikelnummer nicht gefunden wird oder der Artikel nicht im Verkauf ist, THEN SHALL das System eine rote InfoArea mit einem Fehlerhinweis anzeigen.
4. **AC-4** — WHEN der Preis-Button geklickt wird, THEN SHALL das System den Artikel zum Warenkorb hinzufügen, das Eingabefeld leeren und den Fokus zurücksetzen.
5. **AC-5** — WHEN „Leeren" geklickt wird, THEN SHALL das System den Warenkorb leeren, das Eingabefeld leeren und eine blaue InfoArea anzeigen.
6. **AC-6** — WHILE der empfangene Betrag kleiner als der Gesamtbetrag ist, SHALL das System den „Bezahlt"-Button deaktiviert halten.
7. **AC-7** — WHEN „Bezahlt" geklickt wird, THEN SHALL das System alle Warenkorb-Artikel in **einem** Request mit `soldAt = jetzt` speichern und den Warenkorb leeren.
8. **AC-8** — IF beim Buchen mindestens ein Artikel nicht mehr verkäuflich ist, THEN SHALL das System **keinen** Artikel als verkauft speichern, mit `409` antworten, die betroffene Artikelnummer nennen und den Warenkorb unverändert stehen lassen.
9. **AC-9** — IF eine Artikelnummer gescannt wird, die bereits im Warenkorb liegt, THEN SHALL das System eine gelbe InfoArea „Artikel ist bereits im Warenkorb" anzeigen und keinen Preis-Button einblenden.
10. **AC-10** — WHEN eine Buchung erfolgreich war, THEN SHALL das System einen Button „Letzten Vorgang stornieren" anzeigen, der bis zum nächsten Scan sichtbar bleibt.
11. **AC-11** — WHEN „Letzten Vorgang stornieren" geklickt wird, THEN SHALL das System `soldAt` aller Artikel dieses Vorgangs zurücksetzen und die Artikel **nicht** in den Warenkorb zurücklegen — auch mit der Rolle Kassenpersonal.
12. **AC-12** — THE SYSTEM SHALL „Betrag erhalten" und Rückgeld nicht persistieren.
13. **AC-13** — WHEN ein gescannter Artikel nicht verkäuflich ist, THEN SHALL das System den zum Zustand gehörenden Text anzeigen (unbekannt, nicht freigegeben, bereits verkauft, zurückgegeben) und **keinen** generischen Fehlerhinweis verwenden.

## Stories

- [VERKAUF-S01 — Drei Eingabemodi im Kassenvorgang](stories/VERKAUF-S01-eingabemodi.md)

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #verkauf #warenkorb #barcode-scanner #kasse #bezahlung
