---
id: F-BA-004
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Statistik

## Index
- Überblick — Live-Kennzahlen
- 1. KPI-Zeile 1 — Artikel-Übersicht
- 2. KPI-Zeile 2 — Rückblick
- 3. KPI-Zeile 3 — Finanz-KPIs
- 4. Metergroup — Segmentbalken
- 5. Verkäufer-Leaderboard — Rangliste
- 6. Abschnitts-Labels — Beschriftungen
- 7. Backend & API — Query-Port
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** System → Statistik
**Route:** `/statistics`
**Sichtbar für:** Admin und Kassenpersonal (lesend)

Component-Details → [`leaderboard`](../../components/leaderboard.md) · [`kpi-tile`](../../../../components/kpi-tile/component.md)

**Ziel:** Admin und Kassenpersonal sehen eine aktuelle Übersicht der Basar-Kennzahlen ohne Caching.

**User Story:** Als Mitglied des Basar-Teams möchte ich bei jedem Seitenaufruf aktuelle Kennzahlen sehen, damit ich den Veranstaltungsfortschritt jederzeit beurteilen kann.

---

## Überblick

Die Statistik-Seite bietet eine aktuelle Übersicht des Basar-Stands (Berechnung bei jedem Seitenaufruf, kein Caching). Sie ist schreibgeschützt und rein informativ.

Die Seite ist für **beide Rollen** erreichbar (Rechte-Matrix → [`spec.md`](../../spec.md) Abschnitt 4.1). Es gibt nichts zu schützen: keine Aktion, keine Eingabe. „Wie viele Artikel sind noch im Verkauf?" ist am Basar-Tag eine Frage des Kassenteams, nicht nur des Betreibers.

**Technisch:** Alle Kennzahlen kommen **serverseitig** aus einem Query-Port als fertiges Read-Model (Abschnitt 7). Keine Berechnung im Browser: Clientseitig müsste die Seite alle Artikel und alle Verkäufer laden, um 14 Kennzahlen zu bilden — bei 2 000 Artikeln auf einem Tablet die langsamste Seite der App. Außerdem existieren dieselben Summen serverseitig bereits für Verkäufer-Karten und Abrechnung; sie im Frontend erneut zu bilden wäre eine zweite Wahrheit.

„Kein Caching" bleibt und ist eine Aussage über **Frische**, nicht über den Ort: Jeder Seitenaufruf löst eine neue Abfrage aus.

---

## 1. KPI-Zeile 1 — ARTIKEL-ÜBERSICHT (6 Kacheln, Grid `c6`)

→ Komponente: [KPI-Tile](../../../../components/kpi-tile/component.md) im Grid `c6`

| # | Kennzahl | Beschreibung |
|---|---|---|
| 1 | Gesamt | Anzahl aller erfassten Artikel |
| 2 | Angenommen | Alle je angenommenen Artikel — `releasedAt` gesetzt, unabhängig davon ob inzwischen verkauft oder zurückgegeben |
| 3 | Im Verkauf | Artikel im Verkauf: `releasedAt` gesetzt, `soldAt` und `returnedAt` leer |
| 4 | Verkauft | Artikel mit `soldAt` gesetzt |
| 5 | Retour | Zurückgegebene Artikel — `returnedAt` gesetzt |
| 6 | Verkaufsquote | `Verkauft / Angenommen × 100` — ist noch kein Artikel angenommen, zeigt die Kachel „–" |

---

## 2. KPI-Zeile 2 — RÜCKBLICK (3 Kacheln, Grid `c3`)

→ Komponente: [KPI-Tile](../../../../components/kpi-tile/component.md) im Grid `c3`

| # | Kennzahl | Beschreibung |
|---|---|---|
| 1 | Warenwert Angenommen | Summe der Preise aller angenommenen Artikel (alle mit `releasedAt` gesetzt) |
| 2 | Warenwert Retour | Summe der Preise zurückgegebener Artikel (`returnedAt` gesetzt) |
| 3 | Offener Warenwert | Summe der Preise noch im Verkauf (`releasedAt` gesetzt, `soldAt` und `returnedAt` leer) |

---

## 3. KPI-Zeile 3 — FINANZ-KENNZAHLEN (6 Kacheln, Grid `c6`)

→ Komponente: [KPI-Tile](../../../../components/kpi-tile/component.md) im Grid `c6`

