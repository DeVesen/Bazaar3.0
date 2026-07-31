---
id: F-AR-011
code: PROFIL
status: draft
updated: 2026-07-31
---

# Epic: Profil

## Index
- Überblick — Konzept
- 1. Tab-Navigation — Tabs
- 2. Steckbrief (Tab 1) — Stammdaten
- 3. Zugangsdaten ändern (Tab 2) — Anmeldedaten
- 4. Account löschen (Tab 3) — Löschung
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** System → Profil (Admin) / Konto → Profil (Verkäufer)
**Sichtbar für:** Alle

**Ziel:** Verkäufer pflegt sein Profil in der Voranmelde-App.

**User Story:** Als Verkäufer möchte ich meine persönlichen Daten und Kontaktinformationen pflegen, damit der Admin und das Kassenpersonal mich korrekt identifizieren können.

---

## Überblick

Die Profil-Seite ermöglicht das Einsehen und Bearbeiten der eigenen Stammdaten. Sie ist in Tabs gegliedert.

---

## 1. Tab-Navigation

1. **Steckbrief** — alle Stammdaten einsehen und bearbeiten
2. **Zugangsdaten ändern** — E-Mail und/oder Passwort ändern
3. **Löschen** — Account löschen (mit Bestätigungsdialog)

---

## 2. Steckbrief (Tab 1)

Feldlayout gemäß Panels 01–03 (Lastenheft Abschnitt 9.4):

**Panel 01 — Personendaten**
```
[Vorname *       50%] [Nachname *     50%]
[Anschrift                           100%]
[PLZ             50%] [Ort            50%]
```

**Panel 02 — Kontakt**
```
[Telefon         50%] [E-Mail (read-only) 50%]
```

**Panel 03 — Konditionen**
```
[Verkäufer-Type (read-only)          100%]
[Gebühr je Stück (read-only) 50%] [Provision (read-only) 50%]
```

- **E-Mail** ist im Steckbrief **schreibgeschützt** — Änderung nur über Tab „Zugangsdaten"
- **Type/Gebühr/Provision** sind für Verkäufer **schreibgeschützt** — nur Admin kann diese ändern

---

## 3. Zugangsdaten ändern (Tab 2)

- E-Mail-Adresse ändern (mit Passwort-Bestätigung)
- Passwort ändern (aktuelles Passwort + neues Passwort + Bestätigung)

---

## 4. Account löschen (Tab 3)

- Bestätigungsdialog: „Möchten Sie Ihren Account wirklich löschen?"
- Alle eigenen Artikel werden ebenfalls gelöscht

---

## Stories

- [PROFIL-S01 — Steckbrief-Formular](stories/PROFIL-S01-seller-profile-form.md)

## Akzeptanzkriterien

1. **AC-1** — WHEN die Profil-Seite geöffnet wird, THEN SHALL das System die aktuellen Profildaten des eingeloggten Verkäufers in einem Formular anzeigen.
2. **AC-2** — WHEN geänderte Daten gespeichert werden, THEN SHALL das System die Änderungen in der Datenbank speichern und eine Bestätigung anzeigen.
3. **AC-3** — IF ein Pflichtfeld beim Speichern leer ist, THEN SHALL das System eine Fehlermeldung unter dem Feld anzeigen und nicht speichern.
4. **AC-4** — WHEN das Passwort geändert wird, THEN SHALL das System eine Bestätigung des neuen Passworts verlangen und bei Nichtübereinstimmung eine Fehlermeldung anzeigen.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #profil #verkäufer #persönliche-daten #voranmeldung
