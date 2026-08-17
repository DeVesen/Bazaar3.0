---
id: F-BA-003
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Abrechnung

## Index
- Überblick — Prozess-Ablauf
- 1. Verkäufer-Selektion — Auswahl
- 2. Abrechnungs-Ansicht — Hauptansicht
- 3. Zurückgeben-Popup — Rückgabe
- 4. Abrechnen-Popup — Abrechnung, Rundung, Auszahlungsbetrag
- 5. Nicht abgegebene Artikel — Aufräumen beim Abrechnen
- 6. Druckfunktion — Ausdruck
- 7. Backend & API — Endpoints
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** Tagesgeschäft → Abrechnung
**Route:** `/settlement`
**Sichtbar für:** Admin und Kassenpersonal (Stornieren nur Admin)

Component-Details → [`settlement-panel`](../../components/settlement-panel.md) · [`scan-dialog`](../../../../components/scan-dialog/component.md)

**Ziel:** Kassenpersonal rechnet einen Verkäufer ab und bereitet die Auszahlung vor.

**User Story:** Als Kassenpersonal möchte ich einen Verkäufer auswählen, seine Artikel abrechnen und einen Ausdruck erstellen, damit die Auszahlung korrekt und dokumentiert erfolgt.

---

## Überblick

Die Abrechnung-Seite verwaltet Rückgabe nicht verkaufter Artikel und die finanzielle Abrechnung mit dem Verkäufer. Beim Navigieren auf die Seite wird **immer** zuerst die Verkäufer-Auswahl angezeigt.

---

## 1. Verkäufer-Selektion

→ Komponente: [Seller-Search](../../../../components/seller-search/component.md) — `showCreateButton="false"`

Identische Suchfeld-Ansicht wie Artikelannahme — InputGroup in Card, max-width 500 px.
Hinweistext: „ENTER bei 1 Treffer oder direkt klicken" (12.5 px, muted, mt 8 px).

Die Seite funktioniert als **Wizard**: Selektion ausblenden → Abrechnungs-Ansicht einblenden.
In der Abrechnungs-Ansicht gibt es ein **„← Zurück"**-Element zur Selektion.

**Unterschied zu Artikelannahme:** Es muss **exakt ein** Verkäufer selektiert werden — kein „Anlegen"-Button.

| Eingabe | Verhalten |
|---|---|
| (leer) | Alle Verkäufer in der Liste |
| Text | Filtert nach Verkäufer-ID, Vorname, Nachname |
| Genau 1 Treffer + ENTER oder Klick | Wechsel zur Abrechnungs-Ansicht |
| Mehr als 1 Treffer + ENTER | Keine Aktion |

---

## 2. Abrechnungs-Ansicht

### Kopfzeile

`display: flex; align-items: center; gap: 14px; background: white; border: 1px solid --border; border-radius: 8px; padding: 14px 16px; margin-bottom: 14px`

- Links (flex-column): Name (700, 16 px) + Adresse (13 px, muted)
- Rechts (`margin-left: auto; display: flex; gap: 8px`): Buttons in Reihenfolge:
  1. „← Zurück" (`secondary outlined`)
  2. „🖨️ Drucken" (`secondary outlined`)
  3. „↩ Zurückgeben" (`primary`)
  4. „✓ Abrechnen" (`success`)

### Button-Regeln

| Button | Aktiv wenn |
|---|---|
| **Drucken** | Immer aktiv |
| **Zurückgeben** | Mindestens 1 Artikel hat Status „freigegeben" (noch im Verkauf) |
| **Abrechnen** | Mindestens 1 Artikel wurde freigegeben **UND** alle freigegebenen Artikel sind entweder Verkauft oder Zurückgegeben (kein Artikel mehr offen im Verkauf) |

### KPI-Kacheln (3 Stück, `c3`)

→ Komponente: [KPI-Tile](../../../../components/kpi-tile/component.md) im Grid `c3`

| Kachel | Farbe |
|---|---|
| Offene Artikel (noch im Verkauf) | warning |
| Verkaufte Artikel | success |
| Umsatz | — |

### Bereits abgerechneter Verkäufer

Die Auswahl bleibt **erlaubt** — der endgültige Beleg wird auch nachträglich gedruckt, und „was hat Meier bekommen?" ist eine Frage, die nachmittags gestellt wird. Die Ansicht ist dann schreibgeschützt:

