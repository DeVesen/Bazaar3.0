---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-10-30
---

# Entity: Einstellungen

Haupt-App-Sicht. Verbindliche Quelle für diese App; Index → [overview.md](overview.md).

Feldnamen englisch, Doku-Prosa deutsch (Sprachregel → [`spec.md`](../spec.md) Abschnitt 7.0.1).

## Felder

Eine einzelne Zeile — es gibt genau einen Einstellungssatz pro Installation.

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `scannerPauseMs` | int | ✅ | Anzeigedauer des Scan-Ergebnisses im Inline-Kamera-Modus, Default `3000` |
| `releaseOnClose` | bool | ✅ | `true` = Freigeben-Popup gibt Artikel erst beim Schließen frei, `false` = bei Verkäufern mit Gebühr je Stück 0 sofort; Default `true` |
| `defaultSellerTypeId` | string (8 Zeichen) \| null | ❌ | **Standard-Verkäufer-Typ**: Id eines Verkäufer-Typs, der bei „Neuer Verkäufer" und in der Artikelannahme vorausgewählt wird; `null` = kein Standard, dann der am häufigsten zugewiesene Typ. Default `null`. Wird der Typ gelöscht, wird der Wert auf `null` zurückgesetzt (keine Löschsperre) |

## Warum serverseitig

Der Wert beschreibt eine Einstellung **des Basars**, nicht eine Vorliebe eines Geräts. Läge er
im `localStorage`, würde der Admin ihn an seinem Rechner setzen, während die Kassen-Tablets
ihren Default behalten — „systemweiter Parameter" wäre dann eine Behauptung. Das Frontend
liest ihn beim Start und hält ihn im Speicher.

Der `localStorage` bleibt dem JWT vorbehalten ([Epic_App_Shell](../epics/Epic_App_Shell/epic.md),
BSHELL-S05) — dort gehört Gerätezustand hin.

## Was hier bewusst nicht steht

**`suchDebounceMs`.** Eine Debounce-Zeit für Suchfelder ist eine Frontend-Tuning-Konstante
ohne fachlichen Anlass und steht fest im Code. Die Voranmelde-App hat denselben Parameter aus
demselben Grund aus ihren Einstellungen entfernt.

**Basar-Termine.** Die fünf Termine der Countdown-Sequenz (`registrationDeadline`,
`dropOffFrom`, …) gehören zur Voranmelde-App: Sie steuern dort Countdown und
Registrierungsschluss. Die Haupt-App läuft am Basar-Tag selbst und hat keinen Countdown.

**Löschsperre durch den Standard-Typ.** Die Voranmelde-App sperrt das Löschen des Typs, auf
den ihr `defaultTypeId` zeigt. Diese App kennt seit 2026-10-30 zwar einen Standard-Verkäufer-Typ
(`defaultSellerTypeId`), er sperrt aber nichts: Ist der Standard weg, greift wieder der am
häufigsten zugewiesene Typ — ein fehlender Standard ist kein Fehlerzustand.

**Nummernblock-Parameter.** `startNumber`, `blockSize` und `defaultBlockCount` existieren nur
in der Voranmelde-App. Diese App vergibt keine Nummern, sie prüft sie
([Epic_Artikelannahme](../epics/Epic_Artikelannahme/epic.md) Abschnitt 3).

## Verwendung

- [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) — Pflege
- [Epic_Artikelannahme](../epics/Epic_Artikelannahme/epic.md) — Kamera-Modus liest `scannerPauseMs`
- [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) / [Epic_Artikelannahme](../epics/Epic_Artikelannahme/epic.md) — Vorbelegung des Verkäufer-Typs liest `defaultSellerTypeId`
- [Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md) — Löschen eines Typs setzt `defaultSellerTypeId` ggf. auf `null`
- [Scan-Dialog](../../../components/scan-dialog/component.md) — Freigabe-Scan liest `scannerPauseMs` (`pauseMs`-Default)

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #entity #einstellungen #datenmodell #konfiguration
