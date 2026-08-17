---
id: F-AR-011
code: PROFIL
status: draft
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Profil

## Index
- Überblick — Konzept
- 1. Tab-Navigation — Tabs
- 2. Steckbrief (Tab 1) — Stammdaten
- 3. Zugangsdaten ändern (Tab 2) — Anmeldedaten
- 4. Account löschen (Tab 3) — Löschung
- 5. Backend & API — Endpoints
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** System → Profil (Admin) / Konto → Profil (Verkäufer)
**Sichtbar für:** Alle

Component-Details → [`profil-page`](../../components/profil-page.md)

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

Feldlayout gemäß Panels 01–03 (Lastenheft Abschnitt 9.4). **Panel-Styling** (alle drei Panels): `background: #f5f9f6; border: 1px solid #d4e8dc; border-radius: 8px; padding: 15px 16px`. Panel-Titel: 11 px, 700, uppercase, `#3a7057`.

**Panel 00 — Meine Verkäufernummer** (read-only, über Panel 01)
```
[a3f9c2d1  ⧉ Kopieren]              [QR-Code]
```
Komponente: [verkaeufer-nummer](../../components/verkaeufer-nummer.md),
Variante `card`. Zeigt die Verkäufer-`id` im Klartext und als QR-Code — derselbe
Baustein wie auf der Home-Seite (Epic_Home_Verkaeufer Abschnitt 2), inklusive der
Begründung, warum die `id` und nicht die abgeleitete „Nr." des ersten
Nummernblocks angezeigt wird. Wert kommt aus `id` in `GET /api/profile` — kein
neuer Endpoint, kein neues Entity-Feld. Nicht editierbar, nicht Teil des
Speichern-Submits.

**Panel 01 — Personendaten**
```
[Vorname *       50%] [Nachname *     50%]
[Anschrift                           100%]
[PLZ             50%] [Ort            50%]
```
PrimeNG: `pInputText` für alle Felder.

**Panel 02 — Kontakt**
```
[Telefon         50%] [E-Mail (read-only) 50%]
```
PrimeNG: `pInputText` (Telefon), `pInputText [readonly]="true"` (E-Mail).

**Panel 03 — Konditionen**
```
[Verkäufer-Typ (read-only)           100%]
[Gebühr je Stück (read-only) 50%] [Provision (read-only) 50%]
```
PrimeNG: `p-select [disabled]="true"` (Typ), `p-inputnumber` locale DE `minFractionDigits="2"` `[readonly]="true"` (Gebühr/Provision).

- **E-Mail** ist im Steckbrief **schreibgeschützt** — Änderung nur über Tab „Zugangsdaten"
- **Verkäufer-Typ** wird nur vom Admin geändert (siehe Epic_Verkaeufer) — hier read-only. **Gebühr/Provision** sind rein vom Typ abgeleitete Anzeigewerte, für niemanden direkt editierbar (kein Override-Feld in dieser App, siehe `entities/verkaeufer-typ.md`).
- Alle read-only-Felder visuell gedimmt, kein Eingabefokus möglich.

**Erfolg/Fehler:** Speichern erfolgreich → Toast „✓ Profil gespeichert". Speichern fehlgeschlagen → eingegebene Werte bleiben erhalten, Fehlermeldung „Profil konnte nicht gespeichert werden" in einer Error-InfoArea.

---

## 3. Zugangsdaten ändern (Tab 2)

- E-Mail-Adresse ändern (mit Passwort-Bestätigung)
- Passwort ändern (aktuelles Passwort + neues Passwort + Bestätigung)

---

## 4. Account löschen (Tab 3)

- Bestätigungsdialog: „Möchten Sie Ihren Account wirklich löschen?"
- Alle eigenen Artikel werden ebenfalls gelöscht
- Alle eigenen Nummernblöcke werden anschließend freigegeben (sind nach Artikel-Löschung leer, siehe „Löschen"-Regel in Epic_Verkaeufer)
- **Admin-Accounts:** Tab „Löschen" ist für die Admin-Rolle ausgeblendet — Löschung eines Admin-Accounts ist nur durch einen anderen Admin über die Verkäufer-Verwaltung möglich (verhindert Selbst-Aussperrung als letzter Admin)

---

## 5. Backend & API

API-Details → [`api/profile.md`](../../api/profile.md)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/profile` | `authenticated` | Eigene Profildaten inkl. **aufgelöstem** `sellerType` (Bezeichnung, Provision, Gebühr) — Panel 03 braucht diese Werte, ein Verkäufer hat aber keinen Zugriff auf `GET /api/seller-types`. |
| `PUT /api/profile` | `authenticated` | Aktualisiert Steckbrief (Panel 01–02). Mitgesendete `email`/`sellerType` werden serverseitig ignoriert. |
| `PUT /api/profile/email` | `authenticated` | Ändert E-Mail, erfordert aktuelles Passwort. Kein neues Token nötig (`sub` = User-ID, nicht E-Mail). |
| `PUT /api/profile/password` | `authenticated` | Ändert Passwort, erfordert aktuelles Passwort + Bestätigung. Löscht alle Refresh-Token-Zeilen des Verkäufers (alle anderen Geräte werden abgemeldet) und gibt dem aufrufenden Gerät ein neues Token-Paar zurück. |
| `DELETE /api/profile` | `authenticated` | Löscht eigenen Account + Artikel + Nummernblöcke + Refresh-Tokens. `403` für Admin-Rolle. |

**Pfad-Änderung:** Das Löschen hieß hier ursprünglich `DELETE /api/profile/me`. Das `/me`-Suffix entfällt — die vier anderen Routen tragen es auch nicht, `/api/profile` ist per Definition die eigene Ressource.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN die Profil-Seite geöffnet wird, THEN SHALL das System die aktuellen Profildaten des eingeloggten Verkäufers in einem Formular anzeigen.
2. **AC-2** — WHEN geänderte Daten gespeichert werden, THEN SHALL das System die Änderungen in der Datenbank speichern und eine Bestätigung anzeigen.
3. **AC-3** — IF ein Pflichtfeld beim Speichern leer ist, THEN SHALL das System eine Fehlermeldung unter dem Feld anzeigen und nicht speichern.
4. **AC-4** — WHEN das Passwort geändert wird, THEN SHALL das System eine Bestätigung des neuen Passworts verlangen und bei Nichtübereinstimmung eine Fehlermeldung anzeigen.
5. **AC-5** — WHEN der Account gelöscht wird, THEN SHALL das System alle eigenen Artikel und anschließend alle eigenen Nummernblöcke entfernen.
6. **AC-6** — IF der eingeloggte Nutzer die Admin-Rolle hat, THEN SHALL das System den Tab „Löschen" nicht anzeigen.
7. **AC-7** — WHEN der Steckbrief erfolgreich gespeichert wird, THEN SHALL das System einen Toast „✓ Profil gespeichert" anzeigen.
8. **AC-8** — IF das Speichern fehlschlägt, THEN SHALL das System die eingegebenen Werte erhalten und „Profil konnte nicht gespeichert werden" in einer Error-InfoArea anzeigen.
9. **AC-9** — WHEN der Tab „Steckbrief" geöffnet wird, THEN SHALL das System die eigene Verkäufernummer (`id` aus `GET /api/profile`) im Klartext und als QR-Code read-only anzeigen, ohne sie beim Speichern mitzusenden.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #profil #verkäufer #persönliche-daten #voranmeldung #verkäufernummer #qr-code
