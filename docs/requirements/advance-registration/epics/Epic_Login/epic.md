---
id: F-AR-001
status: reviewed
reviewed-date: 2026-08-14
updated: 2026-08-14
---

# Epic: Login

## Index
- Überblick — Konzept
- 1. Layout (Desktop) — Desktop-Layout
- 2. `login-info-panel` (links) — Info-Boxen
- 3. Login-Form (rechts) — Formular
- 4. Redirect nach Login — Weiterleitung
- 5. Demo-Hinweis (nur Entwicklung) — Demo-Modus
- 6. Registrierung — Selbstregistrierung
- 7. Backend & API — Endpoints, Token-Handling
- 8. Out-of-Scope (MVP) — bewusst verschobene Themen
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Route:** `/login` (öffentlich)

**Ziel:** Verkäufer und Admins authentifizieren sich in der Voranmelde-App.

**User Story:** Als Nutzer der Voranmelde-App möchte ich mich mit E-Mail und Passwort anmelden, damit ich auf meine Daten zugreifen kann.

---

## Überblick

Die Login-Seite ist in **zwei Hälften** aufgeteilt. Nach erfolgreichem Login → Redirect auf **Home-Seite** (unabhängig von der Rolle).

---

## 1. Layout (Desktop)

```
┌─────────────────────────┬─────────────────────────┐
│   Info-Area (50 %)      │   Login-Form (50 %)     │
│   (dunkler Hintergrund) │   (heller Hintergrund)  │
│                         │                         │
│  ⏱ Countdown            │  [E-Mail]               │
│  💰 Default-Konditionen  │  [Passwort]             │
│  📄 Markdown-Text        │  [Anmelden]             │
│                         │  Noch kein Konto? …     │
└─────────────────────────┴─────────────────────────┘
```

**Mobile (≤ 768 px):** Info-Area ausgeblendet — nur Login-Form sichtbar.

---

## 2. `login-info-panel` (links)

Eigene, neue Komponente (Details → [`components/login-info-panel.md`](../../components/login-info-panel.md)) — **nicht** zu verwechseln mit dem Shared-`info-area`-Component (das ist der Feedback-Banner success/error/warn/info, etwas völlig anderes).

Hintergrund: `#1b3a4b`, padding 60 px 48 px.

3 Info-Boxen:

| Box | Inhalt | Stil |
|---|---|---|
| **Countdown** | Sequence-Mode-Phasen `voranmeldeschluss` → `abgabeVon` → `abgabeBis` → `basarVon` → `basarBis` — zeigt automatisch die aktuell relevante Phase · → [Countdown](../../../../components/countdown/component.md) `variant="info-box"` | Label 11 px uppercase, Wert 32 px 800, Datum 13 px |
| **Default-Konditionen** | Provision (%) + Abgabegebühr (€) des `defaultTypeId`-Types — reines `<div>`, kein PrimeNG-Bezug | Werte in Akzentfarbe `#3ecf8e`, 700 |
| **Markdown-Info** | Admin-konfigurierter Info-Text, gerendert über die wiederverwendbare Shared-Component `markdown-text` (Details → [`markdown-text`](../../../../components/markdown-text/component.md); auch in Epic_Home_Verkaeufer/Epic_Home_Admin genutzt) | 13 px, line-height 1.7 |

Box-Stil: `background: rgba(255,255,255,0.06–0.08); border-radius: 10px; padding: 14–18px; margin-bottom: 20px`

---

## 3. Login-Form (rechts)

Details → [`components/login-form.md`](../../components/login-form.md). Container: `p-card`.

Hintergrund: weiß, padding 60 px 48 px.
Form: **max-width 360 px**, zentriert (margin auto).

- Überschrift: 22 px, 800
- Subtitle: 13.5 px, muted, mb 28 px
- Field-Label: 12 px, 700, uppercase, 0.4 px, muted, mb 5 px
- E-Mail-Feld: `p-iconfield` mit linkem `p-inputicon` (Envelope) + `input pInputText`
- Passwort-Feld: `p-iconfield` mit linkem `p-inputicon` (Schloss) + `input pInputPassword` + rechtem klickbarem `p-inputicon` (Eye/Eye-Slash-Toggle, `[(mask)]`-Binding)
- Login-Button: `p-button severity="primary"`, volle Breite, 15 px, 700, mt 6 px
- Passwort-vergessen-Link: unterhalb Login-Button, 12.5 px, muted; Klick öffnet `p-popover` mit Text „Bitte wende dich an den Admin, um dein Passwort zurückzusetzen." — kein Formular, kein Self-Service (siehe Abschnitt 8)
- Registrierung-Link: `p-button [text]="true"`, text-align center, mt 16 px, 13 px

