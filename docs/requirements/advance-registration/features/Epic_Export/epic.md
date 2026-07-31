---
id: F-AR-013
status: draft
updated: 2026-07-31
---

# Epic: Export

## Index
- Überblick — Konzept
- 1. Export-Inhalt — Exportumfang
- 2. Technische Umsetzung — Download-Mechanismus
- 3. Export-Format — JSON-Struktur
- 4. Import in die Haupt-App — Verwendung
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** System → Export
**Sichtbar für:** Admin

**Ziel:** Admin exportiert alle Basar-Daten als JSON-Datei für den Import in die Haupt-App.

**User Story:** Als Admin möchte ich alle Verkäufer- und Artikeldaten als JSON-Datei exportieren, damit die Haupt-App am Basar-Tag mit aktuellen Daten befüllt werden kann.

---

## Überblick

Der Admin erstellt einen JSON-ASCII-Export aller relevanten Verkäufer und Artikel für den Import in die Haupt-App.

---

## 1. Export-Inhalt

**Pflichtinhalt:** Alle Verkäufer (inkl. Admins) mit **mindestens einem eigenen Artikel** — jeweils mit vollständigem Profil + Artikelliste.
Verkäufer ohne Artikel werden **nicht** exportiert.

**Optional wählbar (Checkboxes):**
- Marken einschließen
- Kategorien einschließen

Diese werden für die Stammdaten-Synchronisierung mit der Haupt-App verwendet.

---

## 2. Technische Umsetzung

Der Export-Button löst direkt einen **Browser-Download** aus — **kein separater Server-Endpunkt**, kein Zwischenscreen.
Der Export ist rein client-seitig implementiert.

**Dateiname-Muster:**
```
basar-export-YYYY-MM-DD.json
```

---

## 3. Export-Format

JSON-ASCII-Datei mit folgender Struktur (vereinfacht):

```json
{
  "exportedAt": "2026-06-25",
  "sellers": [
    {
      "id": "ABCD1234",
      "firstName": "...",
      "lastName": "...",
      "provision": 0.1,
      "gebuehr": 0.5,
      "items": [...]
    }
  ],
  "brands": [...],
  "categories": [...]
}
```

---

## 4. Import in die Haupt-App

Die exportierte JSON-Datei wird manuell am Basar-Morgen in die Haupt-App importiert (über die Einstellungen-Seite der Haupt-App).
Details → [Epic_Einstellungen](../../../bazaar-app/features/Epic_Einstellungen/epic.md)

---

## Akzeptanzkriterien

1. **AC-1** — WHEN „Exportieren" geklickt wird, THEN SHALL das System eine JSON-Datei generieren, die alle Verkäufer mit mindestens einem Artikel enthält.
2. **AC-2** — THE SYSTEM SHALL Verkäufer ohne Artikel nicht in die Export-Datei aufnehmen.
3. **AC-3** — THE SYSTEM SHALL die Export-Datei im ASCII-JSON-Format erzeugen, das mit der Haupt-App kompatibel ist.
4. **AC-4** — WHEN die Export-Datei heruntergeladen wird, THEN SHALL das System eine Bestätigungsmeldung mit Anzahl exportierter Verkäufer und Artikel anzeigen.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #export #json #datenschnittstelle #admin #import-vorbereitung
