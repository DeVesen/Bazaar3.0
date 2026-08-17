---
id: F-BA-010
status: draft
updated: 2026-08-17
---

# Epic: Einstellungen

## Index
- Überblick — Admin-Einstellungen
- 1. Systemparameter — Parameter & Defaults
- 2. JSON-Import — Voranmelde-Import
- 3. Benutzerverwaltung — Konten & Rollen
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** System → Einstellungen

**Ziel:** Admin konfiguriert Systemparameter und importiert Daten aus der Voranmelde-App.

**User Story:** Als Admin möchte ich Systemparameter festlegen und eine JSON-Exportdatei der Voranmelde-App importieren, damit die Haupt-App zum Basar-Tag mit aktuellen Daten einsatzbereit ist.

---

## Überblick

Admin-Seite für systemweite Parameter und den JSON-Import aus der Voranmelde-App. Der Import ist in der Einstellungen-Seite integriert — kein separater Menüpunkt.

---

## 1. Systemparameter

| Parameter | Beschreibung | Default |
|---|---|---|
| `suchDebounceMs` | Verzögerung in ms bevor Suchanfrage ausgelöst wird | 800 ms |
| `scannerPauseMs` | Anzeigedauer des Scan-Ergebnisses im Inline-Kamera-Modus | 3 000 ms |

Einstellungen werden im `localStorage` gespeichert.

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

- Nur Verkäufer **mit mindestens einem Artikel** (inkl. Admins der Voranmelde-App)
- Verkäufer ohne Artikel werden **nicht** exportiert/importiert

### Contract-Sprache

Das Schema der Datei steht verbindlich in
[`entities/import-format.md`](../../entities/import-format.md). Die Feldnamen sind
**englisch** (`firstName`, `lastName`, `postalCode`, `sellerType`, `number`, `name`,
`brand`, `category`, `price`, …); der Import mappt **keine** Feldnamen um — ein
abweichendes Import-Vokabular wäre eine zweite Quelle für dasselbe Schema.

Die Epic-Dokumente dieser App führen an einigen Stellen noch die alten deutschen
Feldnamen. Sie werden beim Review der Haupt-App nachgezogen; verbindlich ist
[`entities/`](../../entities/overview.md).

### Auflösung der Verkäufer-Typen

Die Import-Datei liefert `sellerType` als **Namen**. Existiert der Name in dieser App nicht, bricht der Import **nicht** ab und legt auch **nichts** automatisch an — die Vorschau verlangt vom Admin für jeden unbekannten Namen eine Zuordnung auf einen existierenden Typ. Erst danach ist „Import bestätigen" möglich.

Kein automatisches Anlegen, weil ein Typ Provision und Gebühr trägt, die der Import nicht erfinden kann; ein Typ mit 0 % Provision wäre ein stiller Geldverlust. Regel und Begründung → [Epic_Verkaeufer_Typen](../Epic_Verkaeufer_Typen/epic.md) Abschnitt 4.

### Upsert-Logik

1. Existiert ein Verkäufer (anhand der **Verkäufer-ID** aus Voranmelde-App) bereits → Verkäufer **inkl. aller seiner Artikel vollständig löschen**
2. Danach: Verkäufer + Artikel aus der Import-Datei neu anlegen

Die **Verkäufer-ID** aus der Voranmelde-App wird 1:1 übernommen.

Artikel, die **manuell** in der Haupt-App angelegt wurden (ohne Import-Bezug), bleiben unberührt.

### Import-Inhalte (optional wählbar)

- Marken
- Kategorien

Diese werden bei Bedarf aus der selben JSON-Datei importiert (Stammdaten-Synchronisierung).

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

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL geänderte Systemparameter (suchDebounceMs, scannerPauseMs) im localStorage speichern und bei jedem App-Start daraus laden.
2. **AC-2** — WHEN eine JSON-Datei ausgewählt wird, THEN SHALL das System sofort eine Import-Vorschau mit Anzahl Verkäufer und Artikel sowie deren Anlage-/Ersetz-Status anzeigen, ohne zusätzlichen Bestätigungs-Klick.
3. **AC-3** — WHEN „Import bestätigen" geklickt wird, THEN SHALL das System eine Fortschrittsanzeige (p-progressbar) einblenden und nach Abschluss eine Toast-Benachrichtigung „✓ Import erfolgreich" zeigen.
4. **AC-4** — WHEN ein importierter Verkäufer bereits in der Datenbank existiert (anhand Verkäufer-ID), THEN SHALL das System diesen Verkäufer samt allen seinen Artikeln vollständig löschen und anschließend den Verkäufer und seine Artikel aus der Import-Datei neu anlegen.
5. **AC-5** — THE SYSTEM SHALL Artikel, die manuell in der Haupt-App angelegt wurden (ohne Import-Bezug), beim Upsert-Import unberührt lassen.
6. **AC-6** — THE SYSTEM SHALL die Benutzerverwaltung ausschließlich für die Rolle Admin erreichbar machen; ein Request mit der Rolle Kassenpersonal SHALL mit `403` abgelehnt werden.
7. **AC-7** — WHEN ein Admin einen Benutzer anlegt oder dessen Passwort zurücksetzt, THEN SHALL das System für diesen Benutzer den Zwangswechsel beim nächsten Login setzen.
8. **AC-8** — IF versucht wird, das letzte verbleibende Admin-Konto zu löschen, THEN SHALL das System die Löschung mit `409` ablehnen.
9. **AC-9** — IF die Import-Datei Verkäufer-Typen enthält, deren Name in dieser App nicht existiert, THEN SHALL das System sie in der Vorschau mit der Anzahl betroffener Verkäufer auflisten, je Name eine Zuordnung auf einen existierenden Typ verlangen und „Import bestätigen" bis dahin deaktiviert lassen.
10. **AC-10** — THE SYSTEM SHALL beim Import keinen Verkäufer-Typ automatisch anlegen und keinen unbekannten Namen stillschweigend durch einen Standardtyp ersetzen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #einstellungen #json-import #konfiguration #upsert #localstorage #benutzerverwaltung #rollen
