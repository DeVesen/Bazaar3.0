---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: seller-card

**Bibliothek:** [`card`](../../../components/card/component.md) + [`badge`](../../../components/badge/component.md) + [`button`](../../../components/button/component.md)
**Verwendung:** Nur Haupt-App — Karten-Grid der Verkäufer-Seite ([Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md))

## Index
- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Aufbau — Elemente & Maße
- 3. Kennzahlen — Woher die Werte kommen
- 4. Aktionen & Rollen — Buttons und Klickflächen
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Kachel eines Verkäufers mit Identität, Status, vier Artikel-Zählern und drei Warenwert-Summen.

---

## Überblick

Die Karte ersetzt eine Tabellenzeile, weil pro Verkäufer sieben Zahlen plus Status und zwei Aktionen zu zeigen sind — in einer Tabelle wären das zwölf Spalten, die auf einem Tablet nicht lesbar sind.

**Dumb Component:** Sie erhält einen fertigen Datensatz als Input und löst Aktionen als Output aus. Alle Zahlen kommen serverseitig gerechnet aus dem Query-Port ([`api/sellers.md`](../api/sellers.md)) — die Karte rechnet nichts.

---

## 1. ASCII-Darstellung

```
┌──────────────────────────────────────────────┐
│ Anna Meier        [Privat]        [✏️] [📷]   │
│ 76133 Karlsruhe  #a3f9c2d1                   │
│ [Im Verkauf]                                  │
│ ┌──────────────────────────────────────────┐  │
│ │ Artikel gesamt: 42  │ Freigegeben: 40    │  │
│ │ Verkauft: 31        │ Rückgegeben: 9     │  │
│ └──────────────────────────────────────────┘  │
│ ┌──────────────┬───────────────┬──────────┐   │
│ │ ANGENOM. WW  │ OFFENER WW    │ UMSATZ   │   │
│ │ 512,50 €     │ 96,00 €       │ 380,50 € │   │
│ └──────────────┴───────────────┴──────────┘   │
└──────────────────────────────────────────────┘
```

Grid der Seite: `repeat(auto-fill, minmax(340px, 1fr))`, gap 12 px.

### Leerzustand des Grids

Das Grid ist **keine Tabelle** und erbt den Leerzustand von [`table`](../../../components/table/component.md) nicht — er wird hier definiert:

| Fall | Anzeige |
|---|---|
| kein Verkäufer vorhanden | „Noch keine Verkäufer. Über **Einstellungen → Import** die Voranmeldedaten einlesen oder mit **+ Neu** einen Verkäufer anlegen." |
| Filter ohne Treffer | „Keine Verkäufer für die gewählten Filter." plus Schaltfläche **Filter zurücksetzen** |

Der Erstfall ist hier **erwartbar und häufig** — jeder Basar beginnt so, vor dem Import ist es der erste Zustand, den jemand sieht. „Keine Einträge gefunden" wäre da eine Feststellung ohne Nutzen; der Weg zum Import ist die eigentliche Information.

Die Schaltfläche im Filterfall spart das Zurücksetzen von Hand, wenn drei Filter-Chips aktiv sind.

---

## 2. Aufbau

| Element | Stil |
|---|---|
| Karte | padding 16 px |
| Kopfzeile | flex, `justify-content: space-between`, `align-items: flex-start` |
| Name + Typ-Badge | nebeneinander, gap 8 px; Name 700 / 15 px, Typ-Badge 10 px |
| Adresse + ID | 12 px, muted; `#ID` in `font-weight: 600` |
| Status-Badge | eigene Zeile, `margin-bottom: 8 px` |
| Stats-Grid | 2×2, gap row 3 px / col 16 px, 12.5 px; Label muted, Wert 600 |
| Footer-Grid | 3 gleich breite Spalten, `border-top: 1 px`, pt 10 px, mt 6 px |
| Footer-Label | 10 px, muted, uppercase |
| Footer-Wert | 700, 14 px |

