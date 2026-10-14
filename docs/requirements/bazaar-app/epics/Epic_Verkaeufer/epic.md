---
id: F-BA-005
code: VERK
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Verkäufer

## Index
- Überblick — Karten-Ansicht
- 1. Filter-Panel — Filteroptionen
- 2. Status-Definition — Statuslogik
- 3. Verkäufer-Karte — Kartenaufbau
- 4. Verkäufer bearbeiten — Bearbeiten, Löschen
- 5. Verkäufer-Detail-Modal — Nummer, QR-Code, Artikelliste
- 6. Artikel-Freigeben-Popup — Freigabe vorangemeldeter Artikel
- 7. Backend & API — Endpoints, Query-Port
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** Stammdaten → Verkäufer
**Route:** `/sellers`
**Sichtbar für:** Admin (alles) · Kassenpersonal (anlegen und bearbeiten, kein Löschen, keine Konditionen)

Component-Details → [`seller-card`](../../components/seller-card.md) · [`seller-detail-modal`](../../components/seller-detail-modal.md) · [`verkaeufer-dialog`](../../components/verkaeufer-dialog.md) · [`filter-panel`](../../../../components/filter-panel/component.md) · [`scan-dialog`](../../../../components/scan-dialog/component.md)

**Ziel:** Admin verwaltet Verkäufer-Stammdaten der Haupt-App.

**User Story:** Als Admin möchte ich Verkäufer anlegen, suchen und bearbeiten, damit das Kassenpersonal bei der Artikelannahme korrekte Daten vorfindet.

---

## Überblick

Die Verkäufer-Seite zeigt alle Verkäufer als Karten-Grid. Von hier aus wird der Artikel-Freigeben-Prozess gestartet.

---

## 1. Filter-Panel

2-zeiliges Panel oberhalb der Karten-Liste:

| Zeile | Elemente |
|---|---|
| 1 | Freitext-Suche (Name, Ort) · Sortierung-Dropdown |
| 2 | Status-Dropdown |

**„+ Neu"-Button** sitzt im Filter-Panel ganz rechts, wie in [`filter-panel`](../../../../components/filter-panel/component.md) dokumentiert — nicht im Seitentitel.

**Status-Dropdown:** Alle · Offen · Im Verkauf · Abgerechnet

**Sortierung-Dropdown:**

| Option | Sortierkriterium |
|---|---|
| Name (Standard) | Nachname + Vorname alphabetisch |
| Angenom. Warenwert | Summe aller angenommenen Artikel, absteigend |
| Offener Warenwert | Summe der noch im Verkauf befindlichen Artikel, absteigend |
| Umsatz | Summe der verkauften Artikel, absteigend |

**Aktive Filter** werden als `p-chip`-Tags unterhalb des Filter-Panels angezeigt (mit × zum Entfernen).

**Suche, Filter, Sortierung und Paging laufen serverseitig.** Kein Paginator: Am Listenende lädt das System automatisch die nächsten **60 Karten** nach. Über 768 px scrollt nur die Kachelliste in einem eigenen Bereich (Fensterhöhe abzüglich Shell-Abstand, Page-Header und Filter), die Filterzeilen bleiben stehen; bis 768 px scrollt die Seite normal.

Grund: Jede Karte trägt sieben Aggregate, und sortiert wird nach Summen, die nur der Server kennt. 60 je Nachladen decken etwa drei Bildschirmhöhen ab und bleiben auf einem Tablet flüssig.

---

## 2. Status-Definition

| Status | Bedingung |
|---|---|
| **Offen** | Kein Artikel ist aktuell freigegeben |
| **Im Verkauf** | Mindestens ein Artikel freigegeben; noch nicht abgerechnet |
| **Abgerechnet** | `settledAt` ist gesetzt |

---

## 3. Verkäufer-Karte

**Grid:** `repeat(auto-fill, minmax(340px, 1fr))`, gap 12 px.

```
┌──────────────────────────────────────────────┐
│ [Name 700/15px]  [Typ-Badge]  [✏️] [📷]      │
│ [PLZ Ort  #ID]  ← 12px, muted, mb 8px        │
│ [Status-Badge]  ← mb 8px                      │
│ ┌──────────────────────────────────────────┐  │
│ │ Artikel gesamt: X  │ Freigegeben: X      │  │
│ │ Verkauft: X        │ Rückgegeben: X      │  │
│ └──────────────────────────────────────────┘  │
│ ┌──────────────┬───────────────┬──────────┐   │
│ │ Angenom. WW  │ Offener WW    │ Umsatz   │   │
│ └──────────────┴───────────────┴──────────┘   │
└──────────────────────────────────────────────┘
```

