# Feature: Export

**App:** Voranmelde-App
**Navigation:** System → Export
**Sichtbar für:** Admin

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
Details → [Feature_Einstellungen](../../../bazaar-app/features/Feature_Einstellungen/feature.md)