**Status-Badge — genau einer, abgeleitet, nicht persistiert:**

| Bedingung | Badge |
|---|---|
| `settledAt` gesetzt | `Abgerechnet` (success) |
| mindestens ein Artikel freigegeben, nicht abgerechnet | `Im Verkauf` (info) |
| kein freigegebener Artikel | `Offen` (sec) |

---

## 3. Kennzahlen

| Wert | Berechnung |
|---|---|
| Artikel gesamt | alle Artikel des Verkäufers |
| Freigegeben | `releasedAt` gesetzt |
| Verkauft | `soldAt` gesetzt |
| Rückgegeben | `returnedAt` gesetzt |
| Angenom. Warenwert | Summe der Preise aller Artikel mit `releasedAt` |
| Offener Warenwert | Summe der Preise mit `releasedAt`, ohne `soldAt` und `returnedAt` |
| Umsatz | Summe der Preise mit `soldAt` |

Alle sieben Werte kommen als Felder der Listen-Response. Die Karte darf sie **nicht** aus einer Artikelliste selbst bilden: Dafür müsste die Seite alle Artikel aller Verkäufer laden.

Geldbeträge in deutscher Formatierung mit zwei Dezimalstellen, auch bei glatten Werten (Konvention → [`inputnumber`](../../../components/inputnumber/component.md)).

---

## 4. Aktionen & Rollen

| Fläche | Wirkung |
|---|---|
| **✏️ Edit** (`p-button secondary outlined small`) | öffnet den Verkäufer-Bearbeiten-Dialog |
| **📷 Scanner** (`p-button secondary outlined small`, Kamera-Icon) | öffnet den Freigabe-Dialog ([`scan-dialog`](../../../components/scan-dialog/component.md)) |
| **Klick auf Status-Badge** | öffnet das Abrechnungs-Popup mit Zeitstempel; der Zurücksetzen-Button darin ist **nur für Admins** sichtbar |
| **Klick auf die Karte** (außerhalb der Buttons) | öffnet das Detail-Modal (Nummer, QR-Code, Artikelliste) |

Vier Klickflächen auf einer Karte sind grenzwertig — deshalb hat die Karte bewusst **keinen** Löschen-Button. Löschen sitzt im Bearbeiten-Dialog, wo es eine Bestätigung gibt; auf jeder Karte einen Papierkorb anzubieten lädt zum Verklicken ein.

Die Kartenfläche selbst muss dabei erkennbar klickbar sein (Cursor, Hover-Hervorhebung), sonst findet niemand das Detail-Modal.

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL alle sieben Kennzahlen aus der Listen-Response übernehmen und keine eigene Berechnung über Artikeldaten durchführen.
2. **AC-2** — THE SYSTEM SHALL genau einen Status-Badge nach der Bedingungstabelle aus Abschnitt 2 anzeigen.
3. **AC-3** — WHEN auf die Karte außerhalb der Aktions-Buttons und des Status-Badges geklickt wird, THEN SHALL das System das Detail-Modal öffnen.
4. **AC-4** — WHILE der angemeldete Nutzer die Rolle Kassenpersonal hat, SHALL der Zurücksetzen-Button im Abrechnungs-Popup nicht gerendert werden.
5. **AC-5** — THE SYSTEM SHALL Geldbeträge mit zwei Dezimalstellen und deutscher Formatierung anzeigen.
6. **AC-6** — THE SYSTEM SHALL keinen Löschen-Button auf der Karte anbieten.
7. **AC-7** — WHILE kein Verkäufer vorhanden ist und kein Filter aktiv ist, SHALL das Grid den Hinweis mit den Wegen Import und „+ Neu" anzeigen.
8. **AC-8** — WHILE ein aktiver Filter kein Ergebnis liefert, SHALL das Grid „Keine Verkäufer für die gewählten Filter." und eine Schaltfläche „Filter zurücksetzen" anzeigen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #verkaeufer #karte #kennzahlen #haupt-app
