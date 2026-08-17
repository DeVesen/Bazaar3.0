---
id: F-BA-010
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Einstellungen

## Index
- Überblick — Admin-Einstellungen
- 1. Systemparameter — Parameter & Defaults
- 2. JSON-Import — Voranmelde-Import
- 3. Benutzerverwaltung — Konten & Rollen
- 4. Backend & API — Endpoints
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** System → Einstellungen
**Route:** `/settings`
**Sichtbar für:** Admin (`adminGuard`)

**Ziel:** Admin konfiguriert Systemparameter und importiert Daten aus der Voranmelde-App.

**User Story:** Als Admin möchte ich Systemparameter festlegen und eine JSON-Exportdatei der Voranmelde-App importieren, damit die Haupt-App zum Basar-Tag mit aktuellen Daten einsatzbereit ist.

---

## Überblick

Admin-Seite für systemweite Parameter und den JSON-Import aus der Voranmelde-App. Der Import ist in der Einstellungen-Seite integriert — kein separater Menüpunkt.

---

## 1. Systemparameter

| Parameter | Beschreibung | Default |
|---|---|---|
| `scannerPauseMs` | Anzeigedauer des Scan-Ergebnisses im Inline-Kamera-Modus | 3 000 ms |

Entity-Details → [`entities/einstellungen.md`](../../entities/einstellungen.md)

**Serverseitig gespeichert**, nicht im `localStorage`: Der Wert beschreibt eine Einstellung des Basars, nicht eine Vorliebe eines Geräts. Gerätelokal abgelegt würde der Admin ihn an seinem Rechner setzen, während die drei Kassen-Tablets ihren Default behalten — „systemweit" wäre dann eine Behauptung. Das Frontend liest die Parameter beim Start und hält sie im Speicher; der `localStorage` bleibt dem JWT vorbehalten, dort gehört Gerätezustand hin.

**`suchDebounceMs` gibt es hier nicht.** Eine Debounce-Zeit für Suchfelder ist eine Frontend-Tuning-Konstante ohne fachlichen Anlass und steht fest im Code. Die Voranmelde-App hat denselben Parameter aus demselben Grund aus ihren Einstellungen entfernt — zwei Antworten auf dieselbe Frage wären eine Doppelung auf Suite-Ebene. Nebenbei verstieß der Name gegen die Sprachregel ([`spec.md`](../../spec.md) Abschnitt 7.0.1: englische Feldnamen).

`scannerPauseMs` bleibt konfigurierbar, weil er am Basar-Tag je nach Personal und Scanner-Qualität wirklich verstellt wird.

---

## 2. JSON-Import (aus Voranmelde-App)

### Ablauf

1. Admin wählt JSON-ASCII-Datei über einen **Datei-Picker** (`p-fileupload mode="basic"`)
2. **Import-Vorschau erscheint sofort nach Dateiauswahl** (ohne zusätzlichen Bestätigungs-Klick):
   - Anzahl Verkäufer / Artikel
   - Welche werden ersetzt / neu angelegt
   - **Unbekannte Verkäufer-Typen** mit Anzahl betroffener Verkäufer und je einer Auswahl zur Zuordnung auf einen existierenden Typ
3. Admin bestätigt den Import explizit per Button
4. **Fortschrittsanzeige** (`p-progressbar`) während des Imports
5. Toast-Benachrichtigung: „✓ Import erfolgreich"

### Import-Inhalt

Der Import verarbeitet, was in der Datei steht. **Welche** Verkäufer überhaupt enthalten sind, entscheidet der Export-Dialog der Voranmelde-App (dort: nur Verkäufer mit mindestens einem Artikel) — diese Regel wird hier bewusst nur verlinkt und nicht wiederholt, sonst driftet sie zwischen den beiden Apps auseinander. Schema → [`entities/import-format.md`](../../entities/import-format.md).

### Contract-Sprache

Das Schema der Datei steht verbindlich in
[`entities/import-format.md`](../../entities/import-format.md). Die Feldnamen sind
**englisch** (`firstName`, `lastName`, `postalCode`, `sellerType`, `number`, `name`,
`brand`, `category`, `price`, …); der Import mappt **keine** Feldnamen um — ein
abweichendes Import-Vokabular wäre eine zweite Quelle für dasselbe Schema.

Verbindlich ist [`entities/`](../../entities/overview.md).

### Auflösung der Verkäufer-Typen

Die Import-Datei liefert `sellerType` als **Namen**. Existiert der Name in dieser App nicht, bricht der Import **nicht** ab und legt auch **nichts** automatisch an — die Vorschau verlangt vom Admin für jeden unbekannten Namen eine Zuordnung auf einen existierenden Typ. Erst danach ist „Import bestätigen" möglich.

