---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: password-strength-meter

Neue, eigene Komponente — kombiniert PrimeNG-Bausteine, kein fertiges PrimeNG-Widget dafür vorhanden. `pInputPassword` selbst liefert kein automatisches Stärke-Feedback (verifiziert gegen offizielle PrimeNG-Doku „Strength Meter"-Beispiel — dort wird der Score ebenfalls manuell berechnet und mit `p-progressbar`+`p-tag` angezeigt).

## Kontext (Registrierungsformular)

```
Passwort
[🔒______________________👁]   ← siehe [input.md](../../../../components/input/component.md), Variante Password
▓▓▓░░                          ← p-progressbar
                        Mittel │ ← p-tag
```

## Input / Output Schnittstelle

| Parameter | Typ | Richtung | Beschreibung |
|---|---|---|---|
| `password` | `string` | `@Input` | Aktueller Passwort-Wert (aus dem gebundenen `pInputPassword`-Feld) |
| `level` | `'schwach' \| 'mittel' \| 'stark'` | `@Output` | Emittiert die aktuelle Stufe — Parent nutzt das für die Absenden-Button-Sperre (Epic_Login AC-6) |

## Berechnung (3-Stufen-Schema aus Epic_Login Abschnitt 6)

| Stufe | Regel | `p-progressbar`-Farbe | `p-tag`-Severity |
|---|---|---|---|
| Schwach | < 8 Zeichen oder nur 1 Zeichentyp | `var(--p-red-500)` | `danger` |
| Mittel | ≥ 8 Zeichen + mind. 2 Zeichentypen | `var(--p-amber-500)` | `warn` |
| Stark | ≥ 10 Zeichen + alle 4 Zeichentypen, davon ≥ 2 Sonderzeichen | `var(--p-green-500)` | `success` |

## Aufbau

```
p-progressbar [value]="percent" [showValue]="false" [style]="{height: '6px'}" [color]="levelColor"
p-tag [severity]="levelSeverity" [value]="levelLabel"
```

`percent` linear aus der Stufe abgeleitet (z. B. schwach=33, mittel=66, stark=100) — reine Anzeige, kein exakter kryptografischer Entropie-Score nötig für unseren einfachen 3-Stufen-Anwendungsfall.

## Akzeptanzkriterien

Siehe Epic_Login AC-6 — diese Datei ist die Struktur-Referenz für die Stärke-Anzeige selbst, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #password #strength-meter #registrierung #progressbar #tag #primeng