| Element | Zustand |
|---|---|
| Kopfzeile | zusätzliches Badge „Abgerechnet am 17.08.2026 16:40 · 332,94 €" |
| „↩ Zurückgeben" | deaktiviert |
| „✓ Abrechnen" | deaktiviert |
| „🖨️ Drucken" | **aktiv** — liefert den endgültigen Beleg |
| Artikelliste | vollständig, rein lesend |

Der Betrag im Badge kommt aus `payoutAmount`. Genau hier zeigt sich, warum das Feld gespeichert wird und nicht nachgerechnet: Nach einem Storno mit Korrektur wäre der ursprünglich ausgezahlte Betrag sonst verloren.

Für weitere Artikel dieses Verkäufers muss ein Admin die Abrechnung stornieren — die Artikelannahme blockiert die Auswahl entsprechend ([Epic_Artikelannahme](../Epic_Artikelannahme/epic.md)).

### Artikelliste

Alle Artikel dieses Verkäufers — Nummer, Bezeichnung, Preis, Status. **Rein lesend:** kein Edit-Button, kein Artikelstatus-Popup.

**Sortierung: Artikelnummer aufsteigend** — auf dem Bildschirm und im Ausdruck, dort innerhalb jeder der drei Gruppen. Die Nummer steht auf dem Etikett; beim Einsammeln vergleicht der Verkäufer Nummern, und jede andere Ordnung zwingt zum Suchen. Eine Gruppierung wie im Ausdruck braucht der Bildschirm nicht, weil dort die Statusspalte sichtbar und sortierbar ist.

Die Abrechnung ist ein Zählvorgang, kein Pflegevorgang. Wer korrigieren muss, tut das auf der [Artikel-Seite](../Epic_Artikel/epic.md), wo die Sperrregeln stehen. Zwei Oberflächen mit denselben Aktionen und unterschiedlichen Sperren wären genau die Doppelung, die auseinanderläuft.

---

## 3. Zurückgeben-Popup

→ Komponente: [Scan-Dialog](../../../../components/scan-dialog/component.md) — `targetField="returnedAt"`

Identisch zum Artikel-Freigeben-Popup (→ [Epic_Verkaeufer](../Epic_Verkaeufer/epic.md)) — gleicher Aufbau, gleiche Kamera/Eingabe-Modi, gleiche Scan-Feedback-Logik.

**Einziger Unterschied:** Statt `releasedAt` wird `returnedAt = jetzt` gesetzt.

---

## 4. Abrechnen-Popup

Größe `sm`. Auflistung der Abrechnungsposten:

```
Umsatz (Summe verkaufter Artikel)                        XX,XX €
Provision (Umsatz × Verkäufer.salesCommission %)        − XX,XX €
────────────────────────────────────────────────────────────────
Auszahlung an Verkäufer                                  XX,XX €
```

> Maßgeblich ist `Verkäufer.salesCommission` — das eigene Feld der Verkäufer-Entität, nicht der aktuell zugewiesene Wert des Typs (`commissionRate`).

**Die Annahmegebühr geht hier nicht ab.** Sie wurde bereits am Annahmetisch in Bargeld bezahlt und steht als `intakeFeePaid` am Verkäufer ([Epic_Artikelannahme](../Epic_Artikelannahme/epic.md) Abschnitt 4). Sie in dieser Aufstellung abzuziehen würde bedeuten, dass der Verkäufer sie zweimal zahlt — einmal in bar bei der Abgabe und einmal als Abzug von der Auszahlung. Deshalb hat das Popup genau drei Zeilen.

**Zeilen-Stil:** flex space-between, padding 7 px 0, 15 px, border-bottom 1 px `#f2f4f6`.
**Total-Zeile:** border-top 2 px, kein border-bottom, mt 8 px, pt 10 px; Betrag in success-Farbe, 18 px, 700.
Provisions-Zeile: Betrag in danger-Farbe.

### Rundung

Verbindliche Reihenfolge, **genau eine** Rundung:

1. Umsatz aufsummieren — bereits centgenau, keine Rundung nötig
2. Provision berechnen und **kaufmännisch auf 2 Dezimalstellen** runden
3. Auszahlung = Umsatz − gerundete Provision

