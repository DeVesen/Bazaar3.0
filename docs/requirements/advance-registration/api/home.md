---
status: reviewed
reviewed-date: 2026-08-17
---

# API: Home-Dashboard

Kennzahlen der Startseite `/home`. Zwei Endpoints, weil die Seite je nach
aktivem Role-Toggle völlig andere Kacheln zeigt — dieselbe Route, dieselbe
Component.

**Backend-Verortung:** Beide Endpoints sind **Read-Models** und laufen nicht über
Repositories, sondern über einen eigenen Query-Port `IHomeQueries`
(Implementierung mit direktem EF-/SQL-Zugriff in `Bazaar.Infrastructure`). Für
Kennzahlen und Heatmap-Aggregate Aggregate zu laden wäre pure Verschwendung —
siehe [`cross-cutting.md`](cross-cutting.md), Abschnitt „Persistenz-Zugriff".

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md).

Epics → [Epic_Home_Verkaeufer](../epics/Epic_Home_Verkaeufer/epic.md) ·
[Epic_Home_Admin](../epics/Epic_Home_Admin/epic.md) ·
Component → [`home-dashboard.md`](../components/home-dashboard.md)

---

## Endpoints

| Endpoint | Auth | Zweck |
|---|---|---|
| `GET /api/home/seller` | `authenticated` | Kennzahlen der Verkäufer-Ansicht |
| `GET /api/home/admin` | `admin` | Systemweite Kennzahlen + Aktivitäts-Heatmap |

---

## Varianten

| | `seller` | `admin` |
|---|---|---|
| Auth | `authenticated` | `admin` |
| Kacheln | 4 (Grid `c4`) | 5 (Grid `c5`) |
| Heatmap | — | ✅ |

```json
// GET /api/home/seller
{
  "articleCount": 12,
  "typeConditions": { "commissionRate": 15.0, "itemFee": 0.50 }
}
```

```json
// GET /api/home/admin
{
  "sellerCount": 84,
  "articleCount": 1372,
  "categoryCount": 14,
  "brandCount": 63,
  "heatmapData": [
    { "date": "2026-08-01", "count": 7 },
    { "date": "2026-08-02", "count": 0 }
  ]
}
```

---

## Was diese Endpoints bewusst **nicht** liefern

| Nicht enthalten | Kommt stattdessen aus |
|---|---|
| Die 5 Basar-Termine | [`GET /api/public/info`](public.md) |
| `infoText` | [`GET /api/public/info`](public.md) |

**Grund:** Die Home-Seite ruft `GET /api/public/info` ohnehin für den Countdown
auf. Termine *und* Info-Text zusätzlich in zwei authentifizierten Responses zu
duplizieren, schafft nur eine zweite Quelle, die driften kann. Eine
Home-Ansicht feuert also zwei parallele Requests — bewusst so
(DRY-Entscheidung, Epic_Countdown_Widget Abschnitt 3).

**Ebenfalls nicht enthalten:** die Kachel „Abgabegebühr gesamt". Sie ist
`articleCount × typeConditions.itemFee` und wird im Frontend gerechnet
(siehe [`home-dashboard.md`](../components/home-dashboard.md)).

---

## Feld-Details

### `typeConditions`

Provision und Gebühr pro Stück des dem Nutzer **zugewiesenen** Verkäufer-Typs,
serverseitig aufgelöst. Kein Override pro Verkäufer in dieser App
(siehe [`entities/verkaeufer-typ.md`](../entities/verkaeufer-typ.md)) — eine Änderung am Typ wirkt sofort
live auf diesen Wert (Epic_Verkaeufer_Typen Abschnitt 4).

Gleiche Form wie `defaultConditions` in [`public.md`](public.md), aber fachlich
etwas anderes: hier *mein* Typ, dort der Standardtyp für Neuregistrierungen.

### `heatmapData`

Aktivität **aller** Artikel (nicht nur eigener) der letzten **12 Wochen**.
Ein Eintrag pro Tag; `count` = Anzahl `createdAt`- plus `updatedAt`-Ereignisse
an diesem Tag.

Zeitfenster ist serverseitig fest — kein Query-Parameter, weil die UI kein
Umschalten anbietet (Epic_Home_Admin Abschnitt 2).

Format entspricht exakt dem Component-Contract
`{ date: string, count: number }[]` der
[Activity-Heatmap](../../../components/activity-heatmap/component.md).

---

## Role-Toggle

Der Role-Toggle (VSHELL-S04 AC-8) wechselt nur die **Ansicht**, nicht das Token.
Ein Admin im Verkäufer-Modus ruft `GET /api/home/seller` auf und bekommt seine
**eigenen** Kennzahlen — Admins haben eigene Artikel und einen eigenen
Verkäufer-Typ (siehe Epic_Meine_Artikel).

`GET /api/home/seller` prüft daher keine Rolle; der Client entscheidet, welchen
der beiden Endpoints er ruft.

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #home #dashboard #kpi #heatmap #role-toggle
