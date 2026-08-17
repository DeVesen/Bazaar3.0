---
id: F-BA-012
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Login

## Index
- Überblick — Konzept
- 1. Layout — Login-Seite
- 2. Rollen & Rechte — Zugriffsmatrix
- 3. Benutzerverwaltung — Anlegen, Zurücksetzen
- 4. Erststart — Seed-Admin
- 5. Backend & API — Endpoints, Token-Handling
- 6. Out-of-Scope (MVP) — bewusst verschobene Themen
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Haupt-App
**Route:** `/login` (öffentlich, ohne AppShell/Sidebar)
**Sichtbar für:** Jeder mit Netzzugang im LAN

Component-Details → [`login-form`](../../components/login-form.md) · [`change-password-page`](../../components/change-password-page.md)

**Ziel:** Admin und Kassenpersonal authentifizieren sich in der Haupt-App; die Rolle entscheidet über den Zugriff auf konfigurierende und zerstörende Aktionen.

**User Story:** Als Betreiber möchte ich, dass sich Kassenpersonal mit eigenem Konto anmeldet, damit Einstellungen, Import und Storno-Aktionen dem Admin vorbehalten bleiben.

---

## Überblick

Die Haupt-App läuft im geschlossenen LAN, ist aber **nicht** rollenfrei: Am Basar-Tag arbeiten mehrere Personen an mehreren Geräten, und Einstellungen, JSON-Import sowie Storno-/Löschaktionen sollen nicht versehentlich von der Kasse aus ausgelöst werden.

Der Zuschnitt folgt dem Betriebskontext, nicht einem Sicherheitsstandard für öffentliche Anwendungen: Es gibt keine Selbstregistrierung (geschlossener Personenkreis), keinen Mailversand (kein Internet) und keine Brute-Force-Sperre (der Angreifer müsste im Raum stehen). Details in Abschnitt 6.

Nach erfolgreichem Login → Redirect auf die Startseite, unabhängig von der Rolle.

---

## 1. Layout

```
┌─────────────────────────────────────────┐
│                                         │
│          Bazaar Haupt-App               │
│                                         │
│          [Benutzername]                 │
│          [Passwort]           👁         │
│          [    Anmelden    ]             │
│                                         │
│   Passwort vergessen? Wende dich an     │
│   den Admin.                            │
└─────────────────────────────────────────┘
```

Einspaltig, zentriert, `max-width: 360 px`, Container `p-card`. Keine Info-Area wie in der Voranmelde-App — es gibt hier keine Termine, Konditionen oder Registrierungs-Hinweise zu zeigen.

- Benutzername-Feld: `p-iconfield` mit linkem `p-inputicon` (User) + `input pInputText`
- Passwort-Feld: `p-iconfield` mit linkem `p-inputicon` (Schloss) + `input pInputPassword` + rechtem klickbarem `p-inputicon` (Eye/Eye-Slash-Toggle, `[(mask)]`-Binding)
- Anmelden-Button: `p-button severity="primary"`, volle Breite
- Passwort-vergessen: **statischer Hinweistext**, kein Link, kein Popover — es gibt nichts zu klicken (siehe Abschnitt 3)

**Anmeldung per Benutzername, nicht per E-Mail** — abweichend von der Voranmelde-App. Im LAN hat Kassenpersonal keine dienstliche E-Mail-Adresse, und ein kurzer Benutzername ist auf einem Tablet am Basar-Morgen schneller getippt.

---

## 2. Rollen & Rechte

Verbindliche Matrix → [`spec.md`](../../spec.md) Abschnitt 4. Kurzform:

| Rolle | Grundsatz |
|---|---|
| **Admin** | alles |
| **Kassenpersonal** | alles Operative (Artikelannahme, Verkauf, Abrechnung, Drucken), lesend bei Stammdaten, Verkäufern, Artikeln und Statistik; **kein** Zugriff auf Einstellungen, Import und Benutzerverwaltung; **kein** Stornieren oder Löschen |

Marken und Kategorien darf Kassenpersonal **implizit über das AutoComplete-Popup anlegen** (siehe [`spec.md`](../../spec.md) Abschnitt 9.3) — andernfalls blockiert die Artikelannahme an der erstbesten unbekannten Marke. Bearbeiten und Löschen bleibt beim Admin.

