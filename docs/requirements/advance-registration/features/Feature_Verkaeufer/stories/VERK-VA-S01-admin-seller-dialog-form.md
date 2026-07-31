---
id: VERK-VA-S01
status: draft
depends-on: []
---

# Story: Admin-Dialog-Formular (Verkäufer anlegen / bearbeiten)

## Ziel
Ein Admin kann einen Verkäufer über einen Dialog anlegen oder bearbeiten, inklusive der Felder für Personendaten, Konditionen und der Anzahl initialer Nummernblöcke.

## Kontext
Der Admin benötigt einen vollständigen Eingabedialog zum Anlegen und Bearbeiten von Verkäufern. Im Unterschied zum Seller-Steckbrief (Profil) sind hier alle Felder — einschließlich Type, Gebühr und Provision — editierbar. Beim Anlegen muss zusätzlich die Anzahl der initial zuzuweisenden Nummernblöcke angegeben werden.

## UI-Spezifikation

Dialog-Größe: `lg` (max 940 px). Bei `≥ 768 px`: 80 % Breite / 90 % Höhe; bei `< 768 px`: 100 % / 100 %, kein border-radius.

Das Formular besteht aus drei Panels (bg `#f5f9f6`, border 1 px `#d4e8dc`, radius 8 px, padding 15 px 16 px; Titel 11 px · 700 · uppercase · `#3a7057`) plus einem separaten Nummernblock-Feld unterhalb.

```
┌────────────────────────────────────┐
│ PERSONENDATEN                      │
├────────────────────────────────────┤
│ [Vorname *   50%] [Nachname * 50%] │
│ [Anschrift              100%     ] │
│ [PLZ         50%] [Ort       50%] │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ KONTAKT                            │
├────────────────────────────────────┤
│ [Telefon     50%] [E-Mail *  50%]  │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ KONDITIONEN                        │
├────────────────────────────────────┤
│ [Verkäufer-Type       100%       ] │
│ [Gebühr je Stk.  50%][Provision  ] │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ NUMMERNBLÖCKE (nur beim Anlegen)   │
├────────────────────────────────────┤
│ [Anzahl init. Blöcke   50%       ] │
└────────────────────────────────────┘

  [ Abbrechen ]  [ Speichern ]
```

**Feldverhalten:**

| Feld | Anlegen | Bearbeiten |
|---|---|---|
| Vorname, Nachname | editierbar, Pflicht | editierbar, Pflicht |
| Anschrift, PLZ, Ort | editierbar | editierbar |
| Telefon | editierbar | editierbar |
| E-Mail | editierbar, Pflicht | editierbar, Pflicht |
| Verkäufer-Type | `p-select`, editierbar | `p-select`, editierbar |
| Gebühr je Stück | `p-inputnumber` DE, vorausgefüllt aus Type | editierbar |
| Provision | `p-inputnumber` DE, vorausgefüllt aus Type | editierbar |
| Anzahl initialer Blöcke | `p-inputnumber`, Vorgabe: `defaultBlockCount` | **nicht vorhanden** |

**Verkäufer-Type-Auswahl:** Wählt Admin einen Type, werden Gebühr und Provision automatisch aus dem Type vorausgefüllt — sind danach individuell überschreibbar (AC-4).

**Anzahl initialer Blöcke:** Nur im Anlegen-Dialog sichtbar. Zahlenfeld (`p-inputnumber`, min 1), Standardwert = `defaultBlockCount` aus den Einstellungen (AC-5).

**PrimeNG-Komponenten:**
- Text-Felder: `pInputText` mit `pAutoFocus` auf Vorname
- Zahlen: `p-inputnumber` locale DE, `minFractionDigits="2"` (Gebühr, Provision); `minFractionDigits="0"` (Blöcke)
- Dropdown Type: `p-select`
- Buttons Footer: `p-button severity="secondary" [outlined]="true"` (Abbrechen), `p-button severity="primary"` (Speichern)

## Akzeptanzkriterien

- [ ] **AC-1** — WHEN der Admin „+ Neu" klickt, THEN SHALL das System den Dialog mit leeren Feldern und dem Standardwert für „Anzahl initialer Blöcke" öffnen.
- [ ] **AC-2** — WHEN der Admin einen bestehenden Verkäufer zum Bearbeiten öffnet, THEN SHALL das System den Dialog mit den vorhandenen Daten vorladen und das Feld „Anzahl initialer Blöcke" nicht anzeigen.
- [ ] **AC-3** — IF ein Pflichtfeld (Vorname, Nachname, E-Mail) beim Speichern leer ist, THEN SHALL das System eine Fehlermeldung unterhalb des Feldes anzeigen und nicht speichern.
- [ ] **AC-4** — WHEN der Admin einen Verkäufer-Type auswählt, THEN SHALL das System die Felder „Gebühr je Stück" und „Provision" mit den Werten des Types vorausfüllen, sodass sie danach manuell überschrieben werden können.
- [ ] **AC-5** — WHILE der Dialog „Neuen Verkäufer anlegen" geöffnet ist, SHALL das System das Feld „Anzahl initialer Blöcke" mit dem konfigurierten `defaultBlockCount` als Vorgabewert anzeigen.
- [ ] **AC-6** — WHEN der Admin „Speichern" bestätigt, THEN SHALL das System den Verkäufer mit den zugehörigen Nummernblöcken anlegen und die Tabelle aktualisieren.
- [ ] **AC-7** — WHEN ein Verkäufer erfolgreich angelegt wurde, THEN SHALL das System einen Toast „✓ Verkäufer gespeichert" anzeigen und optional den Einladungs-Link zum Kopieren anbieten.
- [ ] **AC-8** — IF das Speichern fehlschlägt, THEN SHALL das System die eingegebenen Werte erhalten und „Verkäufer konnte nicht gespeichert werden" in einer Error-InfoArea anzeigen.

## Tags & Piles
**Tags:** #verkäufer #admin #formular #dialog #nummernblock #konditionen
