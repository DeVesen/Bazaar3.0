---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: import-panel

**Bibliothek:** `p-fileupload mode="basic"` + `p-progressbar` + [`boolean-input`](../../../components/boolean-input/component.md) + [`select`](../../../components/select/component.md) + [`button`](../../../components/button/component.md)
**Verwendung:** Nur Haupt-App, **nur Admin** — Einstellungen ([Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) Abschnitt 2)

## Index
- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Ablauf — Vier Zustände
- 3. Vorschau — Was sie zeigt
- 4. Typ-Zuordnung — Blockierende Entscheidung
- 5. Stammdaten-Auswahl — Zwei Checkboxen
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Übernahme der JSON-Datei aus der Voranmelde-App — Datei wählen, Vorschau prüfen, Zuordnungen treffen, bestätigen.

---

## Überblick

Der Import läuft **am Basar-Morgen**, einmal, und muss funktionieren. Deshalb ist er zweistufig: Die Vorschau schreibt nichts, und erst eine ausdrückliche Bestätigung verändert Daten.

Ein halb durchgelaufener Import wäre der schlechteste denkbare Zustand — halbe Verkäufer, halbe Artikel und kein sauberer Ausgangspunkt für einen zweiten Versuch. Darum läuft die Übernahme in **einer Transaktion**.

---

## 1. ASCII-Darstellung

```
┌────────────────────────────────────────────────────────┐
│  JSON-Import                                            │
├────────────────────────────────────────────────────────┤
│  [ Datei wählen ]  export-2026-08-17.json               │
│                                                          │
│  VORSCHAU                                                │
│  84 Verkäufer · 612 Artikel                              │
│  davon 71 neu · 11 werden ersetzt · 2 übersprungen       │
│                                                          │
│  ⚠ Übersprungen (verkauft oder abgerechnet):            │
│     Anna Meier — 7 verkaufte Artikel                     │
│                                                          │
│  ⚠ Unbekannte Verkäufer-Typen — Zuordnung nötig:        │
│     „Verein" (3 Verkäufer)   →  [ Privat        ▾ ]     │
│                                                          │
│  ☑ Marken übernehmen (23 neu)                           │
│  ☑ Kategorien übernehmen (5 neu)                        │
├────────────────────────────────────────────────────────┤
│                            [ Import bestätigen ]         │
└────────────────────────────────────────────────────────┘
```

---

## 2. Ablauf

| Zustand | Anzeige |
|---|---|
| **1 — leer** | nur der Datei-Picker |
| **2 — Vorschau** | erscheint **sofort** nach der Dateiauswahl, ohne zusätzlichen Klick |
| **3 — läuft** | `p-progressbar`, Bestätigen-Button deaktiviert |
| **4 — fertig** | Toast „✓ Import erfolgreich", Vorschau verschwindet |

Die Vorschau ohne Extra-Klick zu zeigen ist bewusst: Der Admin hat die Datei gerade gewählt, seine nächste Frage ist „passt das?" — ein zwischengeschalteter „Prüfen"-Button wäre eine Rückfrage ohne Informationsgewinn.

Bei ungültigem Schema erscheint statt der Vorschau eine Fehlermeldung; der Bestätigen-Button bleibt gesperrt.

---

## 3. Vorschau

| Angabe | Bedeutung |
|---|---|
| Anzahl Verkäufer / Artikel | was in der Datei steht |
| neu / ersetzt | Abgleich über die 1:1 übernommene Verkäufer-ID |
| **übersprungen** | Verkäufer mit verkauften (`soldAt`) oder abgerechneten (`settledAt`) Artikeln — sie werden **nicht** ersetzt, mit Name und Grund genannt |

Die übersprungenen Verkäufer sind der wichtigste Teil: Ein zweiter Import am Basar-Tag würde sonst Kassenumsätze löschen. Sie namentlich zu nennen macht nachvollziehbar, warum die Zahlen der Vorschau nicht zur Datei passen.

---

## 4. Typ-Zuordnung

Enthält die Datei Verkäufer-Typen, die es hier nicht gibt, listet die Vorschau jeden Namen mit der Anzahl betroffener Verkäufer und **einem Select** auf die vorhandenen Typen.

**Der Bestätigen-Button bleibt deaktiviert**, solange eine Zuordnung fehlt.

Kein automatisches Anlegen: Ein Typ trägt Provision und Gebühr, die der Import nicht erfinden kann — ein Typ mit 0 % Provision wäre ein stiller Geldverlust. Kein stilles Ersetzen durch einen Standard aus demselben Grund.

Marken und Kategorien werden dagegen **angelegt**, weil sie keine Zahlen tragen. Der Unterschied ist beabsichtigt und steht in [`api/import.md`](../api/import.md).

---

## 5. Stammdaten-Auswahl

Zwei Checkboxen, beide **standardmäßig aktiv**, jeweils mit der Anzahl neuer Einträge:

```
☑ Marken übernehmen (23 neu)
☑ Kategorien übernehmen (5 neu)
```

Vorausgewählt, weil Stammdaten mitzunehmen der Normalfall ist — ohne sie tragen importierte Artikel Marken, die in der Marken-Verwaltung fehlen. Abwählbar, weil beim zweiten Import am selben Tag meist nur die Verkäufer aktualisiert werden sollen.

Importierte Marken und Kategorien erhalten `original = true` — sie sind kuratierte Stammdaten aus der Voranmeldephase, keine Neuanlage am Annahmetisch.

## Akzeptanzkriterien

1. **AC-1** — WHEN eine Datei gewählt wird, THEN SHALL das System die Vorschau ohne weiteren Klick anzeigen und dabei keine Daten verändern.
2. **AC-2** — THE SYSTEM SHALL in der Vorschau Anzahl Verkäufer und Artikel sowie die Aufteilung in neu, ersetzt und übersprungen anzeigen.
3. **AC-3** — THE SYSTEM SHALL übersprungene Verkäufer namentlich mit Grund nennen.
4. **AC-4** — IF unbekannte Verkäufer-Typen enthalten sind, THEN SHALL das System je Name eine Auswahl auf einen existierenden Typ anzeigen und „Import bestätigen" bis zur vollständigen Zuordnung deaktiviert halten.
5. **AC-5** — THE SYSTEM SHALL zwei standardmäßig aktive Auswahlfelder für Marken und Kategorien mit der Anzahl neuer Einträge anzeigen.
6. **AC-6** — WHEN „Import bestätigen" geklickt wird, THEN SHALL das System eine Fortschrittsanzeige einblenden und nach Abschluss einen Toast „✓ Import erfolgreich" zeigen.
7. **AC-7** — IF der Import fehlschlägt, THEN SHALL kein Verkäufer, kein Artikel und kein Stammdatum übernommen sein.
8. **AC-8** — IF die Datei nicht dem erwarteten Schema entspricht, THEN SHALL das System eine Fehlermeldung anzeigen und den Bestätigen-Button gesperrt halten.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #import #json #vorschau #admin #haupt-app