Durchgesetzt wird die Matrix an zwei Stellen: `adminGuard` im Frontend (Route nicht erreichbar) und Rollenprüfung am Endpoint im Backend (`403`). Das Frontend ist die Bequemlichkeit, das Backend die Regel.

---

## 3. Benutzerverwaltung

Angesiedelt als eigener Bereich in [Epic_Einstellungen](../Epic_Einstellungen/epic.md) — eine Liste und ein Formular rechtfertigen kein eigenes Epic.

| Aktion | Wer | Verhalten |
|---|---|---|
| Benutzer anlegen | Admin | Benutzername, Rolle, Initialpasswort |
| Rolle ändern | Admin | sofort wirksam beim nächsten Login |
| Passwort zurücksetzen | Admin | setzt neues Passwort direkt, Zwangswechsel beim nächsten Login |
| Benutzer löschen | Admin | der letzte verbleibende Admin ist nicht löschbar |

**Kein Self-Service-Reset.** Ohne Mailserver im LAN gibt es keinen Zustellweg für einen Reset-Link. Der Admin setzt das Passwort direkt; der Benutzer wird beim nächsten Login zum Ändern gezwungen — dieselbe Mechanik wie beim Seed-Admin, also kein zweites Konzept.

**Importierte Verkäufer sind keine Benutzer.** Der JSON-Import aus der Voranmelde-App bringt Verkäuferdatensätze, keine Konten — Verkäufer melden sich in der Haupt-App nie an.

---

## 4. Erststart — Seed-Admin

Beim ersten Start existiert **genau ein** Admin-Konto. Benutzername und Initialpasswort kommen aus den Environment-Variablen `SEED_ADMIN_USER` und `SEED_ADMIN_PASSWORD`; die App legt das Konto nur an, wenn noch kein Benutzer in der Datenbank steht.

Beim ersten Login mit diesem Konto erzwingt die App den Passwortwechsel. Damit gibt es weder einen Zustand, in dem niemand hereinkommt, noch ein Passwort im Repository.

---

## 5. Backend & API

API-Details → [`api/auth.md`](../../api/auth.md)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `POST /api/auth/login` | `public` | `{ username, password }` → `200 { accessToken }` / `401` bei falschen Daten |
| `PUT /api/auth/password` | `authenticated` | `{ currentPassword, newPassword }` → `204` / `401` bei falschem aktuellem Passwort |

**Kein Refresh-Endpoint, keine Refresh-Tokens.** Ein einziges Access-Token mit **16 Stunden** Lebensdauer deckt jeden Basar-Tag ab. Ein Token, das mitten im Kassenvorgang abläuft und die Kassenkraft auf den Login-Screen wirft, während der Kunde wartet, ist ein Betriebsschaden — und der Refresh-Mechanismus löst ein Problem (kurzlebige Tokens im Dauerbetrieb), das hier nicht existiert. Bewusste Abweichung von der Voranmelde-App, wo Dauerbetrieb über Wochen der Normalfall ist.

**JWT-Claims:** `sub` (User-ID), `name` (Benutzername), `role` (`admin` | `cashier`), `mustChangePassword` (bool), `exp`.

**Token-Storage (Frontend):** `localStorage`, Key `bazaar_token`. Der Interceptor hängt ausschließlich den `Authorization`-Header an und leitet bei `401` auf `/login` — keine Refresh-Logik. Logout löscht den Key. Mechanik siehe [Epic_App_Shell](../Epic_App_Shell/epic.md).

**Kein Idle-Logout.** Ein Kassen-Tablet, das nach Inaktivität ausloggt, kostet am Basar-Tag nur Zeit.

**Hexagonaler Schnitt** (siehe [`spec.md`](../../spec.md) Abschnitt 7.0.1):

| Baustein | Ort |
|---|---|
| `User`-Aggregate mit `Role` (Value Object) und `MustChangePassword` | `Bazaar.Domain/User/` |
| `IPasswordHasher`, `ITokenIssuer` | `Bazaar.Domain/Ports/` |
| Implementierungen (ASP.NET `PasswordHasher<T>`, JWT-Ausstellung) | `Bazaar.Infrastructure/` |
| `LoginHandler`, `ChangePasswordHandler` | `Bazaar.Application/Auth/` |
| Endpoint-Registrierung + DTOs | `Bazaar.Api/Features/Auth/` |

