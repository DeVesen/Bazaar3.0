---
id: F-BA-001
code: ANNAHME
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Artikelannahme

## Index
- Überblick — Einstieg
- 1. Artikelannahme-Such-Ansicht — Verkäufer suchen
- 2. Verkäufer-Anlage-Wizard — Wizard-Ablauf
- 3. Artikelnummern — Herkunft und Eindeutigkeit
- 4. Annahmegebühr — Wann sie anfällt, wo sie landet
- 5. Zwei Wege für vorangemeldete Artikel — Abgrenzung
- 6. Visual Specs — Layoutdetails
- 7. Backend & API — Endpoints
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** Tagesgeschäft → Artikelannahme (= Startseite / Home-Redirect)
**Route:** `/intake`
**Sichtbar für:** Admin und Kassenpersonal

Component-Details → [`intake-wizard`](../../components/intake-wizard.md) · [`seller-search`](../../../../components/seller-search/component.md)

**Ziel:** Kassenpersonal erfasst Artikel eines Verkäufers und gibt sie für den Verkauf frei.

**User Story:** Als Kassenpersonal möchte ich Artikel eines Verkäufers in einem Wizard erfassen und buchen, damit alle abgegebenen Artikel korrekt im Verkauf registriert sind.

---

## Überblick

Entry-Page für den Annahme-Prozess. Verkäufer werden gesucht oder neu angelegt; anschließend werden ihre Artikel aufgenommen. Der Ablauf ist als **2-Schritt-Wizard** umgesetzt.

---

## 1. Artikelannahme-Such-Ansicht

→ Komponente: [Seller-Search](../../../../components/seller-search/component.md) — `showCreateButton="true"`

InputGroup in Card, **max-width 500 px**.
Hinweistext darunter: `ENTER bei 1 Treffer öffnet Wizard · Kein Treffer: Anlegen-Button erscheint` (12.5 px, muted, mt 10 px).

### Suchfeld-Verhalten

| Eingabe | Verhalten |
|---|---|
| (leer) | Alle Verkäufer in der Liste darunter |
| Text eingegeben | Filtert nach: Verkäufer-ID, Vorname, Nachname |
| Genau 1 Treffer + ENTER | Öffnet Wizard → Schritt 2 (Artikelannahme) |
| Mehr als 1 Treffer + ENTER | Keine Aktion |
| Kein Treffer | Liste ausgeblendet; Button „+ Neuen Verkäufer anlegen" erscheint |

### Abgerechnete Verkäufer

Ein abgerechneter Verkäufer erscheint in der Trefferliste — mit dem Badge **„Abgerechnet"** —, aber die Auswahl führt **nicht** in den Wizard. Stattdessen erscheint der Hinweis:

> Anna Meier ist bereits abgerechnet. Für weitere Artikel muss ein Admin die Abrechnung stornieren.

Der Fall ist real: Um 14 Uhr abgerechnet und ausgezahlt, um 15 Uhr mit einer zweiten Kiste zurück.

**Blockieren statt zulassen**, weil ein zweiter Abrechnungslauf nicht modelliert ist: Technisch würde die Annahme funktionieren — neue Artikel sind neue Datensätze, und die Sperre nach der Abrechnung gilt nur für bestehende. Fachlich entstünden damit Artikel, die **nie** abgerechnet werden können, weil ein zweites `settledAt` mit `settlement.already_settled` abgelehnt wird. Der Verkäufer hätte Ware im Verkauf, für die er kein Geld bekommen kann.

**Blockiert wird bei der Auswahl, nicht beim Buchen** — sonst erfasst Kassenpersonal zwanzig Artikel, bevor der Fehler auftaucht.

**In der Liste sichtbar lassen** statt zu verbergen: „nicht gefunden" sähe wie ein Datenproblem aus, und dann sucht jemand nach dem Verkäufer, der ordentlich angelegt ist.

### Aktionen

- **Klick auf Verkäufer in der Liste** (nicht abgerechnet) → Wizard Schritt 2
- **„+ Neuen Verkäufer anlegen"-Button** (oder ENTER wenn sichtbar) → Wizard Schritt 1
  - Aktuelle Sucheingabe wird als Vorname/Nachname vorbelegt: Text **vor erstem Leerzeichen** = Vorname, Text **danach** = Nachname