| # | Kennzahl | Beschreibung |
|---|---|---|
| 1 | Einnahmen Brutto | Summe der Verkaufspreise aller verkauften Artikel |
| 2 | Verdienst Provision | Anteil des Veranstalters aus `salesCommission` **des Verkäufers** |
| 3 | Verdienst Gebühren | Summe von `intakeFeePaid` über alle Verkäufer — die **tatsächlich kassierten** Annahmegebühren |
| 4 | Verdienst Gesamt | Provision + Gebühren |
| 5 | Auszahlung erwartet | Einnahmen Brutto − Verdienst Gesamt — was insgesamt an die Verkäufer geht |
| 6 | Auszahlung geleistet | Summe von `payoutAmount` über die **abgerechneten** Verkäufer |

**Nicht der Verkäufer-Typ ist maßgeblich, sondern die eigenen Felder des Verkäufers** (`salesCommission`). Der Typ hat sie nur belegt und kann sich seither geändert haben — [`spec.md`](../../spec.md) Abschnitt 9.7 und [Epic_Verkaeufer_Typen](../Epic_Verkaeufer_Typen/epic.md) AC-7.

**Gebühren werden nicht hochgerechnet, sondern abgelesen.** Die Annahmegebühr entsteht pro **abgegebenem** Artikel und wird am Annahmetisch in Bargeld kassiert; der Betrag steht als `intakeFeePaid` am Verkäufer ([Epic_Artikelannahme](../Epic_Artikelannahme/epic.md) Abschnitt 4). Eine Formel über verkaufte Artikel wäre doppelt falsch: Artikel, die abgegeben aber nicht verkauft wurden, haben Gebühr gebracht und würden fehlen — und die Zahl wäre eine Schätzung, obwohl der echte Betrag gespeichert ist.

Diese Summe ist zugleich die Zahl, die das Gebühren-Bargeld in der Schublade erklären muss.

**Erwartet gegen geleistet:** „Auszahlung erwartet" ist eine Rechnung über **alle** Verkäufer, auch die noch nicht abgerechneten; „Auszahlung geleistet" ist die Summe der gespeicherten `payoutAmount` der abgerechneten. Die Differenz ist das, was am Ende des Tages noch aus der Schublade rausgeht — unter einem gemeinsamen Label wäre keine der beiden Zahlen brauchbar.

Damit hat diese Seite drei **gespeicherte** Geldanker statt lauter Hochrechnungen: `intakeFeePaid` (rein), die Preise verkaufter Artikel (rein) und `payoutAmount` (raus).

**Manuelle Verkäufe getrennt ausweisen:** Artikel mit `soldManually = true` sind über das Artikelstatus-Popup verkauft worden, ohne Kassenvorgang ([Epic_Artikel](../Epic_Artikel/epic.md) Abschnitt 3). Sie zählen in allen Kennzahlen mit und erscheinen zusätzlich als **Unterzeile „davon manuell" innerhalb der Kachel „Einnahmen Brutto"** — kleiner und gedämpft, und nur wenn der Wert größer als null ist.

Keine eigene Kachel: Es ist keine gleichrangige Kennzahl, sondern eine Einschränkung zu genau einer — und an den meisten Basar-Tagen ist der Wert null und soll dann keinen Platz belegen. Es ist aber die Zahl, die bei der Kassenabstimmung am Abend fehlt und sonst nicht auffindbar wäre.

---

## 4. Metergroup (unter Zeile 3)

`p-metergroup` direkt unterhalb der Finanz-KPI-Zeile:
- Im Verkauf (primary) · Verkauft (success) · Retour (warn) von allen Angenommenen
- Label: Prozent-Wert + Bezeichnung je Segment

---

## 5. Verkäufer-Leaderboard

→ Komponente: [Table](../../../../components/table/component.md)

Standard-Card. Header-Zeile:
- Titel links (700, 14 px) + Dropdown rechts — `display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px`

**Dropdown-Filter:** Umschalten zwischen „Alle Verkäufer-Typen" und einzelnem Typ.

**Tabelle:** Sortiert nach Verkaufsanzahl (Standard).