**Elemente:**

| Element | Stil |
|---|---|
| Karte | padding 16 px |
| Kopfzeile | flex, justify-content space-between, align-items flex-start |
| Name + Typ-Badge | nebeneinander (gap 8 px), Typ-Badge 10 px |
| Action-Buttons | flex, gap 6 px |
| Adresse + ID | 12 px, muted; `#ID` in font-weight 600 |
| Stats-Grid | 2×2 Spalten, gap row 3px / col 16px, 12.5 px; dt=muted, dd=600 |
| Footer-Grid | 3 gleichbreite Spalten; border-top 1 px, pt 10 px, mt 6 px |
| Footer-Label | 10 px, muted, uppercase |
| Footer-Wert | 700, 14 px |

**Footer-Werte:**

| Wert | Berechnung |
|---|---|
| Angenom. Warenwert | Summe aller Artikel mit `releasedAt` gesetzt |
| Offener Warenwert | Summe aller Artikel mit `releasedAt` gesetzt, `soldAt` und `returnedAt` leer |
| Umsatz | Summe aller Artikel mit `soldAt` gesetzt |

**Aktions-Buttons (top-right):**
- **Edit** (`p-button severity="secondary" [outlined]="true" size="small"`) → öffnet Verkäufer-Bearbeiten-Dialog
- **Scanner** (`p-button severity="secondary" [outlined]="true" size="small"`, Kamera-Icon) → öffnet Artikel-Freigeben-Dialog

**Status-Badge** (zeigt genau einen Badge):

| Bedingung | Badge |
|---|---|
| `settledAt` gesetzt | `Abgerechnet` (success, grün) |
| Mind. 1 Artikel freigegeben, nicht abgerechnet | `Im Verkauf` (info, blau) |
| Kein freigegebener Artikel | `Offen` (sec, grau) |

**Klick auf Status-Badge** → Popup mit Abrechnungs-Zeitstempel:
- Zeigt: „Abgerechnet am ‹Zeitstempel›" — für beide Rollen
- **Löschen-Button** zum Zurücksetzen auf NULL — **nur für Admins sichtbar**, mit Bestätigungsdialog „Auszahlung von ‹Betrag› vom ‹Zeitstempel› wird verworfen"; setzt `settledAt` und `payoutAmount` zurück; der Endpoint antwortet Kassenpersonal mit `403`
- Kein manuelles Setzen möglich

Das Zurücksetzen macht eine abgeschlossene Auszahlung wieder offen — die Rechte-Matrix führt es als „Abrechnung stornieren" (Admin-only). Ein einzelner Klick in einem Badge-Popup ist zu wenig Reibung für eine Geldbewegung, darum der Bestätigungsdialog.

**Klick auf die Karte** (nicht auf einen der Buttons) → Detail-Modal, siehe Abschnitt 5.

---

## 4. Verkäufer bearbeiten

Dialog (Standard-Größe) mit Panels 01–03 (Personendaten, Kontakt, Konditionen) — identische Feldanordnung wie Wizard Schritt 1.

Zusätzlich **Panel 05 — Sonstiges**:
- **Toggle-Schalter „Admin-Rechte"** existiert nur in der Voranmelde-App. In der Haupt-App gibt es ihn nicht — nicht weil Auth fehlte (die App hat Login und Rollen, siehe [Epic_Login](../Epic_Login/epic.md)), sondern weil **Verkäufer hier keine Benutzer sind**: Sie melden sich nie an, Konten verwaltet der Admin getrennt in [Epic_Einstellungen](../Epic_Einstellungen/epic.md).
- Kein Einladungs-Link in der Haupt-App

**Konditionen (Panel 03) — wer darf was** (Rechte-Matrix → [`spec.md`](../../spec.md) Abschnitt 4.1):

| Aktion | Admin | Kassenpersonal |
|---|---|---|
| Verkäufer anlegen, Stammdaten bearbeiten | ✅ | ✅ |
| Verkäufer-Typ wählen | ✅ | ✅ |
| `salesCommission` / `feePerItem` überschreiben | ✅ | ❌ — schreibgeschützt sichtbar |
| Verkäufer löschen | ✅ | ❌ |

