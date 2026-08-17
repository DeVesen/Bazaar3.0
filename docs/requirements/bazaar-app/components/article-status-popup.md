---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: article-status-popup

**Bibliothek:** [`modal`](../../../components/modal/component.md) + [`button`](../../../components/button/component.md) + [`confirmdialog`](../../../components/confirmdialog/component.md)
**Verwendung:** Nur Haupt-App, **nur Admin** — Artikel-Übersicht ([Epic_Artikel](../epics/Epic_Artikel/epic.md) Abschnitt 3)

## Index
- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Aufbau — Zeilen und Buttons
- 3. Kaskade — Was ein Löschen mitnimmt
- 4. Sperren — Wann nichts geht
- 5. Manueller Verkauf — Warnung und Kennzeichnung
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Korrekturwerkzeug für die vier Status-Zeitstempel eines Artikels.

---

## Überblick

Das Popup ist die **Reparaturstelle** des Basar-Tags: Es setzt und löscht Zeitstempel von Hand, wenn die normalen Wege nicht mehr greifen — Kasse abgestürzt, falsch gescannt, Artikel doch zurückgegeben.

Genau deshalb ist es **Admin-only** und mit Bestätigungen versehen: Jeder Klick hier verändert Geldwirkung. Kassenpersonal sieht den Status-Badge, aber er ist nicht klickbar.

---

## 1. ASCII-Darstellung

```
┌────────────────────────────────────────┐
│  Artikel 1043 — Status            [✕]  │
├────────────────────────────────────────┤
│  Erstellt Am        17.08.2026 08:04   │
│  Freigegeben Am     17.08.2026 08:12 🗑 │
│  Verkauft Am        —                ➕ │
│  Rückgegeben Am     —                ➕ │
│  Abgerechnet Am     —                   │
├────────────────────────────────────────┤
│                          [Schließen]    │
└────────────────────────────────────────┘
```

Modal `sm`. Buttons als `p-button [text]="true" [rounded]="true"` — Icon ohne Hintergrund, damit die Zeile ruhig bleibt.

---

## 2. Aufbau

| Zeile | Wert vorhanden | Wert `null` |
|---|---|---|
| Erstellt Am | Zeitstempel, read-only | — |
| Freigegeben Am | Zeitstempel + **Löschen-Icon** | **Setzen-Icon** |
| Verkauft Am | Zeitstempel + **Löschen-Icon** | **Setzen-Icon** |
| Rückgegeben Am | Zeitstempel + **Löschen-Icon** | **Setzen-Icon** |
| Abgerechnet Am | Zeitstempel, read-only | — |

`createdAt` ist unveränderlich, der Abrechnungszeitpunkt gehört dem **Verkäufer** und nicht dem Artikel — beide sind darum nur Anzeige. Zurückgesetzt wird eine Abrechnung über die Verkäufer-Karte, nicht hier.

**Gegenseitige Sperre:** Ist `soldAt` gesetzt, ist das Setzen-Icon bei `returnedAt` deaktiviert — und umgekehrt. Ein Artikel kann nicht verkauft **und** zurückgegeben sein.

---

## 3. Kaskade

Wird ein früherer Zeitstempel gelöscht, werden alle nachfolgenden `null`. Löschen von „Freigegeben Am" entfernt also auch „Verkauft Am" und „Rückgegeben Am".

**Das Popup nennt vorher, was es mitnimmt:**

```
┌──────────────────────────────────────────────┐
│  Freigabe entfernen?                          │
├──────────────────────────────────────────────┤
│  Damit werden ebenfalls entfernt:             │
│    • Verkauft am 17.08.2026 14:22             │
│    • Rückgegeben am —                         │
│                                               │
│              [Abbrechen]  [Entfernen]         │
└──────────────────────────────────────────────┘
```

Ein einzelner Klick auf ein Icon darf keinen Verkauf stillschweigend vernichten. Die Bestätigung listet die konkreten Zeitstempel mit Datum, nicht nur ihre Namen — „Verkauft am 17.08. 14:22" ist eine Information, „Verkauft Am" wäre nur ein Feldname.

---

## 4. Sperren

| Zustand | Verhalten des Popups |
|---|---|
| Verkäufer **abgerechnet** (`settledAt` gesetzt) | Alle Icons deaktiviert; Hinweiszeile „Abrechnung zuerst stornieren", verlinkt auf die Verkäufer-Seite |
| Artikel verkauft | `returnedAt` nicht setzbar (und umgekehrt) |

Die Sperre wird **serverseitig** durchgesetzt (`409` mit `errorCode: settlement.locked`) — die deaktivierten Icons sind die Bequemlichkeit, nicht die Regel.

---

## 5. Manueller Verkauf

Wird „Verkauft Am" hier von Hand gesetzt, warnt das Popup vorher:

> Dieser Verkauf entsteht ohne Kassenvorgang und fehlt in der Kassenabstimmung.

Nach Bestätigung setzt der Server zusätzlich `soldManually = true`. Der Artikel trägt danach in der Tabelle ein Badge **„manuell"**, und [Epic_Statistik](../epics/Epic_Statistik/epic.md) weist die Summe dieser Verkäufe getrennt aus.

Der Fall ist real — der Artikel ist verkauft, das Geld liegt in der Schublade, aber die Kasse ist abgestürzt. Ohne diese Möglichkeit bliebe der Verkäufer unbezahlt. Die Warnung macht sichtbar, dass es eine Ausnahme ist und keine zweite Verkaufsroute.

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL das Popup ausschließlich für die Rolle Admin öffnen; für Kassenpersonal SHALL der Status-Badge nicht klickbar sein.
2. **AC-2** — THE SYSTEM SHALL „Erstellt Am" und „Abgerechnet Am" ohne Aktions-Icons anzeigen.
3. **AC-3** — WHEN ein Zeitstempel gelöscht wird, dessen Kaskade weitere Zeitstempel entfernt, THEN SHALL das System diese im Bestätigungsdialog mit Datum und Uhrzeit nennen und erst nach Bestätigung löschen.
4. **AC-4** — IF `soldAt` gesetzt ist, THEN SHALL das Setzen-Icon bei `returnedAt` deaktiviert sein, und umgekehrt.
5. **AC-5** — IF der Verkäufer des Artikels abgerechnet ist, THEN SHALL das System alle Aktions-Icons deaktivieren und den Hinweis „Abrechnung zuerst stornieren" anzeigen.
6. **AC-6** — WHEN „Verkauft Am" von Hand gesetzt wird, THEN SHALL das System vorher den Hinweis auf die fehlende Kassenabstimmung anzeigen und nach Bestätigung `soldManually` setzen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #artikel #zeitstempel #korrektur #admin #haupt-app