---

## 4. Redirect nach Login

Nach erfolgreichem Login → **Home-Seite** (unabhängig von Admin oder Verkäufer-Rolle).

---

## 5. Demo-Hinweis (nur Entwicklung)

In der Entwicklungsversion: kleiner Hinweis auf verfügbare Demo-Accounts. Reines `<small>`/`<p>`, kein PrimeNG-Bezug.
In der Produktionsversion entfällt dieser Hinweis vollständig.

---

## 6. Registrierung

Link auf der Login-Seite → eigene Registrierungsseite (`/registrieren`, öffentlich). Details → [`components/registrierung-form.md`](../../components/registrierung-form.md), [`components/password-strength-meter.md`](../../components/password-strength-meter.md).

E-Mail/Passwort/Passwort-Bestätigung nutzen dieselben `p-iconfield`-Bausteine wie die Login-Form (Abschnitt 3), Passwort zusätzlich `pInputPassword`. Registrieren-Button und „Schon ein Konto?"-Link analog: `p-button severity="primary"` bzw. `p-button [text]="true"`.

**Felder:**

| Feld | Beschreibung |
|---|---|
| **E-Mail** | Pflicht, muss eindeutig sein (Unique-Constraint) |
| **Passwort** | Pflicht, min. 8 Zeichen, siehe Stärke-Schema unten |
| **Passwort-Bestätigung** | Pflicht, muss mit Passwort übereinstimmen |