---

## 2. Verkäufer-Anlage-Wizard

### Wizard-Navigation

```
┌──────────────────────┬───────────────────────────┐
│  Schritt 1 — Verkäufer  │  Schritt 2 — Artikelannahme │
└──────────────────────┴───────────────────────────┘
```

Tabs: flex row, border-bottom 2 px `--border`, mb 20 px.
Tab-Item: padding 10 px 20 px, 600, 13 px, muted; aktiver Tab: primary-Farbe + border-bottom.

---

### Schritt 1 — Verkäuferanlage

Formular mit allen Verkäufer-Feldern (Panels 01–03, siehe Lastenheft Abschnitt 6.5).
Vorname/Nachname-Vorbelegung aus der Sucheingabe.

**Verkäufer-Typ und Konditionen (Panel 03):** Der Typ ist mit dem am häufigsten zugewiesenen Typ vorbelegt und frei wählbar — auch von Kassenpersonal, das hier Verkäufer anlegen darf. Die daraus abgeleiteten Konditionen (`salesCommission`, `feePerItem`) zeigt das Formular **schreibgeschützt**; überschreiben darf sie ausschließlich der Admin über [Epic_Verkaeufer](../Epic_Verkaeufer/epic.md). Grund: Es ist die einzige Eingabe in dieser App, die unmittelbar Geld verschiebt, und am Annahmetisch wird unter Zeitdruck im Gespräch mit dem Verkäufer getippt. Rechte-Matrix → [`spec.md`](../../spec.md) Abschnitt 4.1.

**„Weiter"-Button** → Verkäufer wird sofort in der DB angelegt → Wechsel zu Schritt 2.

Das Sofort-Anlegen ist nötig, weil Schritt 2 eine Verkäufer-ID braucht, um Artikel zuzuordnen; ein Zwischenspeichern im Frontend wäre eine zweite Wahrheit.

**Abbrechen im Wizard** entfernt den gerade angelegten Verkäufer wieder — solange er keine Artikel hat, also genau unter der Bedingung, die [Epic_Verkaeufer](../Epic_Verkaeufer/epic.md) fürs Löschen ohnehin setzt. Das ist die **einzige Ausnahme** von „Löschen ist Admin-Sache": Kassenpersonal muss die eigene Fehleingabe zurücknehmen können, und es gilt nur für den Verkäufer, den dieselbe Sitzung angelegt hat. Ohne diesen Weg bliebe nach jedem Abbruch ein leerer Verkäufer in der Liste und verfälschte `sellerCount` und Statistik.

**Verhältnis zur Artikel-Freigabe:** Beim Buchen in Schritt 2 setzt das System `releasedAt` gleichzeitig mit `acceptedAt` ([`entities/artikel.md`](../../entities/artikel.md)) — hier aufgenommene Artikel sind sofort im Verkauf. Der Freigabe-Scan in [Epic_Verkaeufer](../Epic_Verkaeufer/epic.md) Abschnitt 6 betrifft ausschließlich die **vorangemeldeten** Artikel aus dem JSON-Import, die noch abgegeben werden müssen.

---

### Schritt 2 — Artikelannahme

**Layout:** `7fr 3fr` (70 % Artikel-Eingabe | 30 % Übersicht), gap 14 px.

#### Artikeleingabe (links)

2-Spalten-Grid. Felder und Reihenfolge:

| Zeile | Links | Rechts | Pflicht |
|---|---|---|---|
| 1 | Artikelnummer ([InputGroup](../../../../components/input-group/component.md), kein Addon, `modes = ['keyboard', 'camera', 'numpad']`; Kamera inline an der Position des Feldes über [Barcode-Scanner](../../../../components/barcode-scanner/component.md), kehrt nach einem Treffer in den vorherigen Modus zurück) | *(leer)* | ✅ |
| 2 | Bezeichnung (volle Breite) | — | ✅ |
| 3 | Kategorie (AutoComplete ▾/+) | Marke (AutoComplete ▾/+) | ✅ |