**Typwechsel überschreibt die Konditionen.** Wechselt der Admin den Typ, werden `salesCommission` und `feePerItem` mit den Werten des neuen Typs überschrieben — auch manuell gesetzte. Vorher erscheint ein Bestätigungsdialog mit den konkreten alten und neuen Werten. Begründung und Regel → [Epic_Verkaeufer_Typen](../Epic_Verkaeufer_Typen/epic.md) Abschnitt 3.

**Vorbelegung beim Anlegen:** Der Typ ist mit dem am häufigsten zugewiesenen Typ vorbelegt, bleibt aber änderbar.

### Verkäufer löschen

Im Bearbeiten-Dialog, **nur für Admins**, mit Bestätigungsdialog — bewusst nicht als vierter Button auf jeder Karte, das lädt zum Verklicken ein.

**Beim Löschen werden alle Artikel des Verkäufers mitgelöscht** — auch verkaufte, und auch bei abgerechneten Verkäufern. Hat der Verkäufer Artikel, nennt der Bestätigungsdialog deren Anzahl und weist darauf hin, dass sie ebenfalls gelöscht werden.

*Entscheidung 2026-10-14:* Bewusste Abweichung von der früheren Regel „löschen nur ohne Artikel (`409`)". Grund: Der Betreiber will einen Verkäufer samt Artikeln in einem Schritt entfernen; der Bestätigungsdialog mit Artikelanzahl ist die Schutzmaßnahme.

**Zwei Verkäufer zusammenführen ist ausdrücklich nicht Teil des MVP.**

Wie beim JSON-Import ([Epic_Einstellungen](../Epic_Einstellungen/epic.md)) werden Verkäufer samt Artikeln entfernt. Anders als dort entsteht beim manuellen Löschen nichts neu: Der Verkäufer ist dauerhaft weg.

---

## 5. Verkäufer-Detail-Modal

Öffnet sich beim **Klick auf die Karte** (nicht auf Edit oder Scanner). Rein lesend, keine Aktionen.

| Bereich | Inhalt |
|---|---|
| Kopf | Name, Typ-Badge, Status-Badge |
| Verkäufernummer | `id` im Klartext **und** als QR-Code → Shared-Component [`qr-code`](../../../../components/qr-code/component.md), Inhalt = Verkäufer-`id` |
| Artikelliste | alle Artikel des Verkäufers mit Nummer, Bezeichnung, Preis und Status |

Zweck: „Welche Artikel hat dieser Verkäufer, und welche sind schon freigegeben?" ist die häufigste Frage am Annahmetisch. Der QR-Code ist derselbe Baustein, den die Voranmelde-App für die Verkäufernummer-Anzeige nutzt — eine Komponente, zwei Apps.

---

## 6. Artikel-Freigeben-Popup

→ Komponente: [Scan-Dialog](../../../../components/scan-dialog/component.md) — `targetField="releasedAt"`

Erreichbar über den **Scanner-Button** in der Verkäufer-Karte.

**Wofür dieser Dialog da ist:** Er arbeitet die **vorangemeldeten, noch nicht abgegebenen** Artikel eines Verkäufers ab — also solche mit `releasedAt = null`, Status „Registriert". Das ist der Massenvorgang am Basar-Morgen, wenn ein vorangemeldeter Verkäufer seine Kiste bringt.

Artikel, die am Tisch neu aufgenommen werden, erscheinen hier **nie**: Beim Buchen der Annahme setzt das System `releasedAt` gleichzeitig mit `acceptedAt` ([`entities/artikel.md`](../../entities/artikel.md)), sie sind also sofort freigegeben.

### Eingabemodi

Das Artikelnummer-Feld, seine drei Modi (Tastatur, Kamera, Numpad), deren Reihenfolge, Startmodus und Kamera-Freigabe entsprechen exakt dem [Scan-Dialog](../../../../components/scan-dialog/component.md) sowie [InputGroup](../../../../components/input-group/component.md) Abschnitt 3 und werden hier nicht wiederholt. Der Dauerscan mit Countdown-Feedback im Kamera-Modus ist in [ANNAHME-S01](../Epic_Artikelannahme/stories/ANNAHME-S01-inline-camera-mode.md) beschrieben.

### Sammelscan und Zustände