Kein automatisches Anlegen, weil ein Typ Provision und Gebühr trägt, die der Import nicht erfinden kann; ein Typ mit 0 % Provision wäre ein stiller Geldverlust. Regel und Begründung → [Epic_Verkaeufer_Typen](../Epic_Verkaeufer_Typen/epic.md) Abschnitt 4.

### Upsert-Logik

1. Existiert ein Verkäufer (anhand der **Verkäufer-ID** aus Voranmelde-App) bereits → Verkäufer **inkl. aller seiner Artikel vollständig löschen**
2. Danach: Verkäufer + Artikel aus der Import-Datei neu anlegen

**Ausnahme — bereits verkauft oder abgerechnet:** Hat ein betroffener Verkäufer Artikel mit gesetztem `soldAt`, oder ist er selbst abgerechnet (`settledAt` gesetzt), wird er **nicht** ersetzt, sondern übersprungen; die Vorschau nennt ihn. Sonst würde ein zweiter Import am Basar-Tag Kassenumsätze löschen.

Dass der Import einen Verkäufer samt Artikeln ersetzt, während das manuelle Löschen in [Epic_Verkaeufer](../Epic_Verkaeufer/epic.md) bei vorhandenen Artikeln mit `409` abbricht, ist gewollt: Der Import setzt **denselben** Verkäufer in neuerem Stand ein (gleiche ID aus der Voranmelde-App), manuelles Löschen entfernt ihn dauerhaft.

Die **Verkäufer-ID** aus der Voranmelde-App wird 1:1 übernommen.

Artikel, die **manuell** in der Haupt-App angelegt wurden (ohne Import-Bezug), bleiben unberührt.

### Stammdaten mitimportieren

**Zwei Checkboxen in der Import-Vorschau**, beide standardmäßig **aktiv**, jeweils mit der Anzahl in Klammern:

```
☑ Marken übernehmen (23 neu)
☑ Kategorien übernehmen (5 neu)
```

Vorausgewählt, weil Stammdaten mitzunehmen der Normalfall ist: Ohne sie tragen importierte Artikel Marken, die in der Marken-Verwaltung fehlen. Abwählbar, weil beim zweiten Import am selben Tag meist nur die Verkäufer aktualisiert werden sollen und nicht erneut über Stammdaten geredet wird.

Importierte Marken und Kategorien erhalten `original = true` — sie sind kuratierte Stammdaten, keine Neuanlage am Annahmetisch ([Epic_Marken](../Epic_Marken/epic.md) Abschnitt 3).

---

## 3. Benutzerverwaltung

Nur für Admins erreichbar (Rechte-Matrix → [`spec.md`](../../spec.md) Abschnitt 4.1). Konzept, Token-Handling und Seed-Admin stehen in [Epic_Login](../Epic_Login/epic.md) — hier lebt nur die Oberfläche: eine Tabelle und ein Formular. Ein eigenes Epic wäre dafür überdimensioniert.

**Tabelle:** Benutzername, Rolle, Status „Passwortwechsel offen".

| Aktion | Verhalten |
|---|---|
| Benutzer anlegen | Benutzername, Rolle (Admin / Kassenpersonal), Initialpasswort — Zwangswechsel beim ersten Login |
| Rolle ändern | wirkt beim nächsten Login des Benutzers (das laufende Token behält seinen `role`-Claim) |
| Passwort zurücksetzen | Admin setzt neues Passwort direkt, Zwangswechsel beim nächsten Login — es gibt keinen Self-Service-Reset, da kein Mailserver im LAN existiert |
| Benutzer löschen | der letzte verbleibende Admin ist nicht löschbar |

**Verkäufer sind keine Benutzer.** Der JSON-Import legt Verkäuferdatensätze an, keine Konten — die Benutzerverwaltung und der Import haben keinen Berührungspunkt.

Entity-Details → [`entities/benutzer.md`](../../entities/benutzer.md)

---

## 4. Backend & API

API-Details → [`api/settings.md`](../../api/settings.md), [`api/users.md`](../../api/users.md), [`api/import.md`](../../api/import.md)

