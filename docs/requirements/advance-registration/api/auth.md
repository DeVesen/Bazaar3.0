---
status: reviewed
reviewed-date: 2026-08-17
---

# API: Auth

Authentifizierung der Voranmelde-App. Alle Endpoints sind `public` — sie sind
der Weg *zu* einem Token, nicht durch eines geschützt.

Querschnitts-Regeln (Fehlerform, Status-Codes, Header) →
[`cross-cutting.md`](cross-cutting.md).

Epic → [Epic_Login](../epics/Epic_Login/epic.md) ·
Entities → [`verkaeufer.md`](../entities/verkaeufer.md), [`refresh-token.md`](../entities/refresh-token.md) ·
Frontend-Infrastruktur → [VSHELL-S04](../epics/Epic_App_Shell/stories/VSHELL-S04-auth-infrastruktur.md)

---

## Endpoints

| Endpoint | Auth | Zweck |
|---|---|---|
| `POST /api/auth/login` | `public` | Anmeldung mit E-Mail + Passwort |
| `POST /api/auth/register` | `public` | Selbstregistrierung eines neuen Verkäufers |
| `POST /api/auth/refresh` | `public` | Neues Access-Token gegen gültiges Refresh-Token |
| `POST /api/auth/set-password` | `public` | Erstpasswort über Admin-Invite-Token setzen |

---

## Einheitliche Token-Response

Alle vier Endpoints antworten im Erfolgsfall mit **derselben** Hülle:

```json
{
  "accessToken": "eyJhbGciOi…",
  "refreshToken": "eyJhbGciOi…"
}
```

**Kein `role`, kein `expiresIn`** — beides steht bereits im JWT-Payload und
würde als zweite Quelle auseinanderlaufen. Das Frontend liest `role` und `exp`
aus dem Token (VSHELL-S04 AC-2/AC-3).

---

## 1. `POST /api/auth/login`

**Request**
```json
{ "email": "anna@example.com", "password": "geheim123" }
```

**Response `200`** — Token-Hülle (siehe oben)

**Fehler**

| Code | `detail` |
|---|---|
| `400` | Validierung (`errors.email` / `errors.password`) |
| `401` | „Ungültige Anmeldedaten" — bewusst ohne Unterscheidung, ob E-Mail oder Passwort falsch ist (Epic_Login AC-2) |

---

## 2. `POST /api/auth/register`

**Request**
```json
{ "email": "anna@example.com", "password": "geheim123" }
```

Kein Verkäufer-Typ im Request — die Zuordnung passiert serverseitig über
`defaultTypeId` aus den [Einstellungen](settings.md).

**Serverseitige Nebenwirkungen** (Epic_Login AC-10):
1. Verkäufer-Datensatz anlegen, `sellerTypeId = defaultTypeId`
2. `defaultBlockCount` zusammenhängende Nummernblöcke ab der nächsten freien
   Nummer reservieren — **derselbe** `NumberBlockAllocator` wie bei
   `POST /api/sellers` (siehe [`sellers.md`](sellers.md), [`blocks.md`](blocks.md));
   die Vergaberegel ist nicht zweimal implementiert
3. Token ausstellen — der Nutzer ist ohne zweiten Login-Schritt angemeldet

**Response `201`** — Token-Hülle

**Fehler**

| Code | `detail` |
|---|---|
| `400` | Validierung — Passwortstärke mindestens „Mittel" (Epic_Login §6) |
| `409` | `errorCode: seller.email_taken` — „Diese E-Mail ist bereits registriert" (AC-8) |
| `409` | `errorCode: registration.not_enabled` — „Registrierung ist noch nicht freigeschaltet", wenn `defaultTypeId` in den Einstellungen nicht gesetzt ist. Ohne Typ kann das Pflichtfeld `sellerTypeId` nicht gefüllt werden (siehe [`entities/verkaeufer.md`](../entities/verkaeufer.md)). |

---

## 3. `POST /api/auth/refresh`

**Request**
```json
{ "refreshToken": "eyJhbGciOi…" }
```

**Response `200`** — Token-Hülle mit **neuem** Access- **und** Refresh-Token
(Rotation).

### Serverseitige Ablage des Refresh-Tokens

Die Rotation ist nur echt, wenn das alte Token danach **nicht mehr** funktioniert.
Die Ablage ist eine **eigene Tabelle** — eine Zeile pro aktiver Sitzung, siehe
[`entities/refresh-token.md`](../entities/refresh-token.md). Gespeichert wird
ausschließlich der SHA-256-Hash, nie das Token selbst.

1. `/login`, `/register` und `/set-password` legen eine neue Zeile an und löschen
   dabei die abgelaufenen Zeilen desselben Verkäufers.