→ Komponente für Kategorie und Marke: [AutoComplete-Create](../../../../components/autocomplete-create/component.md)
| 4 | Preis (InputGroup, €-Addon rechts, `modes = ['keyboard', 'numpad']`, Numpad mit `showDecimal="true"`) | *(leer)* | ✅ |
| 5 | Größe | Farbe | ❌ |
| 6 | Beschreibung (Textarea, volle Breite) | — | ❌ |

Pflichtfelder mit `*` markiert. **„Übernehmen"-Button** deaktiviert solange Pflichtfelder leer.

**Sonderfall importierter Verkäufer:** Artikelnummer + ENTER → vorhandener Artikel aus Import-Liste wird geladen und Felder vorausgefüllt. Alle Felder bleiben bearbeitbar. Abgrenzung zum Freigabe-Scan → Abschnitt 5.

**Sonderfall neue Nummer:** Artikelnummer wird auf **systemweite Eindeutigkeit** geprüft (Abschnitt 3).

Nach Pflichtfelder-Ausfüllung: Klick **„Übernehmen"** → Artikel erscheint in der Übersicht rechts; Felder leeren sich; Fokus zurück auf Artikelnummer.

#### Übersicht (rechts)

1. **Artikelliste** — alle in dieser Sitzung erfassten Artikel (Nr. + Bezeichnung)
   - Klick auf Eintrag → Popup: Bezeichnung, Kategorie, Marke, Preis änderbar
   - Löschen-Button pro Eintrag (keine DB-Auswirkung — Artikel noch nicht gespeichert)
   - Artikel sind noch **nicht in der DB** gespeichert

2. **Gebühr** — `Anzahl Artikel × Verkäufer.feePerItem` (eigenes Feld des Verkäufers, siehe Abschnitt 4)

3. **Speichern-Button** (volle Breite, `p-button severity="success"`) → Popup erscheint:
   → Komponente: [Payment-Panel](../../../../components/payment-panel/component.md) — `totalLabel="Gesamtgebühr"` · `confirmLabel="Buchen"`
   - **Gesamtgebühr**
   - Eingabefeld: „Betrag erhalten (€)" — Dezimalzahl, InputGroup mit €-Addon
   - Anzeige: **Rückgeld** (live berechnet)
   - Klick **„Buchen"** löst **einen** Request aus (`POST /api/intake`, Abschnitt 7), der in einer Transaktion:
     - alle Artikel aus der Liste anlegt bzw. aktualisiert
     - an jedem `acceptedAt` und `releasedAt = jetzt` setzt → sofort im Verkauf
     - die Annahmegebühr auf `intakeFeePaid` des Verkäufers addiert (Abschnitt 4)
   - Erst **nach** der Antwort startet der **Druckdialog** automatisch: der Abgabe-Beleg mit QR-Code, den Artikeln **dieses Vorgangs** und dem gezahlten Gebührenbetrag ([Epic_Druckfunktionen](../Epic_Druckfunktionen/epic.md) Abschnitt 1)

---

## 3. Artikelnummern — Herkunft und Eindeutigkeit

**Diese App vergibt keine Nummern, sie prüft sie.** Die Nummer steht auf dem Etikett, das der Verkäufer mitbringt; Kassenpersonal tippt oder scannt sie. Systemweite Eindeutigkeit: Keine zwei Artikel dürfen dieselbe Nummer haben, unabhängig von Verkäufer und Herkunft.

**Für Verkäufer ohne Voranmeldung** schlägt das System die **nächste freie Nummer oberhalb des höchsten vergebenen Werts** im Feld vor — überschreibbar. So läuft ein Laufkunde nicht in einen Nummernbereich hinein, der einem vorangemeldeten Verkäufer gehört.

Ein Nummernblock-System wie in der Voranmelde-App gibt es hier bewusst **nicht**: Blöcke lösen ein Problem der Voranmeldephase, in der jeder Verkäufer zuhause erfasst und dafür einen eigenen Bereich braucht. Am Annahmetisch vergibt eine Person die Nummern und sieht ein Duplikat sofort.

---

## 4. Annahmegebühr