**Passwort-Stärke-Schema** (Pflicht: mind. „Mittel" zum Absenden):

| Stufe | Regel |
|---|---|
| Schwach | < 8 Zeichen oder nur 1 Zeichentyp |
| Mittel | ≥ 8 Zeichen + mind. 2 Zeichentypen (Groß/Klein/Zahl/Sonderzeichen) |
| Stark | ≥ 10 Zeichen + alle 4 Zeichentypen, davon mind. 2 Sonderzeichen |

Live-Anzeige der Stärke während der Eingabe: `p-progressbar` (Farb-Balken je Stufe) + `p-tag` (Label schwach/mittel/stark) — `pInputPassword` selbst liefert kein automatisches Stärke-Feedback, Balken+Label werden aus dem eigenen Scoring berechnet (analog PrimeNG-„Strength Meter"-Beispiel).

**Ablauf:**
1. Nutzer füllt Formular aus, sendet ab.
2. IF E-Mail bereits registriert → Fehlermeldung „Diese E-Mail ist bereits registriert" + Link zu Login.
3. Bei Erfolg: Backend legt Profil an (Verkäufer-Typ = `defaultTypeId`, siehe Epic_Einstellungen), reserviert `defaultBlockCount` zusammenhängende Nummernblöcke ab der nächsten freien Nummer — dieselbe Vergaberegel wie `POST /api/sellers` — und gibt Access- und Refresh-Token zurück.
3b. IF `defaultTypeId` in den Einstellungen nicht gesetzt ist → `409` „Registrierung ist noch nicht freigeschaltet" (ohne Typ kann das Pflichtfeld `verkaueferTypeId` nicht gefüllt werden).
4. Nutzer wird automatisch eingeloggt und zu `/home` weitergeleitet (kein zusätzlicher Login-Schritt).

**Bewusst nicht enthalten (MVP):** Email-Verifizierung, Captcha/Spam-Schutz — siehe Abschnitt 8.

---

## 7. Backend & API

API-Details → [`api/auth.md`](../../api/auth.md) (Requests, Responses, Fehlerfälle)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `POST /api/auth/login` | `public` | `{ email, password }` → `200` Token-Hülle / `401` bei falschen Daten |
| `POST /api/auth/register` | `public` | `{ email, password }` → `201` Token-Hülle / `409` bei bereits vergebener E-Mail oder fehlendem `defaultTypeId` |
| `POST /api/auth/refresh` | `public` | `{ refreshToken }` → `200` Token-Hülle (Rotation) / `401` bei ungültigem/abgelaufenem Refresh-Token |
| `POST /api/auth/set-password` | `public` | `{ inviteToken, password }` → `200` Token-Hülle / `401` bei ungültigem/abgelaufenem Token. Für den Admin-Invite-Flow (siehe Epic_Verkaeufer) — Verkäufer legt beim ersten Zugriff das eigene Passwort fest und ist danach eingeloggt. |

**Token-Hülle:** einheitlich `{ accessToken, refreshToken }` für alle vier Endpoints. Bewusst **ohne** `role`/`expiresIn` — beides steht als Claim im JWT und würde sonst zur zweiten, driftenden Quelle (Frontend liest es via VSHELL-S04 AC-2/AC-3 aus dem Payload).

**Passwort-Hashing:** bcrypt oder Argon2 — kein Klartext-Speichern (Implementierungsdetail Backend).

**JWT-Claims:** `sub` (User-ID), `role` (`admin` | `seller`), `exp`.

**Token-Lebensdauer:** Access-Token 5 Tage, Refresh-Token 30 Tage.

**Token-Storage (Frontend):** `localStorage`, Keys `bazaar_token` (Access) und `bazaar_refresh_token` (Refresh) — Interceptor-Mechanik (automatischer Refresh bei 401) siehe Epic_App_Shell VSHELL-S04.

**Daten der Info-Area:** Countdown-Termine, Default-Konditionen und `infoText` kommen gesammelt aus `GET /api/public/info` (öffentlich, kein Auth) — siehe Epic_Countdown_Widget bzw. [`api/public.md`](../../api/public.md). Nicht Teil dieser Auth-Endpoints.

---

## 8. Out-of-Scope (MVP)

Bewusst zurückgestellt, nicht vergessen:

- **Brute-Force-Schutz** (Rate-Limiting/Lockout nach Fehlversuchen)
- **Email-Verifizierung / Double-Opt-in** bei Registrierung
- **Captcha/Spam-Schutz** bei Registrierung
- **Self-Service-Passwort-Reset** per E-Mail (aktuell nur Admin-Reset, siehe Epic_Verkaeufer Panel 05)
- **Serverseitige Token-Invalidierung** (Token-Blacklist / Version-Counter). Konsequenzen: kein `POST /api/auth/logout` (Logout löscht nur den localStorage, VSHELL-S04 AC-9), und ein Passwortwechsel über `PUT /api/profile/password` meldet bestehende Sessions auf anderen Geräten nicht ab.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN Nutzername und Passwort eingegeben und „Anmelden" geklickt wird, THEN SHALL das System die Anmeldedaten prüfen und bei Erfolg die Startseite laden.
2. **AC-2** — IF Nutzername oder Passwort falsch ist, THEN SHALL das System die Meldung „Ungültige Anmeldedaten" anzeigen ohne Details preiszugeben.
3. **AC-3** — WHILE das Passwortfeld fokussiert ist und Enter gedrückt wird, SHALL das System die Anmeldung auslösen.
4. **AC-4** — WHEN „Passwort vergessen" geklickt wird, THEN SHALL das System einen Hinweis-Popup mit dem Text „Bitte wende dich an den Admin, um dein Passwort zurückzusetzen." anzeigen (kein Formular).
5. **AC-5** — WHEN das Registrierungsformular ohne alle Pflichtfelder (E-Mail, Passwort, Passwort-Bestätigung) abgesendet wird, THEN SHALL das System die fehlenden Felder markieren und nicht absenden.
6. **AC-6** — IF die Passwort-Stärke unter „Mittel" liegt, THEN SHALL das System den Absenden-Button deaktivieren und die aktuelle Stärke anzeigen.
7. **AC-7** — IF Passwort und Passwort-Bestätigung nicht übereinstimmen, THEN SHALL das System eine Fehlermeldung anzeigen und nicht absenden.
8. **AC-8** — IF die eingegebene E-Mail bereits registriert ist, THEN SHALL das System die Meldung „Diese E-Mail ist bereits registriert" mit einem Link zu Login anzeigen.
9. **AC-9** — WHEN die Registrierung erfolgreich ist, THEN SHALL das System den Nutzer automatisch einloggen (Token speichern) und zu `/home` weiterleiten.
10. **AC-10** — WHEN ein neuer Verkäufer registriert wird, THEN SHALL das System ihm den Verkäufer-Typ `defaultTypeId` zuweisen und `defaultBlockCount` zusammenhängende Nummernblöcke ab der nächsten freien Nummer reservieren.
11. **AC-11** — IF bei einem Registrierungsversuch kein `defaultTypeId` in den Einstellungen gesetzt ist, THEN SHALL das System die Registrierung mit `409` und der Meldung „Registrierung ist noch nicht freigeschaltet" ablehnen und keinen Verkäufer anlegen.

**Hinweis:** „Aktive Sitzung → Login-Seite überspringen" ist bereits in Epic_App_Shell (VSHELL-S03 AC-7) spezifiziert und wird hier nicht dupliziert.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #login #registrierung #authentifizierung #voranmelde-app #e-mail #passwort #jwt #refresh-token
