---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: settings-form

**Bibliothek:** [`card`](../../../components/card/component.md) + [`inputnumber`](../../../components/inputnumber/component.md) + [`button`](../../../components/button/component.md) + [`toast`](../../../components/toast/component.md)
**Verwendung:** Nur Haupt-App, **nur Admin** — [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) Abschnitt 1

## Index
- Überblick — Ein Parameter
- 1. ASCII-Darstellung — Layoutskizze
- 2. Verhalten — Speichern und Wirkung
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Formular für die Systemparameter — derzeit genau einer.

---

## Überblick

Das Formular hat **ein** Feld. Das ist kein Versehen, sondern das Ergebnis des Reviews: `suchDebounceMs` wurde entfernt (Frontend-Tuning-Konstante ohne fachlichen Anlass, jetzt im Code), und die Termine, `defaultTypeId` und die Nummernblock-Parameter gehören zur Voranmelde-App.

Übrig bleibt `scannerPauseMs` — und der ist es wert, weil er am Basar-Tag je nach Personal und Scanner-Qualität wirklich verstellt wird.

---

## 1. ASCII-Darstellung

```
┌──────────────────────────────────────────────────┐
│  Systemparameter                                  │
├──────────────────────────────────────────────────┤
│  ANZEIGEDAUER SCAN-ERGEBNIS                       │
│  [ 3.000            ] ms                          │
│  Wie lange das Ergebnis im Kamera-Modus           │
│  stehen bleibt. Zwischen 500 und 15.000 ms.       │
│                                                    │
│                              [ Speichern ]         │
└──────────────────────────────────────────────────┘
```

Feld als [`inputnumber`](../../../components/inputnumber/component.md), Variante **Anzahl** (keine Dezimalstellen, keine Tausendertrennung im Eingabewert), mit `ms` als Add-on über [`input-group`](../../../components/input-group/component.md).

Der Hilfstext unter dem Feld erklärt die **Wirkung**, nicht das Feld: „Anzeigedauer" allein sagt nicht, was länger oder kürzer bedeutet.

---

## 2. Verhalten

| Fall | Verhalten |
|---|---|
| Wert außerhalb 500–15.000 | Feldfehler, serverseitig geprüft (`400`) |
| Speichern erfolgreich | Toast „✓ Einstellungen gespeichert" |
| Wirkung | gilt **auf allen Geräten**, ab dem nächsten App-Start der jeweiligen Geräte |

**Serverseitig gespeichert, nicht im `localStorage`.** Der Wert beschreibt eine Einstellung des Basars, nicht eine Vorliebe eines Geräts — gerätelokal abgelegt würde der Admin ihn an seinem Rechner setzen, während die Kassen-Tablets ihren Default behalten.

Die Grenzen haben einen praktischen Grund: Unter einer halben Sekunde ist das Scan-Ergebnis nicht lesbar; fünf Sekunden Zwangspause je Scan summieren sich bei 300 Artikeln schon auf 25 Minuten Warten. Der Default von 3.000 ms ist bewusst niedrig.

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL genau den Parameter `scannerPauseMs` anbieten.
2. **AC-2** — THE SYSTEM SHALL unter dem Feld erklären, was der Wert bewirkt, und die zulässigen Grenzen nennen.
3. **AC-3** — IF der Wert außerhalb von 500–15.000 liegt, THEN SHALL das System serverseitig mit einem Feldfehler ablehnen.
4. **AC-4** — WHEN gespeichert wird, THEN SHALL der Wert serverseitig persistiert werden und für alle Geräte gelten.
5. **AC-5** — THE SYSTEM SHALL die Parameter **nicht** im `localStorage` ablegen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #einstellungen #formular #admin #haupt-app
