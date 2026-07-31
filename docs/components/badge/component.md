---
id: C-011
status: draft
updated: 2026-07-31
---

# Component: Badge

**Bibliothek:** Eigener Wrapper — kein direktes PrimeNG-Äquivalent
**Verwendung:** Beide Apps — Status-Badges überall; Rang-Badges ausschließlich Haupt-App

## Index

- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Input / Output Schnittstelle — Parameter
- 3. Visuelles Design — Farben & Stil
  - 3.1 Status-Badges — Beide Apps
  - 3.2 Rang-Badges — **Nur Haupt-App**
- 4. Verwendung in Features — Einsatzorte
- 5. PrimeNG-Basis — Technische Basis
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Thematische Einordnung

**Beschreibung:** Kleine Inline-Pille zur Kennzeichnung von Status, Flags und Rang-Positionen.

**Verwendungszweck:** Wird in Tabellen, Listenansichten und dem Leaderboard eingesetzt, um Artikel-Status, Händler-Typen, Flags (Original, Neu) und Rang-Positionen visuell hervorzuheben.

---

## Überblick

Der Badge ist die Standard-Darstellung für Status-Kennzeichnungen. Es gibt zwei Varianten:

- **Status-Badge** — Beide Apps: Pille für semantische Zustände und Flags
- **Rang-Badge** — **Nur Haupt-App**: Kreisförmiges Badge für Leaderboard-Positionen

> **Voranmelde-App (Section 13.6):** Die Voranmelde-App deklariert ihre Badge-Komponente als
> **identisch mit der Haupt-App** — dieselben Status-Typen (success / danger / warn / info /
> sec / original / neu), dieselbe Optik. Rang-Badges existieren in der Voranmelde-App nicht.

**Dumb Component:** Alle Daten kommen per `@Input()`. Kein Klick-Event, keine Interaktion — reine Anzeige.

---

## 1. ASCII-Darstellung

```
Status-Badge (Pille):
┌──────────────┐
│  Verkauft    │  ← Text 11 px, font-weight 600
└──────────────┘
  border-radius: 4 px | padding: 2 px 8 px

Rang-Badge (Kreis) — Nur Haupt-App:
  ┌───┐
  │ 1 │  ← Text 12 px, font-weight 700
  └───┘
  26 × 26 px, border-radius: 50 %

Beispiele nebeneinander:
  [Verkauft]  [Im Verkauf]  [Offen]  [Fehler]  [✓ Original]  [Neu]

Rang-Badges im Leaderboard — Nur Haupt-App:
  ① ② ③ [4] [5] …
  (Gold) (Silber) (Bronze) (Grau ≥4)
```

---

## 2. Input / Output Schnittstelle

| Parameter | Typ | Richtung | Beschreibung |
|---|---|---|---|
| `type` | `'success' \| 'danger' \| 'warn' \| 'info' \| 'sec' \| 'original' \| 'neu' \| 'rank'` | `@Input` | Semantischer Typ des Badges |
| `label` | `string` | `@Input` | Anzuzeigender Text |
| `rank` | `number` | `@Input` | Rang-Position (nur relevant wenn `type === 'rank'`; bestimmt die Farbe) |

---

## 3. Visuelles Design

### 3.1 Status-Badges — Beide Apps

**Basis-Stil:** `border-radius: 4 px`, `padding: 2 px 8 px`, `font-size: 11 px`, `font-weight: 600`

| Typ | Hintergrund | Textfarbe | Einsatz |
|---|---|---|---|
| `success` | `#d5f5e3` | `#1a5c38` | Abgerechnet, Verkauft |
| `danger` | `#fadbd8` | `#7b241c` | Fehler-Status |
| `warn` | `#fef9e7` | `#7e5109` | Händler-Typ |
| `info` | `#d6eaf8` | `#1a5276` | Im Verkauf |
| `sec` | `#eaecee` | `#566573` | Offen, neutral |
| `original` | `#d5f5e3` | `#1a5c38` | „✓ Original"-Flag |
| `neu` | `#fdebd0` | `#784212` | „Neu"-Flag |

### 3.2 Rang-Badges — Nur Haupt-App

> Diese Variante existiert **ausschließlich in der Haupt-App** (Leaderboard / Statistik).
> Die Voranmelde-App hat keine Rang-Badges.

**Basis-Stil:** `width: 26 px`, `height: 26 px`, `border-radius: 50 %`, `font-size: 12 px`, `font-weight: 700`

| Rang | Hintergrund | Textfarbe | Bezeichnung |
|---|---|---|---|
| 1 | `#ffd700` | `#5d4e00` | Gold |
| 2 | `#c0c0c0` | `#3d3d3d` | Silber |
| 3 | `#cd7f32` | `#4a2800` | Bronze |
| ≥ 4 | `#eaecee` | `#566573` | Grau (neutral) |

---

## 4. Verwendung in Features

| Feature | App | Badge-Typ | Kontext |
|---|---|---|---|
| Artikel-Liste | Bazaar | `success`, `info`, `sec` | Artikel-Status (Verkauft / Im Verkauf / Offen) |
| Artikelannahme | Bazaar | `original`, `neu` | Artikel-Flags |
| Verkäufer-Liste | Bazaar | `warn` | Händler-Typ |
| Abrechnung | Bazaar | `success`, `danger` | Abrechnungs-Status |
| Leaderboard / Statistik | **Nur Bazaar** | `rank` | Rang-Position (Gold / Silber / Bronze / Grau) |
| Artikel-Liste | Voranmelde | `success`, `info`, `sec` | Artikel-Status |
| Verkäufer-Liste | Voranmelde | `warn` | Händler-Typ |

---

## 5. PrimeNG-Basis

```
p-tag    ← Basis für Status-Badges (Pille mit Hintergrundfarbe)
```

Für Rang-Badges (Kreis, 26 × 26 px) wird ein eigener Wrapper auf `p-tag`-Basis mit
überschriebenen CSS-Klassen erstellt, da PrimeNG kein rundes Badge in dieser Form bietet.

---

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL Status-Badges mit `border-radius: 4 px`, `padding: 2 px 8 px`, `font-size: 11 px` und `font-weight: 600` rendern.
2. **AC-2** — FOR EACH `type` in `{success, danger, warn, info, sec, original, neu}` SHALL das System die definierte Hintergrund- und Textfarbe anwenden.
3. **AC-3** — WHERE `type === 'rank'` gesetzt ist, SHALL das System ein kreisrundes Badge mit `26 × 26 px` und `border-radius: 50 %` rendern — **ausschließlich in der Haupt-App**.
4. **AC-4** — WHEN `rank === 1`, THEN SHALL das System Gold-Farben (`#ffd700` / `#5d4e00`) anwenden; bei `rank === 2` Silber, bei `rank === 3` Bronze, bei `rank ≥ 4` Grau (`#eaecee` / `#566573`).
5. **AC-5** — THE SYSTEM SHALL in der Voranmelde-App keine Rang-Badge-Variante (`type === 'rank'`) rendern oder anbieten.

---

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #badge #status #rang #leaderboard #pille #tag
