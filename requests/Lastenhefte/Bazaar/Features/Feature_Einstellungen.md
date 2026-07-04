# Feature: Einstellungen

**App:** Bazaar Haupt-App
**Navigation:** System → Einstellungen

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