2. `/refresh` sucht die Zeile zum Hash des eingereichten Tokens, löscht sie und legt
   in derselben Transaktion eine neue an. Ein zweiter Aufruf mit demselben Token
   findet keine Zeile mehr → `401`.
3. `PUT /api/profile/password` löscht **alle** Zeilen des Verkäufers — der
   Passwortwechsel meldet damit jedes Gerät ab.
4. `DELETE /api/profile` und `DELETE /api/sellers/{id}` löschen die Zeilen als Teil
   ihrer Kaskade.

**Mehrgeräte-Betrieb.** Handy, Laptop und Tablet haben je eine eigene Zeile und
rotieren unabhängig voneinander; ein Login entwertet die anderen Sitzungen nicht.
Pro Verkäufer bleiben maximal **5** aktive Zeilen — beim Anlegen der sechsten fällt
die älteste (`createdAt`) heraus. Das begrenzt die Tabelle, ohne im Alltag
aufzufallen, und deckelt gleichzeitig den Schaden gestohlener Tokens.

**Nicht enthalten:** eine Geräte-Übersicht in der UI („hier bist du angemeldet") und
das gezielte Abmelden einer einzelnen Sitzung. Beides ist mit dieser Tabelle
nachrüstbar (`lastUsedAt` liegt dafür bereits vor), aber kein MVP-Bedarf.

**Fehler**

| Code | Bedeutung |
|---|---|
| `401` | Refresh-Token unbekannt, abgelaufen oder bereits rotiert → Frontend führt `logout()` aus und navigiert nach `/login` (VSHELL-S04 AC-11) |

---

## 4. `POST /api/auth/set-password`

Abschluss des Admin-Invite-Flows: Der Admin legt den Verkäufer ohne Passwort an
und übergibt einen Einladungs-Link (siehe [`sellers.md`](sellers.md),
Epic_Verkaeufer Panel 05). Diese Route setzt das Erstpasswort.

**Request**
```json
{ "inviteToken": "6f3a…", "password": "geheim123" }
```

**Response `200`** — Token-Hülle; der Verkäufer ist danach regulär angemeldet.

**Serverseitig:** `inviteToken` und `inviteTokenExpiresAt` werden auf `null`
gesetzt — das Token ist einmalig verwendbar
(siehe [`entities/verkaeufer.md`](../entities/verkaeufer.md)).

**Fehler**

| Code | Bedeutung |
|---|---|
| `400` | Passwort erfüllt die Stärke-Anforderung nicht |
| `401` | Token unbekannt, bereits verbraucht oder älter als 7 Tage |

---

## Token-Eigenschaften

| Thema | Wert |
|---|---|
| Verfahren | JWT, Bearer |
| Claims | `sub` (User-ID), `role` (`admin` \| `seller`), `exp` |
| Access-Token-Lebensdauer | 5 Tage |
| Refresh-Token-Lebensdauer | 30 Tage |
| Passwort-Hashing | bcrypt oder Argon2 — kein Klartext; Ablage im Feld `passwordHash` des Verkäufers (`null`, solange nur eingeladen) |
| Refresh-Token-Ablage | Eigene Tabelle `refresh_token`, eine Zeile pro Sitzung, max. 5 je Verkäufer (siehe Abschnitt 3) |
| Storage (Frontend) | `localStorage`: `bazaar_token` (Access), `bazaar_refresh_token` (Refresh) |

---

## Bewusst nicht enthalten (MVP)

Aus Epic_Login §8 sowie den Entscheidungen dieser Extraktion:

- **`POST /api/auth/logout`** — Logout ist rein clientseitig (Tokens aus dem
  `localStorage` löschen, VSHELL-S04 AC-9). Serverseitige Invalidierung des
  **Access**-Tokens bräuchte eine Blacklist; kein MVP-Bedarf. Die zurückgelassene
  Refresh-Zeile ist ohne den Token-Klartext nicht nutzbar und wird beim nächsten
  Login desselben Verkäufers mit aufgeräumt. Nachrüstbar ist der serverseitige
  Logout jederzeit — eine Zeile löschen.
- **Geräte-Übersicht und gezieltes Abmelden einzelner Sitzungen** — die Tabelle gibt
  die Daten her (`createdAt`, `lastUsedAt`), die UI dafür ist kein MVP-Thema.
- Brute-Force-Schutz (Rate-Limiting/Lockout)
- E-Mail-Verifizierung / Double-Opt-in
- Captcha/Spam-Schutz
- Self-Service-Passwort-Reset per E-Mail (aktuell nur Admin-Invite)

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #auth #jwt #login #registrierung #refresh-token #invite
