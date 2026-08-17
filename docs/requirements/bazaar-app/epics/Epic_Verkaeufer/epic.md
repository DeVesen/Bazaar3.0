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

**„+ Neu"-Button** befindet sich ausschließlich im Seitentitel (Page-Header) — nicht in der Filter-Toolbar.

**Status-Dropdown:** Alle · Offen · Im Verkauf · Abgerechnet

**Sortierung-Dropdown:**

| Option | Sortierkriterium |
|---|---|
| Name (Standard) | Nachname + Vorname alphabetisch |
| Angenom. Warenwert | Summe aller angenommenen Artikel, absteigend |
| Offener Warenwert | Summe der noch im Verkauf befindlichen Artikel, absteigend |
| Umsatz | Summe der verkauften Artikel, absteigend |

**Aktive Filter** werden als `p-chip`-Tags unterhalb des Filter-Panels angezeigt (mit × zum Entfernen).

**Suche, Filter, Sortierung und Paginierung laufen serverseitig** — das Frontend hält nur die aktuelle Seite. **60 Karten pro Seite** (`p-paginator` unter dem Grid).

Grund: Jede Karte trägt sieben Aggregate, und sortiert wird nach Summen, die nur der Server kennt. Paginierung statt endlosem Scrollen, weil am Annahmetisch gesucht und nicht gestöbert wird — wer scrollt, hat die Suche nicht benutzt. 60 deckt etwa drei Bildschirmhöhen ab und bleibt auf einem Tablet flüssig.

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

**Löschen ist nur möglich, solange der Verkäufer keine Artikel hat.** Andernfalls `409` mit der Anzahl der Artikel. Ein Verkäufer mit verkauften Artikeln hängt an Kassenvorgängen; ihn zu entfernen würde Umsätze verwaisen lassen. Für den häufigsten Anlass — eine am Annahmetisch versehentlich doppelt angelegte Person — reicht die Regel, weil die Dublette in der Regel leer ist.

**Zwei Verkäufer zusammenführen ist ausdrücklich nicht Teil des MVP.**

Das ist strenger als der JSON-Import, der einen existierenden Verkäufer samt Artikeln ersetzt ([Epic_Einstellungen](../Epic_Einstellungen/epic.md)). Der Unterschied ist gewollt: Der Import ersetzt einen Verkäufer durch **denselben** Verkäufer in neuerem Stand (gleiche ID aus der Voranmelde-App), es verschwindet nichts, was nicht sofort wieder entsteht. Manuelles Löschen entfernt ihn dauerhaft.

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

### Eingabe-Modus

Eingabefeld (Artikelnummer) + AutoComplete-Liste darunter.

**Gescannt wird gesammelt, geschrieben wird am Ende.** Der Dialog liest während des Scannens nur und merkt sich die Treffer — wie der Warenkorb an der Kasse. Erst der Abschluss über das Payment-Panel schickt einen Request (`POST /api/release`, siehe Abschnitt 7). Würde jeder Scan sofort schreiben, hinterließe ein Abbruch nach 30 Scans 30 freigegebene Artikel **ohne** kassierte Gebühr.

| Zustand | Verhalten |
|---|---|
| (leer) | Liste zeigt alle noch **nicht freigegebenen** Artikel dieses Verkäufers (`releasedAt = null`), die in dieser Sitzung bereits erfassten markiert |
| Eingabe | Filtert die Liste nach Artikelnummer |
| Genau 1 Treffer + ENTER | Artikel wird in die Sitzungsliste übernommen; Eingabefeld leert sich; Liste zeigt wieder alle ausstehenden |
| Kein Treffer | Liste verschwindet; Text: *„Artikel nicht bekannt"* |
| Alle freigegeben | Nur Text: *„Alle Artikel freigegeben"* |

Neben dem Eingabefeld: **BC-Button** → wechselt in Kamera-Modus (Inline-Modus).

### Kamera-Modus (Inline)

Kamerabild ersetzt Eingabefeld + Liste.

Nach erfolgreichem Scan:

| Ergebnis | Farbe | Dauer |
|---|---|---|
| Erfolgreich freigegeben | 🟢 Grün | `scannerPauseMs`, Default 3 000 ms |
| Bereits freigegeben | 🟡 Gelb | `scannerPauseMs` |
| Nicht bekannt | 🔴 Rot | `scannerPauseMs` |

Die Dauer kommt aus dem Einstellungs-Parameter `scannerPauseMs` ([`spec.md`](../../spec.md) Abschnitt 8), nicht aus einer Konstante. Fünf Sekunden Zwangspause je Scan summieren sich bei 300 Artikeln auf 25 Minuten Warten.

Nach Ablauf der Anzeigezeit → Kamerabild wieder aktiv.

