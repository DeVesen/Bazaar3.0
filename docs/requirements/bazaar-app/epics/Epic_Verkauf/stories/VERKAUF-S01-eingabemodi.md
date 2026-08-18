---
id: VERKAUF-S01
status: draft
depends-on: []
---

# Story: Drei Eingabemodi im Kassenvorgang

## Ziel

Als Kassenpersonal kann ich die Artikelnummer wahlweise per Tastatur, Kamera oder
Nummernblock erfassen, damit ich an jedem Arbeitsplatz zügig kassieren kann — mit
USB-Scanner am Desktop ebenso wie am Tablet ohne angestecktes Gerät.

## Kontext

Das Artikelnummer-Feld ist eine
[InputGroup](../../../../../components/input-group/component.md) mit
`modes = ['keyboard', 'camera', 'numpad']`. Die Umschaltmechanik — feste Reihenfolge,
Sichtbarkeit der beiden Modus-Buttons, Startmodus, Kamera-Freigabe — steht dort in
Abschnitt 3 und wird hier **nicht** wiederholt. Diese Story beschreibt ausschließlich, was
im Kassenvorgang davon abweicht oder daran hängt.

Der Dauerscan mit Countdown, wie ihn Artikel-Freigabe und Rückgabe verwenden, ist in
[ANNAHME-S01](../../Epic_Artikelannahme/stories/ANNAHME-S01-inline-camera-mode.md)
beschrieben. Der Unterschied ist fachlich: Dort werden Zeitstempel gesetzt, hier wird
Geld kassiert.

## Scope

**In Scope:** Verfügbare Modi des Artikelnummer-Feldes, Rückkehr in den vorherigen Modus
nach einem Treffer, Zusammenspiel mit dem Preis-Button, Numpad-Konfiguration,
Kamera-Freigabe beim Verlassen der Route, Fehlerfall ohne Kamerazugriff.

**Out of Scope:** Die Modus-Mechanik selbst (InputGroup Abschnitt 3), die Artikel-Erkennung
und die InfoArea-Zustände (Epic Abschnitt 2), Warenkorb und Bezahlpopup (Epic
Abschnitte 3–4), der Dauerscan (ANNAHME-S01).

## UI-Spezifikation

### Tastatur-Modus (Startmodus)

```
┌────────────────────────────────────────────┐
│  Artikelnummer eingeben                    │
├──────────────────────────────┬──┬──┬──┬────┤
│  [Nummer eingeben ...      ] │↩ │📷│⊞ │    │ ← AC-1, AC-2
└──────────────────────────────┴──┴──┴──┴────┘
  ↩ ist deaktiviert, solange das Feld leer ist
```

### Kamera-Modus

```
┌────────────────────────────────────────────┐
│ ╔════════════════════════════════════════╗ │
│ ║   [Live-Kamerabild + Scan-Rahmen]      ║ │ ← AC-3
│ ╚════════════════════════════════════════╝ │
│  [⌨ Tastatur]  [⊞ Numpad]                  │ ← AC-2
└────────────────────────────────────────────┘
  Kein Modal, kein Backdrop — Warenkorb und InfoArea bleiben sichtbar
```

### Numpad-Modus

```
┌────────────────────────────────────────────┐
│  ┌──────────────────────────┬──┬──┬──┐     │
│  │  1043        [readonly]  │↩ │⌨ │📷│     │ ← AC-2
│  └──────────────────────────┴──┴──┴──┘     │
│  ┌──────┬──────┬──────┬──────┐             │
│  │  7   │  8   │  9   │      │             │
│  ├──────┼──────┼──────┤  ⌫   │             │
│  │  4   │  5   │  6   │      │             │
│  ├──────┼──────┼──────┼──────┤             │
│  │  1   │  2   │  3   │      │             │
│  ├──────┼──────┼──────┤  ⏎   │             │
│  │  C   │      │  0   │      │             │ ← kein Komma (AC-5)
│  └──────┴──────┴──────┴──────┘             │
└────────────────────────────────────────────┘
```

### Nach einem Kamera-Treffer

```
┌──────────────────────────────┬──┬──┬──┐
│  12345678                 ✕  │↩ │⌨ │⊞ │  ← zurück im Tastatur-Modus (AC-4)
└──────────────────────────────┴──┴──┴──┘
  Artikel-Lookup läuft; Preis-Button erscheint (Epic Abschnitt 2)
```

## Akzeptanzkriterien

- [ ] **AC-1** — WHEN die Verkauf-Seite geöffnet wird, THEN SHALL das System das Artikelnummer-Feld im Tastatur-Modus anzeigen und den Fokus daraufsetzen, sodass ein USB-Barcode-Scanner ohne Umschalten funktioniert.
- [ ] **AC-2** — THE SYSTEM SHALL am Artikelnummer-Feld die Modi `keyboard`, `camera` und `numpad` anbieten und stets die beiden nicht aktiven als Modus-Buttons anzeigen.
- [ ] **AC-3** — WHEN in den Kamera-Modus gewechselt wird, THEN SHALL das System das Live-Kamerabild an der Position des Eingabefeldes einblenden — ohne Modal und ohne Backdrop —, sodass Warenkorb und InfoArea sichtbar bleiben.
- [ ] **AC-4** — WHEN im Kamera-Modus ein Barcode oder QR-Code erkannt wird, THEN SHALL das System den Wert in das Eingabefeld übernehmen, in den zuvor aktiven Modus zurückkehren, die Kamera freigeben und den Artikel-Lookup auslösen.
- [ ] **AC-5** — WHILE der Numpad-Modus aktiv ist, SHALL das System den Numpad mit `showDecimal="false"` und `showEnter="true"` betreiben und das Eingabefeld auf `readonly` setzen.
- [ ] **AC-6** — WHEN `⏎` auf dem Numpad geklickt wird, THEN SHALL das System denselben Artikel-Lookup auslösen wie der ↩-Button.
- [ ] **AC-7** — WHEN nach dem ersten Treffer weitere Codes emittiert werden, THEN SHALL das System sie verwerfen — je Kamera-Phase wird genau ein Wert übernommen.
- [ ] **AC-8** — IF die Kamera nicht verfügbar oder der Zugriff verweigert wird, THEN SHALL das System in den Tastatur-Modus zurückkehren und eine rote InfoArea mit dem Text „Kamerazugriff nicht möglich" anzeigen.
- [ ] **AC-9** — WHEN die Verkauf-Route verlassen wird, während der Kamera-Modus aktiv ist, THEN SHALL das System `active = false` setzen, sodass alle MediaStream-Tracks freigegeben werden.
- [ ] **AC-10** — THE SYSTEM SHALL einen erkannten Artikel nicht unmittelbar in den Warenkorb legen; er wird wie bei Tastatureingabe erst über den Preis-Button hinzugefügt (Epic Abschnitt 2).

## Abhängigkeiten

| Abhängigkeit | Grund |
|---|---|
| [InputGroup](../../../../../components/input-group/component.md) | Modus-Mechanik, Sichtbarkeitsregel, Startmodus, Kamera-Lebensdauer |
| [Numpad](../../../../../components/numpad/component.md) | Tastenlayout, `showDecimal` / `showEnter`, `submitted` |
| [Barcode-Scanner](../../../../../components/barcode-scanner/component.md) | Videobild und `codeDetected` |
| Epic Abschnitt 2 | Artikel-Erkennung und Preis-Button, die diese Story nur auslöst |

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #eingabemodi #kamera #numpad #scanner #barcode #kassenvorgang #inputgroup