**Gescannt wird gesammelt, geschrieben wird am Ende.** Der Dialog liest während des Scannens nur und merkt sich die Treffer — wie der Warenkorb an der Kasse. Erst der Abschluss über das Payment-Panel schickt einen Request (`POST /api/release`, siehe Abschnitt 7). Würde jeder Scan sofort schreiben, hinterließe ein Abbruch nach 30 Scans 30 freigegebene Artikel **ohne** kassierte Gebühr. Das ist der einzige fachliche Unterschied zum generischen Scan-Dialog, der pro Treffer sofort schreibt.

| Zustand | Verhalten |
|---|---|
| (leer) | Liste zeigt alle noch **nicht freigegebenen** Artikel dieses Verkäufers (`releasedAt = null`), die in dieser Sitzung bereits erfassten markiert |
| Eingabe | Filtert die Liste nach Artikelnummer |
| Genau 1 Treffer + ENTER | Artikel wird in die Sitzungsliste übernommen; Eingabefeld leert sich; Liste zeigt wieder alle ausstehenden |
| Kein Treffer | Liste verschwindet; Text: *„Artikel nicht bekannt"* |
| Alle freigegeben | Nur Text: *„Alle Artikel freigegeben"* |

### Abschluss mit Annahmegebühr

Beim Verlassen des Dialogs erscheint — sofern in dieser Sitzung mindestens ein Artikel freigegeben wurde — dasselbe **Payment-Panel** wie beim Buchen in der Artikelannahme, berechnet über `Anzahl der freigegebenen Artikel × feePerItem`. Der Betrag wird auf `intakeFeePaid` des Verkäufers addiert.

Grund: `feePerItem` ist eine Gebühr **pro abgegebenem** Artikel, und abgegeben wird beim Freigeben. Ohne diesen Abschluss wäre ein vorangemeldeter Verkäufer mit 40 Artikeln gebührenfrei, während der Laufkunde mit 12 Artikeln zahlt. Regel und Begründung → [Epic_Artikelannahme](../Epic_Artikelannahme/epic.md) Abschnitt 4.

Der Abschluss läuft als **ein** Request: `POST /api/release` setzt `releasedAt` an allen Artikeln der Sitzung und erhöht `intakeFeePaid` in derselben Transaktion. Erst nach erfolgreicher Antwort startet **automatisch der Abgabe-Beleg** mit den freigegebenen Artikeln und dem gezahlten Gebührenbetrag — dasselbe Dokument wie nach dem Buchen in der Artikelannahme ([Epic_Druckfunktionen](../Epic_Druckfunktionen/epic.md) Abschnitt 1). Zwei Wege zum selben Vorgang dürfen nicht zu zwei verschiedenen Belegsituationen führen.

---

## 7. Backend & API

API-Details → [`api/sellers.md`](../../api/sellers.md), [`api/release.md`](../../api/release.md), [`api/settlement.md`](../../api/settlement.md)

