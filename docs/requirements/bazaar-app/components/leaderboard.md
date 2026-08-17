---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: leaderboard

**Bibliothek:** [`table`](../../../components/table/component.md) + [`badge`](../../../components/badge/component.md) + [`select`](../../../components/select/component.md)
**Verwendung:** Nur Haupt-App — Statistik-Seite ([Epic_Statistik](../epics/Epic_Statistik/epic.md) Abschnitt 5)

## Index
- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Spalten — Inhalt und Sortierung
- 3. Rang-Badge — Farben
- 4. Typ-Filter — Wirkung
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Rangliste der Verkäufer nach Verkaufszahlen, mit Rang-Badge und Typ-Filter.

---

## Überblick

Eine Ausprägung der [`table`](../../../components/table/component.md) mit zwei Besonderheiten: einer Rang-Spalte mit Medaillen-Farben und einem Filter, der eine Spalte **ausblendet** statt sie zu filtern.

Eigene Datei, weil beides Verhalten ist, das die generische Tabelle nicht kennt.

---

## 1. ASCII-Darstellung

```
┌──────────────────────────────────────────────────────────────┐
│  Verkäufer-Rangliste              [Alle Verkäufer-Typen ▾]    │
├──────────────────────────────────────────────────────────────┤
│ Rang │ Verkäufer     │ Typ     │ Angen. │ Verk. │ Umsatz │ Ausz.│
│  🥇  │ Anna Meier    │ Privat  │   42   │  31   │380,50 €│332,94 ✓│
│  🥈  │ Bernd Klein   │ Händler │   38   │  27   │310,00 €│248,00 €│
│  🥉  │ Carla Roth    │ Privat  │   30   │  22   │265,50 €│232,31 €│
│  4   │ …             │         │        │       │        │      │
└──────────────────────────────────────────────────────────────┘
```

Standard-Card. Kopfzeile: Titel links (700 / 14 px), Dropdown rechts — `display: flex; justify-content: space-between; align-items: center; margin-bottom: 12 px`.

**Maximale Höhe 300 px**, darüber vertikales Scrollen (`max-height: 300px; overflow-y: auto`). Die Rangliste ist eine Übersicht, keine Arbeitsliste — wer einen bestimmten Verkäufer sucht, geht auf die Verkäufer-Seite.

---

## 2. Spalten

| Spalte | Inhalt | Breite |
|---|---|---|
| Rang | Rang-Badge | 50 px |
| Verkäufer | Name | — |
| Typ | Nur bei „Alle Verkäufer-Typen" sichtbar | — |
| Angenommen | Anzahl angenommener Artikel | — |
| Verkauft | Anzahl verkaufter Artikel | — |
| Umsatz | Verkaufserlös | — |
| Auszahlung | **erwarteter** Betrag, plus ✓ wenn abgerechnet | — |

**Default-Sortierung:** Verkauft absteigend. Alle Spalten sortierbar, Multi-Sort per Shift+Klick.

**Die Auszahlungsspalte zeigt immer den erwarteten Betrag**, auch bei abgerechneten Verkäufern; der Zahlungsstand steht als Häkchen daneben. Eine Spalte, die je Zeile etwas anderes bedeutet, wäre in einer sortierbaren Tabelle unbrauchbar. Die Unterscheidung erwartet gegen geleistet interessiert nur in der Summe, und die steht in der Finanz-KPI-Zeile.

Der Rang folgt der **aktuellen Sortierung** — wird nach Umsatz sortiert, zeigt Rang 1 den umsatzstärksten Verkäufer. Ein fester Rang, der sich beim Sortieren nicht ändert, würde neben der Reihenfolge stehen und verwirren.

---

## 3. Rang-Badge

| Rang | Farbe |
|---|---|
| 1 | Gold |
| 2 | Silber |
| 3 | Bronze |
| ab 4 | Grau, reine Zahl |

---

## 4. Typ-Filter

Das Dropdown schaltet zwischen „Alle Verkäufer-Typen" und einem einzelnen Typ.

**Bei gefilterter Ansicht verschwindet die Spalte „Typ"** — sie würde in jeder Zeile denselben Wert zeigen. Der Filter läuft **serverseitig** als Parameter der Statistik-Abfrage; er wirkt ausschließlich auf das Leaderboard, die KPI-Zeilen bleiben unverändert.

## Akzeptanzkriterien

1. **AC-1** — WHEN kein Filter gesetzt ist, THEN SHALL das System nach Verkaufsanzahl absteigend sortieren und die Spalte „Typ" einblenden.
2. **AC-2** — WHEN ein Verkäufer-Typ gewählt wird, THEN SHALL das System serverseitig filtern und die Spalte „Typ" ausblenden; die KPI-Zeilen SHALL unverändert bleiben.
3. **AC-3** — THE SYSTEM SHALL den Rang gemäß der aktuellen Sortierung vergeben.
4. **AC-4** — THE SYSTEM SHALL die Ränge 1 bis 3 als Gold-, Silber- und Bronze-Badge und ab Rang 4 als graue Zahl anzeigen.
5. **AC-5** — THE SYSTEM SHALL in der Auszahlungsspalte immer den erwarteten Betrag anzeigen und abgerechnete Verkäufer mit einem Häkchen kennzeichnen.
6. **AC-6** — THE SYSTEM SHALL die Tabelle auf 300 px Höhe begrenzen und darüber scrollen lassen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #statistik #rangliste #tabelle #haupt-app