**Abbrechen-Button** → zurück in Eingabe-Modus.

**Feedback:** Ton (Web Audio API) + Vibration (`Navigator.vibrate()`).

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
| `DELETE /api/sellers/{id}` | `authenticated` | `409` falls der Verkäufer noch Artikel hat — die Datenbedingung trägt die Sicherheit, nicht die Rolle |
| `GET /api/sellers/{id}/articles` | `authenticated` | Artikelliste für das Detail-Modal (Abschnitt 5) |
| `POST /api/release` | `authenticated` | Abschluss der Freigabe-Sitzung: `releasedAt` an N Artikeln + Gebühr, in einer Transaktion (Abschnitt 6) |
| `DELETE /api/sellers/{id}/settlement` | `admin` | Setzt `settledAt` **und** `payoutAmount` zurück |

Kein `IQueryable` über die Portgrenze, ein Repository pro Aggregate — die Aggregat-Abfrage ist ein Query-Port, kein erweitertes Repository.

**`DELETE` ist `authenticated`, nicht `admin`:** Löschbar ist nur ein Verkäufer **ohne Artikel** — also eine gerade entstandene Fehleingabe oder ein Laufkunde, der nie abgegeben hat. Importierte Verkäufer haben immer Artikel. Ein Sonderrecht für den Admin würde nichts zusätzlich schützen, aber Kassenpersonal daran hindern, die eigene Fehleingabe zurückzunehmen.

## Akzeptanzkriterien

1. **AC-1** — WHEN der Nutzer Text in das Suchfeld eingibt, THEN SHALL das System nach 300 ms Debounce die Verkäuferliste serverseitig filtern — case-insensitiv, Teilwort an beliebiger Stelle, Eingabe an Leerzeichen zerlegt (Regeln → [`api/cross-cutting.md`](../../api/cross-cutting.md) Abschnitt „Pagination, Suche und Sortierung").
2. **AC-2** — WHEN „+ Neu" geklickt wird, THEN SHALL das System ein Popup mit leeren Pflichtfeldern (Vorname, Nachname) öffnen; der Verkäufer-Typ SHALL mit dem am häufigsten zugewiesenen Typ vorbelegt sein.
3. **AC-3** — WHEN ein neuer Verkäufer gespeichert wird, THEN SHALL das System ihn in der Datenbank anlegen und in der Liste anzeigen.
4. **AC-4** — WHEN „Edit" bei einem Verkäufer geklickt wird, THEN SHALL das System das Popup mit den vorausgefüllten Verkäuferdaten öffnen.
5. **AC-5** — WHEN auf eine Verkäufer-Karte geklickt wird (nicht auf Edit oder Scanner), THEN SHALL das System das Detail-Modal mit der Verkäufernummer im Klartext, demselben Wert als QR-Code (Shared-Component [`qr-code`](../../../../components/qr-code/component.md), Inhalt = Verkäufer-`id`) und der Artikelliste mit Status je Artikel anzeigen.
6. **AC-6** — IF beim Speichern ein Pflichtfeld leer ist, THEN SHALL das System eine Fehlermeldung unter dem jeweiligen Feld anzeigen und nicht speichern.
7. **AC-7** — THE SYSTEM SHALL Suche, Statusfilter, Sortierung und Paginierung serverseitig auflösen und je Seite höchstens 60 Karten liefern; die Karten-Aggregate SHALL aus einer einzigen Abfrage stammen.
8. **AC-8** — WHILE der angemeldete Nutzer die Rolle Kassenpersonal hat, SHALL das System die Konditionsfelder schreibgeschützt anzeigen, den Löschen-Button im Bearbeiten-Dialog nicht rendern und den Löschen-Button im Abrechnungs-Popup nicht rendern; entsprechende Requests SHALL mit `403` abgelehnt werden.
9. **AC-9** — IF ein Verkäufer gelöscht werden soll, der noch Artikel hat, THEN SHALL das System die Löschung mit `409` ablehnen und die Anzahl der Artikel nennen.
10. **AC-10** — WHEN der Löschen-Button im Abrechnungs-Popup geklickt wird, THEN SHALL das System einen Bestätigungsdialog mit dem Text „Auszahlung vom ‹Zeitstempel› wird verworfen" anzeigen und `settledAt` erst nach Bestätigung zurücksetzen.
11. **AC-11** — WHEN der Freigeben-Dialog geöffnet wird, THEN SHALL das System ausschließlich Artikel mit leerem `releasedAt` listen; am Tisch aufgenommene Artikel SHALL dort nicht erscheinen.

## Stories

- [VERK-S01 — Verkäufer-Formular im Bearbeiten-Dialog (Panel 01–03)](stories/VERK-S01-seller-edit-form-layout.md)

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #verkäufer #stammdaten #qr-code #crud #haupt-app
