# Feature: Profil

**App:** Voranmelde-App
**Navigation:** System → Profil (Admin) / Konto → Profil (Verkäufer)
**Sichtbar für:** Alle

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
