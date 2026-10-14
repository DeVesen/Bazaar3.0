---
status: draft
updated: 2026-10-13
---

# Component: Result-Overlay (Ergebnis-Einblendung)

## Index
- Kontext — Einsatzorte
- Aussehen — Ergebnisse, Ablauf
- Schnittstelle — Inputs
- Verhalten — Ton, Vibration, Abbruch, Barrierefreiheit
- Technik — Wrapper-Begründung
- Akzeptanzkriterien — EARS-Kriterien

**Verwendung:** Haupt-App — Verkauf-Seite sowie die Dialoge „Artikel freigeben" und „Artikel zurückgeben" (`scan-dialog`). Zusätzlich `paid` („Bezahlt") nach erfolgreicher Buchung aus dem Bezahlen-Dialog (`payment-panel`): Verkauf (Bezahlen), Artikelannahme (Speichern) und Freigeben (bei Gebühr > 0).

Eigenständiger, wiederverwendbarer Baustein ohne eigene Fachlogik: Verkauf-Seite und Dialoge bestimmen, welches
Ergebnis gemeldet wird. Nicht zu verwechseln mit dem Scan-Feedback (`app-scan-feedback`, Ring-Countdown der
Wareneingangs-Erfassung).

PrimeNG liefert keine solche Komponente — daher eigener Wrapper (Grundregel → [overview.md](../overview.md)).

---

## Aussehen

Nur das Icon, mittig (horizontal und vertikal) im Browserfenster, ohne getönten Schleier; der Inhalt dahinter
bleibt sichtbar. Größe: 21 rem (200 % größer als die frühere 7 rem), höchstens 80 vh und 80 vw. Die Einblendung
liegt über allem (Top-Layer des Browsers per `popover`, über Dialogen und jedem z-index).

| Ergebnis (`kind`) | Icon | Farbe | Ton | Vibration |
|---|---|---|---|---|
| `failed` | `pi-times` | Rot | Zonk 180 → 120 Hz | 80/60/80 ms |
| `success` | `pi-check` | Grün | Ping 880 → 1320 Hz | 1 × 100 ms |
| `already` | `pi-check` | Gelb | 2 Töne à 80 ms, 1000 Hz, 60 ms Pause | 2 × 60 ms (60 ms Pause) |
| `cart` | `pi-shopping-cart` | Grün | Ping 880 → 1320 Hz | 1 × 100 ms |
| `paid` | `pi-dollar` | Grün | Ping 880 → 1320 Hz | 1 × 100 ms |

Ablauf fest 1,5 s: 0–500 ms einblenden, 500–1000 ms voll sichtbar, 1000–1500 ms ausblenden.

## Schnittstelle

| Name | Typ | Art | Beschreibung |
|---|---|---|---|
| `event` | `ResultEvent \| null` | `input()` | Jede Einblendung ist ein frisches Objekt aus `createResultEvent(kind)`; `null` blendet nichts ein |

Der Konsument platziert `<app-result-overlay [event]="…" />` beliebig in seinem Template; die Lage ist unabhängig vom Elternelement.

## Verhalten

- Ton und Vibration laufen mit jeder Einblendung und sind nicht abschaltbar; fehlende Web-Audio- oder Vibrations-Unterstützung wird still übergangen.
- Eine neue Einblendung bricht die laufende samt Ton und Vibration sofort ab und startet von vorn.
- Die Einblendung blockiert keine Eingabe (`pointer-events: none`), nimmt keinen Fokus.
- Screenreader: Textmeldung (`role="status"`) „Fehlgeschlagen", „Erfolgreich", „Bereits erledigt", „Im Warenkorb" bzw. „Bezahlt".
- „Bewegung reduzieren" ändert nichts.
- Ein Event, das beim Mounten nicht `null` ist, wird sofort abgespielt. Bleibt der Konsument über einen Sichtbarkeitswechsel hinweg gemountet (z. B. Dialog), setzt er das Event dabei auf `null` zurück.

## Akzeptanzkriterien

Siehe `docs/forge/2026-10-13-ergebnis-einblendung/spec.md` (AC-16 bis AC-19, AC-24 bis AC-29).
