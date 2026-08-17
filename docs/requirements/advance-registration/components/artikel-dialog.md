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
│ [Abbrechen] [Speichern + kopieren] [Speichern]│
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

Klick "Speichern + kopieren", 201 →
┌─────────────────────────────────────────┐
│  Artikel anlegen                     [✕] │  ← Dialog bleibt offen
├─────────────────────────────────────────┤
│  Artikelnummer  [105]  (readonly)        │  ← nextNumber aus dem 201
│  Bezeichnung  [▓Body langarm▓]          │  ← Fokus, Inhalt selektiert
│  Kategorie ▾+   Marke ▾+                │  ← alle übrigen Werte bleiben
│  ...                                    │
└─────────────────────────────────────────┘
   Toast: ✓ Artikel 104 gespeichert — nächste Nummer: 105
```

Modal-Muster: Standard-Größe, Footer „Mit Löschen" im Modus Bearbeiten,
Footer „Standard + Zweitaktion" im Modus Anlegen (siehe
`docs/components/modal/component.md`).

## Aufbau

Querschnitts-Regeln (Validierung, Submit-Sperre, Enter, Feedback) → [form.md](../../../components/form/component.md).

| Feld                | Anlegen | Bearbeiten | PrimeNG                                                                                                                                                                                                                                                                                |
| ------------------- | --- | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artikelnummer       | ✅ Vorschlag | ✅ Ist-Wert | [Input](../../../components/input/component.md), Variante Text, readonly                                                                                                                                                                                                                                             |
| Hinweis unter Nummer | ✅ | ❌ | Hinweistext (12 px, muted): „wird beim Speichern endgültig vergeben" — gleiche Ausprägung wie der Berechnungs-Hinweis in Epic_Verkaeufer Panel 04                                                                                                                                            |
| Bezeichnung         | ✅ | ✅ | [Input](../../../components/input/component.md), Variante Text                                                                                                                                                                                                                                                       |
| Kategorie           | ✅ | ✅ | Shared [`autocomplete-create`](../../../components/autocomplete-create/component.md)                                                                                                                                                                                                   |
| Marke               | ✅ | ✅ | Shared [`autocomplete-create`](../../../components/autocomplete-create/component.md)                                                                                                                                                                                                   |
| Größe               | ✅ | ✅ | [Input](../../../components/input/component.md), Variante Text                                                                                                                                                                                                                                                       |
| Farbe               | ✅ | ✅ | [Input](../../../components/input/component.md), Variante Text                                                                                                                                                                                                                                                       |
| Preis               | ✅ | ✅ | Shared [`input-group`](../../../components/input-group/component.md) (`p-inputgroup`+[Input](../../../components/input/component.md) Variante Number+`p-inputgroupaddon` „€" rechts) — bewusst **nicht** Variante Icon, Suffix-Betrag passt besser zum InputGroup-Addon-Muster als zu einem Icon-Overlay |
| Beschreibung        | ✅ | ✅ | `pTextarea`                                                                                                                                                                                                                                                                            |
| Löschen-Button      | ❌ | ✅ | [Button](../../../components/button/component.md) danger, Footer links                                                                                                                                                                                                                                               |
| Löschen-Bestätigung | ❌ | ✅ | [Confirmdialog](../../../components/confirmdialog/component.md) — erst nach Bestätigung `DELETE /api/articles/:id`                                                                                                                                                                                                   |
| Abbrechen/Speichern | ✅ | ✅ | [Button](../../../components/button/component.md), Footer rechts — im Modus Anlegen Abbrechen `text` (Footer-Muster „Standard + Zweitaktion"), im Modus Bearbeiten `secondary outlined`; Speichern immer `primary` |
| Speichern + kopieren | ✅ | ❌ | [Button](../../../components/button/component.md) secondary outlined, Tooltip „Artikel speichern und einen weiteren mit denselben Werten anlegen" — siehe Abschnitt „Speichern + kopieren". Nur im Modus „Anlegen": ein bestehender Artikel wird bearbeitet, nicht vervielfacht |
| Nummer-Konflikt-Dialog | ✅ | ❌ | Modal, Footer-Muster „Nur Schließen" mit Label „OK" (siehe `docs/components/modal/component.md`) — kein Confirmdialog, es gibt nichts zu bestätigen oder abzubrechen |

## Artikelnummer im Modus „Anlegen"

1. Beim Öffnen ruft der Dialog [`GET /api/articles/next-number`](../api/articles.md) und
   zeigt den Wert schreibgeschützt an. Bis die Antwort da ist, bleibt das Feld leer
   und der Speichern-Button gesperrt.
2. Scheitert der Abruf mit `409 article.no_free_number`, öffnet der Dialog gar
   nicht — stattdessen erscheint die Meldung „Keine freie Artikelnummer verfügbar
   — bitte Admin kontaktieren" als [Toast](../../../components/toast/component.md).
3. Beim Speichern schickt das Frontend den angezeigten Wert als
   `expectedNumber` mit. Antwortet das Backend `409 article.number_taken`, zeigt
   der Konflikt-Dialog `detail` aus der Antwort. Nach „OK" **bleibt der
   Anlege-Dialog offen**: Alle Eingaben bleiben erhalten, nur das Nummernfeld
   übernimmt `nextNumber` aus der Antwort. Der Nutzer entscheidet erneut zwischen
   Abbrechen und Speichern — kein automatischer Wiederholungsversuch.

## Speichern + kopieren

Serien-Erfassung: fünf Bodys Größe 74, gleiche Marke, gleicher Preis — nur die
Bezeichnung wechselt. „Speichern + kopieren" spart pro Artikel das erneute
Öffnen des Dialogs und das Nachpflegen aller gleichbleibenden Felder.

1. Der Klick sendet dasselbe `POST /api/articles` wie „Speichern", mit demselben
   `expectedNumber`. Fachlich identisch — der Unterschied liegt ausschließlich im
   Verhalten **nach** der Antwort.
2. Während des Requests sind **Abbrechen, Speichern + kopieren und Speichern
   gesperrt**, ein Spinner läuft auf dem geklickten Button. Zwei Artikel aus einem
   Doppelklick sind hier der teuerste Fehler: die Nummer ist verbraucht und wird
   auch nach dem Löschen nicht wiederverwendet
   ([`api/articles.md`](../api/articles.md) Abschnitt 5).
3. **Nur bei `201`:** Der Dialog **bleibt offen**. Kein Feld wird geleert — alle
   Werte bleiben stehen, auch die Bezeichnung. Das Nummernfeld übernimmt
   `nextNumber` aus der Antwort. Der Fokus springt in die Bezeichnung und
   **selektiert deren gesamten Inhalt**, sodass Tippen sie überschreibt, ein
   unveränderter Wert aber erhalten bleibt. Das Formular gilt danach wieder als
   `pristine`: die Werte kamen gerade durch die Validierung, hängende
   Fehlermarkierungen wären Altlast des Vorgängers.
4. Die Tabelle dahinter wird **sofort** aktualisiert, nicht erst beim Schließen —
   sonst zeigt die Liste beim späteren Abbrechen falsche Zahlen.
5. Ein [Toast](../../../components/toast/component.md) meldet „✓ Artikel *n* gespeichert — nächste
   Nummer: *m*". Beide Nummern in einer Aussage: der Dialog bleibt stehen und
   zeigt schon *m*, während der Verkäufer noch das Etikett für *n* beschriftet.
6. **Fehlerfälle:** `409 article.number_taken` verhält sich exakt wie beim
   normalen Speichern (Konflikt-Dialog, Eingaben erhalten, neue Nummer, kein
   automatischer Wiederholungsversuch) — es wurde nichts angelegt, also gibt es
   nichts zu kopieren. Antwortet der Server `201`, kann er aber **keine nächste
   Nummer** mehr liefern (`nextNumber` fehlt, global keine freie Nummer), dann
   **schließt** der Dialog und zeigt den Toast „Keine freie Artikelnummer
   verfügbar — bitte Admin kontaktieren" (gleiche Meldung wie AC-8). Gespeichert
   ist gespeichert; ein offener Anlege-Dialog ohne vergebbare Nummer ist eine
   Sackgasse.

**Enter bleibt „Speichern"** (Dialog schließt) — Serien-Erfassung ist die
Ausnahme und wird bewusst geklickt.

## Validierung

Feldregeln nach [form.md](../../../components/form/component.md) R-1/R-2. Dialog-spezifisch: Preis > 0
(Epic_Meine_Artikel AC-6), Pflichtfelder aus Abschnitt 3 der Epic-Doku (AC-2).
Die Artikelnummer ist in beiden Modi readonly und nimmt an der Validierung nicht
teil.

## Akzeptanzkriterien

Siehe Epic_Meine_Artikel AC-1, AC-2, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10 — diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #meine-artikel #dialog #autocomplete-create #inputgroup #confirmdialog #primeng #serien-erfassung