Auth ist damit genauso geschnitten wie jedes fachliche Feature — keine Sonderregel. Die Regeln prüft `Bazaar.Architecture.Tests` (siehe BPROJ-S06).

**Passwort-Regel:** mindestens 8 Zeichen. Keine Stärke-Klassen, kein Stärke-Meter — die Voranmelde-App braucht das für Selbstregistrierung durch Fremde, hier legt der Admin die Konten an.

---

## 6. Out-of-Scope (MVP)

Bewusst zurückgestellt, nicht vergessen:

- **Brute-Force-Schutz / Lockout nach Fehlversuchen.** Die App ist physisch im abgeschlossenen LAN; eine Sperre würde am Basar-Tag mit höherer Wahrscheinlichkeit die eigene Kassenkraft aussperren als einen Angreifer aufhalten.
- **Refresh-Tokens und Token-Blacklist.** Ein ausgegebenes Token bleibt bis `exp` gültig; es gibt kein `POST /api/auth/logout`, Logout löscht nur den `localStorage`.
- **Selbstregistrierung** — geschlossener Personenkreis, Konten legt der Admin an.
- **Self-Service-Passwort-Reset per E-Mail** — kein Mailserver im LAN.
- **Passwort-Stärke-Meter**, Passwort-Historie, Ablauf-Zwang.
- **Mehr als zwei Rollen** (z. B. „nur Abrechnung"). Erst wenn ein konkreter Bedarf auftritt.
- **Audit-Log**, welcher Benutzer welche Aktion ausgelöst hat.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN Benutzername und Passwort eingegeben und „Anmelden" geklickt wird, THEN SHALL das System die Anmeldedaten prüfen und bei Erfolg die Startseite laden.
2. **AC-2** — IF Benutzername oder Passwort falsch ist, THEN SHALL das System die Meldung „Ungültige Anmeldedaten" anzeigen, ohne preiszugeben, welcher der beiden Werte falsch war.
3. **AC-3** — WHILE das Passwortfeld fokussiert ist und Enter gedrückt wird, SHALL das System die Anmeldung auslösen.
4. **AC-4** — THE SYSTEM SHALL ein Access-Token mit 16 Stunden Lebensdauer ausstellen und die Claims `sub`, `name`, `role` und `mustChangePassword` setzen.
5. **AC-5** — WHEN kein Benutzer in der Datenbank existiert, THEN SHALL das System beim Start genau ein Admin-Konto aus `SEED_ADMIN_USER` und `SEED_ADMIN_PASSWORD` anlegen.
6. **AC-6** — IF ein Benutzer mit gesetztem `mustChangePassword` sich anmeldet, THEN SHALL das System vor jeder anderen Seite die Passwortänderung erzwingen.
7. **AC-7** — WHEN ein Admin das Passwort eines Benutzers zurücksetzt, THEN SHALL das System `mustChangePassword` für diesen Benutzer setzen.
8. **AC-8** — IF ein neues Passwort kürzer als 8 Zeichen ist, THEN SHALL das System es mit `400` ablehnen.
9. **AC-9** — IF ein Request auf einen Admin-Endpoint mit der Rolle `cashier` erfolgt, THEN SHALL das Backend mit `403` antworten — unabhängig davon, ob das Frontend die Route verborgen hat.
10. **AC-10** — IF ein Request ohne oder mit abgelaufenem Token auf einen geschützten Endpoint erfolgt, THEN SHALL das Backend mit `401` antworten und das Frontend auf `/login` weiterleiten.
11. **AC-11** — THE SYSTEM SHALL das Löschen des letzten verbleibenden Admin-Kontos mit `409` ablehnen.
12. **AC-12** — THE SYSTEM SHALL Passwörter ausschließlich gehasht speichern (ASP.NET `PasswordHasher<T>`) — kein Klartext, keine reversible Verschlüsselung.
13. **AC-13** — THE SYSTEM SHALL auf der Login-Seite einen statischen Hinweis anzeigen, dass der Admin Passwörter zurücksetzt; ein „Passwort vergessen"-Formular SHALL nicht existieren.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #login #authentifizierung #jwt #rollen #admin #kassenpersonal #haupt-app