Die Gebühr entsteht **pro abgegebenem Artikel** — `feePerItem` ist genau so definiert ([`entities/verkaeufer-typ.md`](../../entities/verkaeufer-typ.md)). Abgegeben wird im Moment der **Freigabe**, nicht beim Tippen.

Daraus folgt: Das Payment-Panel gehört an den Abschluss **beider** Wege — an das Buchen hier **und** an den Freigabe-Scan in [Epic_Verkaeufer](../Epic_Verkaeufer/epic.md) Abschnitt 6, dort über die Anzahl der in dieser Sitzung freigegebenen Artikel. Ohne das wäre ein vorangemeldeter Verkäufer mit 40 Artikeln gebührenfrei, während der Laufkunde mit 12 Artikeln zahlt.

**Was gespeichert wird:** Der berechnete Gebührenbetrag wird auf `intakeFeePaid` am Verkäufer addiert (Feld → [`entities/verkaeufer.md`](../../entities/verkaeufer.md)). „Betrag erhalten" und „Rückgeld" bleiben reine Rechenhilfe für den Moment am Tisch und werden **nicht** gespeichert.

Grund für das Feld: Ohne es lässt sich am Abend nicht sagen, wie viel Gebühren-Bargeld in der Schublade liegen müsste. [Epic_Statistik](../Epic_Statistik/epic.md) weist daraus „Verdienst Gebühren" als **tatsächlich eingenommene Summe** aus, nicht als Hochrechnung.

**Die Gebühr geht nicht von der Auszahlung ab** — sie ist am Annahmetisch bereits bezahlt. Das Abrechnen-Popup in [Epic_Abrechnung](../Epic_Abrechnung/epic.md) zieht darum nur die Provision ab.

---

## 5. Zwei Wege für vorangemeldete Artikel

Vorangemeldete Artikel (`releasedAt` leer) können auf zwei Wegen freigegeben werden. Beide bleiben, mit klarer Rollenteilung:

| Weg | Wofür |
|---|---|
| **Freigabe-Scan** ([Epic_Verkaeufer](../Epic_Verkaeufer/epic.md) Abschnitt 6) | Der **Massenweg**: Kiste auf den Tisch, alles durchscannen, nichts ändern |
| **Artikelannahme** (dieses Epic, Sonderfall importierter Verkäufer) | Der **Einzelweg mit Korrektur**: wenn an einem vorangemeldeten Artikel noch etwas geändert werden muss — Preis heruntergesetzt, Kategorie falsch |

Ohne diese Abgrenzung erfinden zwei Teams zwei Verfahren für denselben Vorgang.

---

## 6. Visual Specs

**Such-Ansicht:** InputGroup in Standard-Card, max-width 500 px.

**Wizard-Layout (Schritt 2):**
- Outer-Grid: `7fr 3fr`, gap 14 px
- Rechte Seite: Artikelliste-Card + Speichern-Button (full-width, success)

**Preis-InputGroup:**
```
[ Preis                        ][ € ]
```

---

## 7. Backend & API

