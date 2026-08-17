---
status: draft
reviewed-date: 2026-08-14
updated: 2026-08-17
---

# Component: artikel-dialog (Meine Artikel)

## Kontext

Ein Dialog, zwei Modi: **Anlegen** (kein Löschen-Button, Nummer aus dem
Vorschlag-Endpoint) und **Bearbeiten** (Löschen-Button, Nummer aus dem Artikel).

```
Modus "Anlegen" (Modal, Standard-Größe):
┌─────────────────────────────────────────┐
│  Artikel anlegen                     [✕] │
├─────────────────────────────────────────┤
│  Artikelnummer  [104]  (readonly)        │
│  wird beim Speichern endgültig vergeben  │  ← Hinweistext (12 px, muted)
│  Bezeichnung                            │
│  Kategorie ▾+   Marke ▾+                │
│  Größe        Farbe                     │
│  Preis [_____] €                        │
│  Beschreibung [textarea]                │
├─────────────────────────────────────────┤
│                   [Abbrechen] [Speichern]│
└─────────────────────────────────────────┘

Modus "Bearbeiten":
┌─────────────────────────────────────────┐
│  Artikel bearbeiten                  [✕] │
├─────────────────────────────────────────┤
│  Artikelnummer  [104]  (readonly)        │
│  Bezeichnung                            │
│  Kategorie ▾+   Marke ▾+                │
│  Größe        Farbe                     │
│  Preis [_____] €                        │
│  Beschreibung [textarea]                │
├─────────────────────────────────────────┤
│  [Löschen]        [Abbrechen] [Speichern]│
└─────────────────────────────────────────┘

Klick "Löschen" →
┌─────────────────────────────────┐
│  ⚠ Artikel wirklich löschen?    │  ← p-confirmdialog
│           [Abbrechen] [Löschen] │
└─────────────────────────────────┘

Speichern im Modus "Anlegen", Nummer inzwischen vergeben (409) →
┌──────────────────────────────────────────────┐
│  Artikelnummer bereits vergeben              │  ← p-dialog, nur [OK]
│  Artikelnummer 104 ist inzwischen vergeben — │
│  neue Nummer: 105                            │
│                                       [OK]   │
└──────────────────────────────────────────────┘
        │ OK
        ▼
zurück im Anlege-Dialog, Nummer = 105, alle Eingaben erhalten,
Nutzer entscheidet erneut: [Abbrechen] oder [Speichern]
```

Modal-Muster: Standard-Größe, Footer „Mit Löschen" im Modus Bearbeiten,
Footer „Standard" im Modus Anlegen (siehe `docs/components/modal/component.md`).

## Aufbau

Querschnitts-Regeln (Validierung, Submit-Sperre, Enter, Feedback) → [form.md](form.md).

| Feld                | Anlegen | Bearbeiten | PrimeNG                                                                                                                                                                                                                                                                                |
| ------------------- | --- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artikelnummer       | ✅ Vorschlag | ✅ Ist-Wert | [Input](../standard/input.md), Variante Text, readonly                                                                                                                                                                                                                                             |
| Hinweis unter Nummer | ✅ | ❌ | Hinweistext (12 px, muted): „wird beim Speichern endgültig vergeben" — gleiche Ausprägung wie der Berechnungs-Hinweis in Epic_Verkaeufer Panel 04                                                                                                                                            |
| Bezeichnung         | ✅ | ✅ | [Input](../standard/input.md), Variante Text                                                                                                                                                                                                                                                       |
| Kategorie           | ✅ | ✅ | Shared [`autocomplete-create`](../../../../components/autocomplete-create/component.md)                                                                                                                                                                                                   |
| Marke               | ✅ | ✅ | Shared [`autocomplete-create`](../../../../components/autocomplete-create/component.md)                                                                                                                                                                                                   |
| Größe               | ✅ | ✅ | [Input](../standard/input.md), Variante Text                                                                                                                                                                                                                                                       |
| Farbe               | ✅ | ✅ | [Input](../standard/input.md), Variante Text                                                                                                                                                                                                                                                       |
| Preis               | ✅ | ✅ | Shared [`input-group`](../../../../components/input-group/component.md) (`p-inputgroup`+[Input](../standard/input.md) Variante Number+`p-inputgroupaddon` „€" rechts) — bewusst **nicht** Variante Icon, Suffix-Betrag passt besser zum InputGroup-Addon-Muster als zu einem Icon-Overlay |
| Beschreibung        | ✅ | ✅ | `pTextarea`                                                                                                                                                                                                                                                                            |
| Löschen-Button      | ❌ | ✅ | [Button](../standard/button.md) danger, Footer links                                                                                                                                                                                                                                               |
| Löschen-Bestätigung | ❌ | ✅ | [Confirmdialog](../standard/confirmdialog.md) — erst nach Bestätigung `DELETE /api/articles/:id`                                                                                                                                                                                                   |
| Abbrechen/Speichern | ✅ | ✅ | [Button](../standard/button.md) secondary outlined / primary, Footer rechts                                                                                                                                                                                                                        |
| Nummer-Konflikt-Dialog | ✅ | ❌ | Modal, Footer-Muster „Nur Schließen" mit Label „OK" (siehe `docs/components/modal/component.md`) — kein Confirmdialog, es gibt nichts zu bestätigen oder abzubrechen |

## Artikelnummer im Modus „Anlegen"

1. Beim Öffnen ruft der Dialog [`GET /api/articles/next-number`](../../api/articles.md) und
   zeigt den Wert schreibgeschützt an. Bis die Antwort da ist, bleibt das Feld leer
   und der Speichern-Button gesperrt.
2. Scheitert der Abruf mit `409 article.no_free_number`, öffnet der Dialog gar
   nicht — stattdessen erscheint die Meldung „Keine freie Artikelnummer verfügbar
   — bitte Admin kontaktieren" als [Toast](../standard/toast.md).
3. Beim Speichern schickt das Frontend den angezeigten Wert als
   `expectedNumber` mit. Antwortet das Backend `409 article.number_taken`, zeigt
   der Konflikt-Dialog `detail` aus der Antwort. Nach „OK" **bleibt der
   Anlege-Dialog offen**: Alle Eingaben bleiben erhalten, nur das Nummernfeld
   übernimmt `nextNumber` aus der Antwort. Der Nutzer entscheidet erneut zwischen
   Abbrechen und Speichern — kein automatischer Wiederholungsversuch.

## Validierung

Feldregeln nach [form.md](form.md) R-1/R-2. Dialog-spezifisch: Preis > 0
(Epic_Meine_Artikel AC-6), Pflichtfelder aus Abschnitt 3 der Epic-Doku (AC-2).
Die Artikelnummer ist in beiden Modi readonly und nimmt an der Validierung nicht
teil.

## Akzeptanzkriterien

Siehe Epic_Meine_Artikel AC-1, AC-2, AC-5, AC-6, AC-7, AC-8 — diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #meine-artikel #dialog #autocomplete-create #inputgroup #confirmdialog #primeng