| Spalte | Hinweis |
|---|---|
| Rang | Rang-Badge (Gold/Silber/Bronze/Grau), Breite 50 px |
| Verkäufer | Name |
| Typ | Nur bei „Alle Verkäufer-Typen" sichtbar; bei gefilterter Ansicht ausgeblendet |
| Angenommen | Anzahl angenommener Artikel |
| Verkauft | Anzahl verkaufter Artikel |
| Umsatz | Verkaufserlös |
| Auszahlung | **Erwartete** Auszahlung (Umsatz − gerundete Provision), plus ✓-Symbol wenn der Verkäufer abgerechnet ist |

**Alle Spalten sortierbar** (Multi-Sort per Shift+Klick).

Die Spalte zeigt bewusst **immer** die erwartete Auszahlung, auch bei abgerechneten Verkäufern: Eine Spalte, die je Zeile etwas anderes bedeutet, ist in einer sortierbaren Tabelle unbrauchbar. Für abgerechnete Verkäufer sind beide Werte ohnehin gleich, weil nach dem Abrechnen nichts mehr änderbar ist ([Epic_Artikel](../Epic_Artikel/epic.md) Abschnitt 4). Die Unterscheidung erwartet gegen geleistet interessiert nur in der Summe — und die steht in Zeile 3.
**Maximale Höhe: 300 px** — bei mehr Einträgen vertikales Scrollen.

Tabellen-Wrapper: `max-height: 300px; overflow-y: auto`.

---

## 6. Abschnitts-Labels über KPI-Zeilen

| KPI-Zeile | Label |
|---|---|
| Zeile 1 | `ARTIKEL-ÜBERSICHT` |
| Zeile 2 | `RÜCKBLICK` |
| Zeile 3 | `FINANZ-KENNZAHLEN` |

Stil: 12 px, 700, uppercase, 0.8 px letter-spacing, `#4a6080`, mb 8 px, mt 6 px (bei Folgezeilen).

---

## 7. Backend & API

API-Details → [`api/statistics.md`](../../api/statistics.md)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/statistics` | `authenticated` | Read-Model für die ganze Seite: alle KPI-Zeilen, Metergroup-Segmente und das Leaderboard |

Ein **Query-Port** ([`spec.md`](../../spec.md) Abschnitt 7.0.1 nennt Statistik dafür ausdrücklich), keine Erweiterung eines Repositories und kein `IQueryable` über die Portgrenze. Eine Abfrage pro Seitenaufruf — die Kennzahlen sind ein Read-Model, kein Aggregat-Zustand.

Der optionale Typ-Filter des Leaderboards (Abschnitt 5) wird als Parameter mitgegeben, damit die Filterung nicht im Browser über eine vollständige Liste läuft.

## Akzeptanzkriterien

1. **AC-1** — WHEN die Statistik-Seite aufgerufen wird, THEN SHALL das System alle Kennzahlen über `GET /api/statistics` serverseitig ermitteln und bei jedem Aufruf neu abfragen (kein Caching).
2. **AC-2** — THE SYSTEM SHALL die Verkaufsquote als `Anzahl verkauft / Anzahl angenommen × 100` berechnen und als Prozentwert anzeigen; ist noch kein Artikel angenommen, SHALL die Kachel „–" zeigen.
3. **AC-3** — WHEN kein Filter gesetzt ist, THEN SHALL das System das Leaderboard nach Verkaufsanzahl absteigend sortiert anzeigen und die Spalte „Typ" einblenden.
4. **AC-4** — WHEN ein Verkäufer-Typ im Dropdown-Filter ausgewählt wird, THEN SHALL das System das Leaderboard auf diesen Typ filtern und die Spalte „Typ" ausblenden.
5. **AC-5** — THE SYSTEM SHALL die Metergroup direkt unterhalb der Finanz-KPI-Zeile rendern mit den Segmenten Im Verkauf (primary), Verkauft (success) und Retour (warn), bezogen auf alle angenommenen Artikel.
6. **AC-6** — THE SYSTEM SHALL den Wert „davon manuell" als Unterzeile in der Kachel „Einnahmen Brutto" anzeigen, und zwar nur wenn er größer als null ist.
7. **AC-7** — THE SYSTEM SHALL in der Leaderboard-Spalte „Auszahlung" immer den erwarteten Betrag anzeigen und abgerechnete Verkäufer zusätzlich mit einem ✓-Symbol kennzeichnen.
8. **AC-8** — THE SYSTEM SHALL die Seite für beide Rollen lesend erreichbar machen; sie enthält keine schreibende Aktion.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #statistik #kpi #leaderboard #finanz #metergroup #verkaufsquote
