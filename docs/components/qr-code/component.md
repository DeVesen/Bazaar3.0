---
status: draft
updated: 2026-08-17
---

# Component: QR-Code

## Index
- Kontext — Einsatzorte
- Aussehen — Darstellung
- Schnittstelle — Inputs
- Verhalten — Erzeugung, Fehlerfall
- Technik — Bibliothek, Offline-Regel
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**Verwendung:** Beide Apps — überall dort, wo ein Wert als QR-Code darzustellen ist.

Gegenstück zum [Barcode-Scanner](../barcode-scanner/component.md): dieser hier
**erzeugt**, jener **liest**.

PrimeNG liefert keine QR-Komponente — daher eigener Wrapper (Grundregel →
[overview.md](../overview.md)).

---

## Kontext

```
┌──────────────┐
│ ▀▀▄ ▄▀ █▀▀▄ │   ← reines SVG, quadratisch
│ █ ▄▀▀▄▀ ▄ █ │
│ ▄▀█▄ ▀▀▄▀▀▄ │
└──────────────┘
   a3f9c2d1        ← optionale Caption (Property `caption`)
```

| Einsatzort | App | Inhalt |
|---|---|---|
| [verkaeufer-nummer.md](../../requirements/advance-registration/components/verkaeufer-nummer.md) | Voranmelde-App | Verkäufer-`id` |
| [Epic_Druckfunktionen](../../requirements/bazaar-app/epics/Epic_Druckfunktionen/epic.md) | Haupt-App | Verkäufer-`id` auf der Annahme-Liste |
| [Epic_Verkaeufer](../../requirements/bazaar-app/epics/Epic_Verkaeufer/epic.md) | Haupt-App | Verkäufer-`id` im Detail-Panel |

Alle heutigen Einsatzorte kodieren die **Verkäufer-`id`** (8 Zeichen,
alphanumerisch) — derselbe Wert, den der [Seller-Search](../seller-search/component.md)
im Scan-Modus erwartet. Die Komponente selbst kennt diese Fachlichkeit nicht; sie
kodiert den Rohstring, den sie bekommt.

---

## Aussehen

| Eigenschaft | Wert |
|---|---|
| Form | Quadratisch, `width = height = size` |
| Ausgabe | Inline-SVG (keine Canvas, kein `<img>`) |
| Vordergrund | `#000` fest — nicht Theme-abhängig |
| Hintergrund | `#fff` fest, mit Quiet-Zone (4 Module Rand) |
| Caption | 11 px, monospace, zentriert unter dem Code, nur wenn gesetzt |

**Farben sind absichtlich nicht themebar.** Ein QR-Code muss scanbar bleiben,
auch im Dark-Mode und im Schwarz-Weiß-Druck; ein invertierter oder
grün-getönter Code fällt bei schlechter Kamera aus.

---

## Schnittstelle

| Property | Typ | Art | Default | Beschreibung |
|---|---|---|---|---|
| `value` | `string` | `@Input` (required) | — | Zu kodierender Rohstring |
| `size` | `number` | `@Input` | `128` | Kantenlänge in px |
| `caption` | `string \| null` | `@Input` | `null` | Klartext unter dem Code |
| `errorCorrection` | `'L' \| 'M' \| 'Q' \| 'H'` | `@Input` | `'M'` | Fehlerkorrektur-Level |

Keine Outputs. Leaf-Komponente: kein Service, kein HTTP, keine Fachlogik
(Dumb-Component-Grundregel → [overview.md](../overview.md)).

---

## Verhalten

1. `value` ändert sich → SVG wird neu erzeugt (`computed` auf dem Input-Signal,
   kein `effect`).
2. `value` ist leer oder nur Whitespace → die Komponente rendert **nichts**
   (kein Platzhalter, kein leeres Quadrat). Der Aufrufer entscheidet, ob dort ein
   Skeleton stehen soll.
3. Kein Ladezustand, kein Netzwerkzugriff — die Erzeugung ist synchron.

---

## Technik

| Aspekt | Entscheidung |
|---|---|
| Bibliothek | `@zxing/library` — `BrowserQRCodeSvgWriter` |
| Erzeugung | Ausschließlich **clientseitig**, kein externer Service, kein API-Call |
| Format | SVG, damit Druck und Zoom verlustfrei bleiben |

`@zxing/library` statt einer zweiten QR-Bibliothek, weil die Haupt-App ZXing für
das **Scannen** ohnehin mitbringt — eine Familie für Lesen und Schreiben statt
zwei Abhängigkeiten für dasselbe Format. Kein Widerspruch zur PrimeNG-Grundregel:
ZXing ist eine Codec-Bibliothek, keine UI-Library.

Die Offline-Anforderung der Haupt-App ([Epic_Druckfunktionen](../../requirements/bazaar-app/epics/Epic_Druckfunktionen/epic.md)
AC-5) verbietet externe QR-Generatoren — auch in der Voranmelde-App wird
deshalb keiner verwendet, damit beide Apps denselben Code teilen.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN `value` gesetzt ist, THEN SHALL das System einen scanbaren QR-Code als Inline-SVG mit der Kantenlänge `size` rendern.
2. **AC-2** — IF `value` leer oder nur Whitespace ist, THEN SHALL das System nichts rendern.
3. **AC-3** — WHEN `caption` gesetzt ist, THEN SHALL das System den Text unterhalb des Codes in monospace anzeigen.
4. **AC-4** — THE SYSTEM SHALL den QR-Code ausschließlich clientseitig erzeugen, ohne Netzwerkzugriff.
5. **AC-5** — WHILE ein dunkles Theme aktiv ist, SHALL das System den Code weiterhin schwarz auf weiß mit Quiet-Zone rendern.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #qr-code #zxing #svg #dumb-components #offline #verkäufernummer