Die Karten-Aggregate kommen über einen **eigenen Query-Port** ([`spec.md`](../../spec.md) Abschnitt 7.0.1) als fertiges Read-Model — eine Query für die ganze Seite. Würde das Frontend rechnen, müsste es alle Artikel aller Verkäufer laden; würde jede Karte einzeln nachfragen, wären es bei 200 Verkäufern 200 Requests.

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/sellers` | `authenticated` | Seite der Verkäuferliste inkl. aller Karten-Aggregate; Parameter für Suche, Status, Sortierung, Seite |
| `GET /api/sellers/search` | `authenticated` | Schmale Treffer ohne Aggregate für Such-Ansichten — die Tippsuche darf keine Summen auslösen |
| `POST /api/sellers` | `authenticated` | Legt Verkäufer an; `sellerTypeId` ist Pflicht |
| `PUT /api/sellers/{id}` | `authenticated` | Stammdaten. Mitgesendete `salesCommission`/`feePerItem` SHALL nur mit Rolle `admin` wirken, sonst `403` |
| `DELETE /api/sellers/{id}` | `authenticated` | Admin: löscht den Verkäufer samt allen seinen Artikeln. Kassenpersonal: nur ohne Artikel, sonst `409 seller.has_articles` mit der Anzahl |
| `GET /api/sellers/{id}/articles` | `authenticated` | Artikelliste für das Detail-Modal (Abschnitt 5) |
| `POST /api/release` | `authenticated` | Abschluss der Freigabe-Sitzung: `releasedAt` an N Artikeln + Gebühr, in einer Transaktion (Abschnitt 6) |
| `DELETE /api/sellers/{id}/settlement` | `admin` | Setzt `settledAt` **und** `payoutAmount` zurück |

Kein `IQueryable` über die Portgrenze, ein Repository pro Aggregate — die Aggregat-Abfrage ist ein Query-Port, kein erweitertes Repository.

**`DELETE` ist `authenticated`, die Kaskade ist Admin-Sache** (Stand 2026-10-14): Nur Admins löschen einen Verkäufer samt Artikeln. Kassenpersonal darf weiterhin einen Verkäufer **ohne Artikel** löschen — nötig, damit der Abbruch der Artikelannahme einen gerade angelegten Verkäufer wieder entfernen kann ([Epic_Artikelannahme](../Epic_Artikelannahme/epic.md) AC-11). Mit Artikeln liefert `DELETE` für Kassenpersonal `409 seller.has_articles`.

## Akzeptanzkriterien

1. **AC-1** — WHEN der Nutzer Text in das Suchfeld eingibt, THEN SHALL das System nach 300 ms Debounce die Verkäuferliste serverseitig filtern — case-insensitiv, Teilwort an beliebiger Stelle, Eingabe an Leerzeichen zerlegt (Regeln → [`api/cross-cutting.md`](../../api/cross-cutting.md) Abschnitt „Pagination, Suche und Sortierung").
2. **AC-2** — WHEN „+ Neu" geklickt wird, THEN SHALL das System ein Popup mit leeren Pflichtfeldern (Vorname, Nachname, Ort) öffnen; der Verkäufer-Typ SHALL mit dem am häufigsten zugewiesenen Typ vorbelegt sein.
3. **AC-3** — WHEN ein neuer Verkäufer gespeichert wird, THEN SHALL das System ihn in der Datenbank anlegen und in der Liste anzeigen.
4. **AC-4** — WHEN „Edit" bei einem Verkäufer geklickt wird, THEN SHALL das System das Popup mit den vorausgefüllten Verkäuferdaten öffnen.
5. **AC-5** — WHEN auf eine Verkäufer-Karte geklickt wird (nicht auf Edit oder Scanner), THEN SHALL das System das Detail-Modal mit der Verkäufernummer im Klartext, demselben Wert als QR-Code (Shared-Component [`qr-code`](../../../../components/qr-code/component.md), Inhalt = Verkäufer-`id`) und der Artikelliste mit Status je Artikel anzeigen.
6. **AC-6** — WHILE ein Pflichtfeld leer ist, SHALL das System „Speichern" deaktiviert halten und nach dem Verlassen des Feldes eine Meldung unter dem leeren Feld anzeigen.
7. **AC-7** — THE SYSTEM SHALL Suche, Statusfilter, Sortierung und Paging serverseitig auflösen und je Nachladen höchstens 60 Karten liefern; WHEN das Listenende erreicht wird und weitere Verkäufer existieren, THEN SHALL das System die nächsten 60 ohne Paginator anhängen. Die Karten-Aggregate SHALL aus einer einzigen Abfrage stammen.
8. **AC-8** — WHILE der angemeldete Nutzer die Rolle Kassenpersonal hat, SHALL das System die Konditionsfelder schreibgeschützt anzeigen, den Löschen-Button im Bearbeiten-Dialog nicht rendern und den Löschen-Button im Abrechnungs-Popup nicht rendern; entsprechende Requests SHALL mit `403` abgelehnt werden.
9. **AC-9** — IF ein Verkäufer gelöscht werden soll, der noch Artikel hat, THEN SHALL das System im Bestätigungsdialog die Anzahl der Artikel nennen und beim Bestätigen den Verkäufer samt allen seinen Artikeln löschen.
10. **AC-10** — WHEN der Löschen-Button im Abrechnungs-Popup geklickt wird, THEN SHALL das System einen Bestätigungsdialog mit dem Text „Auszahlung vom ‹Zeitstempel› wird verworfen" anzeigen und `settledAt` erst nach Bestätigung zurücksetzen.
11. **AC-11** — WHEN der Freigeben-Dialog geöffnet wird, THEN SHALL das System ausschließlich Artikel mit leerem `releasedAt` listen; am Tisch aufgenommene Artikel SHALL dort nicht erscheinen.

## Stories

- [VERK-S01 — Verkäufer-Formular im Bearbeiten-Dialog (Panel 01–03)](stories/VERK-S01-seller-edit-form-layout.md)

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #verkäufer #stammdaten #qr-code #crud #haupt-app