Bei 87,50 € Umsatz und 15 % ergibt die Provision 13,125 € → gerundet 13,13 €, Auszahlung 74,37 €. Weil die Auszahlung die Differenz zweier centgenauer Beträge ist, geht sie immer glatt auf. Am Ende zu runden statt bei der Provision würde Anzeige und Ausdruck um einen Cent auseinanderlaufen lassen.

Kein Runden auf 5 Cent: Ein-Cent-Münzen existieren, und ein aufgerundeter Cent zu Lasten des Verkäufers ist unnötig erklärungsbedürftig.

Klick **„Buchen"** → `settledAt = jetzt` **und** `payoutAmount = ausgezahlter Betrag` werden am Verkäufer gesetzt; nicht abgegebene Artikel werden entfernt (Abschnitt 5).

**Warum der Betrag gespeichert wird:** `settledAt` sagt „abgerechnet", nicht „wie viel". Solange nichts mehr änderbar ist, ließe sich der Betrag nachrechnen — aber genau dafür gibt es das Stornieren. Nach Storno, Korrektur und erneutem Abrechnen wäre der ursprünglich ausgezahlte Bargeldbetrag unauffindbar und die Kasse hätte eine Differenz, die niemand erklären kann. Beim Stornieren wird `payoutAmount` auf `null` zurückgesetzt.

Damit stehen der Geldschublade zwei gespeicherte Summen gegenüber statt zweier Hochrechnungen: `intakeFeePaid` (eingenommen) und `payoutAmount` (ausgezahlt).

**Danach ist der Verkäufer gesperrt:** Alle Felder und Zeitstempel seiner Artikel lehnen Änderungen mit `409` ab ([Epic_Artikel](../Epic_Artikel/epic.md) Abschnitt 4). Der einzige Weg zurück ist das **Stornieren der Abrechnung** über das Status-Popup der Verkäufer-Karte — Admin-only und bestätigungspflichtig ([Epic_Verkaeufer](../Epic_Verkaeufer/epic.md) Abschnitt 3). So bleibt eine ausgezahlte Summe nachvollziehbar, statt nachträglich still zu wandern.

---

## 5. Nicht abgegebene Artikel

Die Abrechnen-Bedingung betrachtet nur **freigegebene** Artikel. Ein vorangemeldeter Verkäufer, der 40 Artikel erfasst und 30 gebracht hat, kann also abgerechnet werden, während 10 Artikel mit leerem `releasedAt` zurückbleiben.

**Diese Artikel werden beim Abrechnen entfernt.** Der Abrechnen-Dialog nennt die Anzahl vorher: „10 nicht abgegebene Artikel werden entfernt".

Begründung: Der Artikel hat den Basar nie erreicht. Es gibt keinen Vorgang zu dokumentieren, es wurde keine Gebühr dafür kassiert und keine Auszahlung berührt ihn. Ihn zu behalten würde das Sidebar-Badge „offene Artikel" ([Epic_App_Shell](../Epic_App_Shell/epic.md)) und jede Artikelstatistik dauerhaft mit Karteileichen belasten. Der Datensatz existiert außerdem weiterhin in der Voranmelde-App.

Kein zusätzlicher Zeitstempel `notDeliveredAt`: Er würde ein Feld und eine Filterbedingung in jede Abfrage einbringen, um eine Historie zu erhalten, die niemand liest.

---

## 6. Druckfunktion (Abrechnung)

Beim Klick auf **„Drucken"** wird die Verkäufer-Übersicht gedruckt.
Details → [Epic_Druckfunktionen](../Epic_Druckfunktionen/epic.md)

**Verbindliche Reihenfolge:**

```
Drucken  →  einsammeln  →  Rückgabe-Scan  →  Abrechnen  →  Drucken (endgültig)
```

Der Ausdruck wird **vor** dem Rückgabe-Scan gebraucht: Dort ist die Gruppe „Noch im Verkauf" die Einsammelliste für den Verkäufer. Alle Beträge sind zu diesem Zeitpunkt als **„vorläufig"** gekennzeichnet, weil erst nach dem Scan feststeht, was verkauft und was zurückgegeben wurde. Nach dem Abrechnen liefert derselbe Button den endgültigen Beleg mit dem Auszahlungsbetrag — darum bleibt „Drucken" immer aktiv, während „Zurückgeben" und „Abrechnen" Bedingungen haben.

---

## 7. Backend & API