API-Details → [`api/intake.md`](../../api/intake.md), [`api/sellers.md`](../../api/sellers.md), [`api/articles.md`](../../api/articles.md)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/sellers/search?q=` | `authenticated` | Verkäufer-Suche über ID, Vor- und Nachname (Abschnitt 1) — schmale Treffer ohne Aggregate |
| `POST /api/sellers` | `authenticated` | Verkäufer aus Wizard-Schritt 1; `sellerTypeId` Pflicht |
| `DELETE /api/sellers/{id}` | `authenticated` | Abbrechen im Wizard — greift nur, solange der Verkäufer keine Artikel hat |
| `GET /api/articles/by-number/{number}` | `authenticated` | Nummernprüfung: `404` heißt „Nummer frei", `200` heißt „bereits vergeben" |
| `GET /api/articles/next-number` | `authenticated` | Nächste freie Nummer über dem höchsten vergebenen Wert (Vorschlag für Laufkunden) |
| `POST /api/intake` | `authenticated` | **Ein atomarer Vorgang:** Verkäufer-ID + komplette Artikelliste + Gebührenbetrag |

Die Nummernprüfung nutzt denselben Endpoint wie die Artikel-Erkennung an der Kasse — zwei Lesarten einer Antwort statt zweier Endpoints, die dieselbe Zeile suchen. Verbindlich entschieden wird die Eindeutigkeit erst in der Transaktion: Zwei Annahmeplätze können dieselbe freie Nummer gleichzeitig gesehen haben.

**`POST /api/intake` läuft in einer Transaktion.** Entweder alle Artikel sind gebucht, alle Zeitstempel gesetzt und `intakeFeePaid` erhöht — oder nichts davon. Kein Endpoint pro Artikel: Bricht eine Schleife aus N Einzel-Requests in der Mitte ab, sind drei Artikel gebucht und vier nicht, während der Verkäufer bereits bezahlt hat und geht.

## Akzeptanzkriterien

1. **AC-1** — WHEN das Suchfeld leer ist, THEN SHALL das System alle Verkäufer in der Trefferliste anzeigen.
2. **AC-2** — WHEN exakt ein Treffer übrig bleibt und der Nutzer Enter drückt, THEN SHALL das System den Wizard-Schritt 2 (Artikelannahme) direkt öffnen.
3. **AC-3** — IF die Verkäufer-Suche keinen Treffer liefert, THEN SHALL das System einen Button „+ Neuen Verkäufer anlegen" einblenden.
4. **AC-4** — WHEN „Weiter" geklickt wird und alle Pflichtfelder (Vorname, Nachname) ausgefüllt sind, THEN SHALL das System den neuen Verkäufer anlegen und Wizard-Schritt 2 öffnen.
5. **AC-5** — WHILE mindestens ein Pflichtfeld (Artikelnummer, Bezeichnung, Kategorie, Marke, Preis) leer ist, SHALL das System den „Übernehmen"-Button deaktiviert halten.
6. **AC-6** — IF eine Artikelnummer eingegeben wird, die bereits einem vorhandenen Artikel zugewiesen ist, THEN SHALL das System die Fehlermeldung „Artikelnummer bereits vergeben" anzeigen und „Übernehmen" deaktivieren.
7. **AC-7** — WHEN „Buchen" geklickt wird, THEN SHALL das System alle Sitzungs-Artikel in **einem** Request mit `acceptedAt` und `releasedAt = jetzt` speichern und erst nach erfolgreicher Antwort den Druckdialog starten.
8. **AC-8** — IF das Buchen fehlschlägt, THEN SHALL das System **keinen** Artikel gespeichert haben, `intakeFeePaid` unverändert lassen, keinen Druck starten und die Sitzungsliste unverändert erhalten, sodass erneut gebucht werden kann.
9. **AC-9** — WHEN gebucht wird, THEN SHALL das System die berechnete Annahmegebühr auf `intakeFeePaid` des Verkäufers addieren; „Betrag erhalten" und „Rückgeld" SHALL nicht gespeichert werden.
10. **AC-10** — WHEN ein Verkäufer ohne Voranmeldung angelegt wurde und das Artikelnummer-Feld leer ist, THEN SHALL das System die nächste freie Nummer über dem höchsten vergebenen Wert vorschlagen, ohne die Eingabe zu erzwingen.
11. **AC-11** — WHEN der Wizard nach Schritt 1 abgebrochen wird und der gerade angelegte Verkäufer keine Artikel hat, THEN SHALL das System diesen Verkäufer wieder entfernen — auch mit der Rolle Kassenpersonal.
12. **AC-12** — WHEN ein abgerechneter Verkäufer in der Trefferliste ausgewählt wird, THEN SHALL das System den Wizard **nicht** öffnen und den Hinweis anzeigen, dass ein Admin die Abrechnung stornieren muss; der Verkäufer SHALL in der Liste mit dem Badge „Abgerechnet" sichtbar bleiben.

## Stories

- [ANNAHME-S01 — Inline-Kamera-Scanner mit Countdown-Feedback](stories/ANNAHME-S01-inline-camera-mode.md)
- [ANNAHME-S02 — Verkäufer-Formular im Wizard Schritt 1 (Panel 01–03)](stories/ANNAHME-S02-seller-form-layout.md)

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #artikelannahme #wizard #verkäufer #barcode-scanner #freigabe