Alle Endpoints dieser Seite verlangen die Rolle **`admin`** — mit **einer Ausnahme**: `GET /api/settings` ist `authenticated`. `scannerPauseMs` steuert den Kamera-Modus am Annahmetisch (ANNAHME-S01 AC-9); mit Admin-only-Lesen könnte die App des Kassenpersonals den Wert nicht laden und müsste auf einen hartkodierten Default zurückfallen. Geändert werden darf er weiterhin nur vom Admin, und die Seite selbst bleibt über `adminGuard` geschützt.

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/settings` | `authenticated` | Systemparameter lesen |
| `PUT /api/settings` | `admin` | Systemparameter schreiben |
| `POST /api/import/preview` | `admin` | Datei hochladen, **nichts schreiben**, Vorschau zurückgeben |
| `POST /api/import` | `admin` | Datei plus Typ-Zuordnungen und Stammdaten-Auswahl — **eine Transaktion** |
| `GET /api/users` | `admin` | Benutzerliste |
| `POST /api/users` | `admin` | Benutzer anlegen |
| `PUT /api/users/{id}` | `admin` | Rolle ändern oder Passwort zurücksetzen |
| `DELETE /api/users/{id}` | `admin` | Benutzer löschen; `409` beim letzten Admin |

**Die Datei wird zweimal übertragen**, für Vorschau und Import getrennt. Ein serverseitiger Zwischenspeicher bräuchte Lebensdauer, Aufräumjob und eine Kennung — bei wenigen hundert Kilobyte ist der zweite Upload billiger als dieser Apparat.

**`POST /api/import` läuft in einer Transaktion.** Entweder alle Verkäufer, Artikel und ausgewählten Stammdaten sind übernommen oder keiner davon. Ein halb durchgelaufener Import wäre am Basar-Morgen der schlechteste denkbare Zustand: halbe Verkäufer, halbe Artikel und kein sauberer Ausgangspunkt, von dem aus man es erneut versuchen könnte.

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL geänderte Systemparameter serverseitig persistieren und beim App-Start von dort laden, sodass sie auf allen Geräten gelten; eine Ablage im `localStorage` SHALL **nicht** erfolgen.
2. **AC-2** — WHEN eine JSON-Datei ausgewählt wird, THEN SHALL das System sofort eine Import-Vorschau mit Anzahl Verkäufer und Artikel sowie deren Anlage-/Ersetz-Status anzeigen, ohne zusätzlichen Bestätigungs-Klick.
3. **AC-3** — WHEN „Import bestätigen" geklickt wird, THEN SHALL das System eine Fortschrittsanzeige (p-progressbar) einblenden und nach Abschluss eine Toast-Benachrichtigung „✓ Import erfolgreich" zeigen.
4. **AC-4** — WHEN ein importierter Verkäufer bereits in der Datenbank existiert (anhand Verkäufer-ID), THEN SHALL das System diesen Verkäufer samt allen seinen Artikeln vollständig löschen und anschließend den Verkäufer und seine Artikel aus der Import-Datei neu anlegen.
5. **AC-5** — THE SYSTEM SHALL Artikel, die manuell in der Haupt-App angelegt wurden (ohne Import-Bezug), beim Upsert-Import unberührt lassen.
6. **AC-6** — THE SYSTEM SHALL die Benutzerverwaltung ausschließlich für die Rolle Admin erreichbar machen; ein Request mit der Rolle Kassenpersonal SHALL mit `403` abgelehnt werden.
7. **AC-7** — WHEN ein Admin einen Benutzer anlegt oder dessen Passwort zurücksetzt, THEN SHALL das System für diesen Benutzer den Zwangswechsel beim nächsten Login setzen.
8. **AC-8** — IF versucht wird, das letzte verbleibende Admin-Konto zu löschen, THEN SHALL das System die Löschung mit `409` ablehnen.
9. **AC-9** — IF die Import-Datei Verkäufer-Typen enthält, deren Name in dieser App nicht existiert, THEN SHALL das System sie in der Vorschau mit der Anzahl betroffener Verkäufer auflisten, je Name eine Zuordnung auf einen existierenden Typ verlangen und „Import bestätigen" bis dahin deaktiviert lassen.
10. **AC-10** — THE SYSTEM SHALL beim Import keinen Verkäufer-Typ automatisch anlegen und keinen unbekannten Namen stillschweigend durch einen Standardtyp ersetzen.
11. **AC-11** — IF ein zu ersetzender Verkäufer Artikel mit gesetztem `soldAt` hat oder selbst `settledAt` gesetzt hat, THEN SHALL das System ihn beim Import überspringen, seine Daten unverändert lassen und ihn in der Vorschau als übersprungen ausweisen.
12. **AC-12** — THE SYSTEM SHALL die Import-Vorschau ohne jede Schreiboperation erzeugen; erst „Import bestätigen" SHALL Daten verändern.
13. **AC-13** — THE SYSTEM SHALL den Import in einer Transaktion ausführen; IF er fehlschlägt, THEN SHALL kein Verkäufer, kein Artikel und kein Stammdatum übernommen sein.
14. **AC-14** — THE SYSTEM SHALL in der Vorschau je eine standardmäßig aktive Auswahl für Marken und Kategorien mit der Anzahl neuer Einträge anzeigen; abgewählte Stammdaten SHALL nicht importiert werden.
15. **AC-15** — WHEN Marken oder Kategorien importiert werden, THEN SHALL das System sie mit `original = true` anlegen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #einstellungen #json-import #konfiguration #upsert #localstorage #benutzerverwaltung #rollen