API-Details → [`api/settlement.md`](../../api/settlement.md)

Die Kennzahlen und Posten kommen über den **Query-Port** als fertiges Read-Model ([`spec.md`](../../spec.md) Abschnitt 7.0.1) — dieselbe Bauweise wie die Verkäufer-Karten.

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/sellers/{id}/settlement` | `authenticated` | Read-Model: KPI-Kacheln, Abrechnungsposten, Artikelliste |
| `PUT /api/articles/{id}/return` | `authenticated` | Setzt `returnedAt` (Zurückgeben-Scan, Abschnitt 3) |
| `POST /api/sellers/{id}/settlement` | `authenticated` | Setzt `settledAt` und `payoutAmount`, entfernt nicht abgegebene Artikel — in einer Transaktion |

Das **Stornieren** liegt bei [Epic_Verkaeufer](../Epic_Verkaeufer/epic.md) (`DELETE /api/sellers/{id}/settlement`, Admin-only, bestätigungspflichtig) und wird hier nicht dupliziert.

## Akzeptanzkriterien

1. **AC-1** — WHEN die Abrechnung-Seite geöffnet wird, THEN SHALL das System die Verkäufer-Auswahl anzeigen und keinen Verkäufer vorselektieren.
2. **AC-2** — WHEN ein Verkäufer ausgewählt wird, THEN SHALL das System seine Abrechnungsposten (Umsatz, Provision, Auszahlung) und seine Artikelliste laden und anzeigen; die bereits kassierte Annahmegebühr SHALL **nicht** als Abzugsposten erscheinen.
3. **AC-3** — WHILE ein Verkäufer noch Artikel im Verkauf hat (`releasedAt` gesetzt, `soldAt` und `returnedAt` leer), SHALL das System den „Abrechnen"-Button deaktiviert halten.
4. **AC-4** — WHEN „Abrechnen" geklickt wird, THEN SHALL das System `settledAt = jetzt` am Verkäufer setzen; die verkauften Artikel (`soldAt` gesetzt) bleiben unverändert — „abgerechnet" ist ein Verkäufer-Zustand, kein Artikel-Zustand.
5. **AC-5** — THE SYSTEM SHALL die Provision kaufmännisch auf 2 Dezimalstellen runden und die Auszahlung als Umsatz minus gerundete Provision berechnen; eine weitere Rundung SHALL nicht erfolgen.
6. **AC-6** — WHEN abgerechnet wird, THEN SHALL das System den ausgezahlten Betrag in `payoutAmount` am Verkäufer speichern.
7. **AC-7** — WHEN eine Abrechnung storniert wird, THEN SHALL das System `payoutAmount` auf `null` zurücksetzen.
8. **AC-8** — IF der Verkäufer Artikel mit leerem `releasedAt` hat, THEN SHALL der Abrechnen-Dialog deren Anzahl nennen und diese Artikel beim Buchen entfernen.
9. **AC-9** — THE SYSTEM SHALL `settledAt`, `payoutAmount` und das Entfernen der nicht abgegebenen Artikel in einer Transaktion ausführen.
10. **AC-10** — WHEN „Zurückgeben" geklickt wird, THEN SHALL das System bei allen noch im Verkauf befindlichen Artikeln des Verkäufers (`releasedAt` gesetzt, `soldAt` leer) `returnedAt = jetzt` setzen.
11. **AC-11** — WHEN „🖨️ Drucken" geklickt wird, THEN SHALL das System den Druckdialog mit gruppierten Artikeln (Im Verkauf, Verkauft, Sonstige) öffnen.
12. **AC-12** — THE SYSTEM SHALL die Artikelliste dieser Seite ohne Edit-Button und ohne Artikelstatus-Popup anzeigen.
13. **AC-13** — WHEN ein bereits abgerechneter Verkäufer ausgewählt wird, THEN SHALL das System die Ansicht schreibgeschützt zeigen: „Zurückgeben" und „Abrechnen" deaktiviert, „Drucken" aktiv, und im Kopf ein Badge mit Abrechnungszeitpunkt und ausgezahltem Betrag.
14. **AC-14** — THE SYSTEM SHALL die Artikelliste nach Artikelnummer aufsteigend sortieren — auf dem Bildschirm und im Ausdruck innerhalb jeder Gruppe.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #abrechnung #verkäufer #auszahlung #provision #drucken
