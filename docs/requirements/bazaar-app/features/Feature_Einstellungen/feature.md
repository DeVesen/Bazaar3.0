---
id: F-BA-010
status: draft
updated: 2026-07-31
---

# Feature: Einstellungen

## Index
- Überblick — Admin-Einstellungen
- 1. Systemparameter — Parameter & Defaults
- 2. JSON-Import — Voranmelde-Import
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
3. Admin bestätigt den Import explizit per Button
4. **Fortschrittsanzeige** (`p-progressbar`) während des Imports
5. Toast-Benachrichtigung: „✓ Import erfolgreich"

### Import-Inhalt

- Nur Verkäufer **mit mindestens einem Artikel** (inkl. Admins der Voranmelde-App)
- Verkäufer ohne Artikel werden **nicht** exportiert/importiert

### Upsert-Logik

1. Existiert ein Verkäufer (anhand der **Verkäufer-ID** aus Voranmelde-App) bereits → Verkäufer **inkl. aller seiner Artikel vollständig löschen**
2. Danach: Verkäufer + Artikel aus der Import-Datei neu anlegen

Die **Verkäufer-ID** aus der Voranmelde-App wird 1:1 übernommen.

Artikel, die **manuell** in der Haupt-App angelegt wurden (ohne Import-Bezug), bleiben unberührt.

### Import-Inhalte (optional wählbar)

- Marken
- Kategorien

Diese werden bei Bedarf aus der selben JSON-Datei importiert (Stammdaten-Synchronisierung).

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL geänderte Systemparameter (suchDebounceMs, scannerPauseMs) im localStorage speichern und bei jedem App-Start daraus laden.
2. **AC-2** — WHEN eine JSON-Datei ausgewählt wird, THEN SHALL das System sofort eine Import-Vorschau mit Anzahl Verkäufer und Artikel sowie deren Anlage-/Ersetz-Status anzeigen, ohne zusätzlichen Bestätigungs-Klick.
3. **AC-3** — WHEN „Import bestätigen" geklickt wird, THEN SHALL das System eine Fortschrittsanzeige (p-progressbar) einblenden und nach Abschluss eine Toast-Benachrichtigung „✓ Import erfolgreich" zeigen.
4. **AC-4** — WHEN ein importierter Verkäufer bereits in der Datenbank existiert (anhand Verkäufer-ID), THEN SHALL das System diesen Verkäufer samt allen seinen Artikeln vollständig löschen und anschließend den Verkäufer und seine Artikel aus der Import-Datei neu anlegen.
5. **AC-5** — THE SYSTEM SHALL Artikel, die manuell in der Haupt-App angelegt wurden (ohne Import-Bezug), beim Upsert-Import unberührt lassen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #einstellungen #json-import #konfiguration #upsert #localstorage
