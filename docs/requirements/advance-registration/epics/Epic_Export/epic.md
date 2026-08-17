---
id: F-AR-013
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
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

Component-Details → [`components/forms/export-panel.md`](../../components/forms/export-panel.md)

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

Der Export-Button ruft `GET /api/export` auf — das Backend generiert die JSON-Datei serverseitig (filtert Verkäufer ohne Artikel, baut die Struktur exakt nach dem Schema in `api/export.md`) und liefert sie als Download-Response. Das Frontend triggert nur den Browser-Download aus der Response, kein clientseitiger Aufbau der Datei (vermeidet ungepaginiertes Laden aller Datensätze in den Browser).

**Dateiname-Muster:**
```
basar-export-YYYY-MM-DD.json
```

---

## 3. Export-Format

JSON-ASCII-Datei — verbindliches Schema in [`api/export.md`](../../api/export.md) (hier nicht dupliziert). Keine Provision/Gebühr pro Verkäufer — nur `sellerType` (Name als Referenz), die Haupt-App löst Provision/Gebühr über ihre eigenen Verkäufer-Typen auf (konsistent mit der Q0-Entscheidung aus Epic_Verkaeufer: kein Override in der Voranmelde-App).

---

## 4. Import in die Haupt-App

Die exportierte JSON-Datei wird manuell am Basar-Morgen in die Haupt-App importiert (über deren Einstellungen-Seite). Der Import-Ablauf inklusive Upsert-Logik ist Sache der Haupt-App und dort dokumentiert (`docs/requirements/bazaar-app/`, Epic_Einstellungen) — für diese App endet die Verantwortung mit dem Schema in [`api/export.md`](../../api/export.md).

---

## 4b. Backend & API

API-Details → [`api/export.md`](../../api/export.md)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/export` | `admin` | Generiert die Export-JSON serverseitig (Schema siehe `api/export.md`). Query-Params `includeBrands`, `includeCategories` (beide Default `false`); nicht angefordert → leeres Array statt fehlendem Feld. Antwortet mit `Content-Disposition: attachment; filename="basar-export-YYYY-MM-DD.json"`. |

---

## Akzeptanzkriterien

1. **AC-1** — WHEN „Exportieren" geklickt wird, THEN SHALL das System via `GET /api/export` eine JSON-Datei generieren, die alle Verkäufer mit mindestens einem Artikel enthält.
2. **AC-2** — THE SYSTEM SHALL Verkäufer ohne Artikel nicht in die Export-Datei aufnehmen.
3. **AC-3** — THE SYSTEM SHALL die Export-Datei im JSON-Format exakt nach dem in `api/export.md` definierten Schema erzeugen (inkl. ISO-8601-`exportedAt`).
4. **AC-4** — WHEN die Export-Datei heruntergeladen wird, THEN SHALL das System eine Bestätigungsmeldung (Shared `info-area`, Typ `info`) mit Anzahl exportierter Verkäufer und Artikel anzeigen — bleibt stehen, kein Auto-Dismiss.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #export #json #datenschnittstelle #admin #import-vorbereitung
