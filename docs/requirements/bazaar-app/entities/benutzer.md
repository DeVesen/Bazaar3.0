---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Entity: Benutzer

Haupt-App-Sicht. Verbindliche Quelle für diese App; Index → [overview.md](overview.md).

Feldnamen englisch, Doku-Prosa deutsch (Sprachregel → [`spec.md`](../spec.md) Abschnitt 7.0.1).

## Felder

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | Alphanumerisch, unique |
| `username` | string | ✅ | Anmeldename, unique case-insensitive. **Keine E-Mail** — im LAN hat Kassenpersonal keine dienstliche Adresse, und ein kurzer Name ist am Basar-Morgen schneller getippt |
| `passwordHash` | string | ✅ | ASP.NET `PasswordHasher<T>`; kein Klartext, keine reversible Verschlüsselung |
| `role` | enum | ✅ | `admin` oder `cashier` — genau zwei Rollen, Rechte-Matrix → [`spec.md`](../spec.md) Abschnitt 4.1 |
| `mustChangePassword` | boolean | ✅ | Default `false`. Wird gesetzt beim Anlegen, beim Zurücksetzen durch den Admin und beim Seed-Admin |

## Benutzer sind keine Verkäufer

Ein Benutzer ist ein **Konto zum Anmelden**. Verkäufer melden sich in dieser App nie an — sie
kommen als Datensätze über den JSON-Import oder werden am Annahmetisch erfasst
([verkaeufer.md](verkaeufer.md)). Die beiden Entitäten haben keine Beziehung zueinander.

## Was hier bewusst nicht steht

**Refresh-Tokens.** Es gibt genau ein Access-Token mit 16 Stunden Lebensdauer und keinen
Refresh-Endpoint ([Epic_Login](../epics/Epic_Login/epic.md) Abschnitt 5) — also auch keine
Tabelle für Sitzungen.

**Fehlversuchszähler und Sperrzeitpunkt.** Kein Lockout: Die App läuft im abgeschlossenen LAN,
der Angreifer müsste im Raum stehen, und eine Sperre würde am Basar-Tag mit höherer
Wahrscheinlichkeit die eigene Kassenkraft aussperren.

**E-Mail, Invite-Token, Passwort-Reset-Token.** Ohne Mailserver im LAN gibt es keinen
Zustellweg; der Admin setzt Passwörter direkt.

## Seed-Admin

Existiert kein Benutzer, legt die App beim Start genau ein Admin-Konto aus den
Environment-Variablen `SEED_ADMIN_USER` und `SEED_ADMIN_PASSWORD` an, mit
`mustChangePassword = true`. Damit gibt es weder einen Zustand, in dem niemand hereinkommt,
noch ein Passwort im Repository.

## Verwendung

- [Epic_Login](../epics/Epic_Login/epic.md) — Anmeldung, Passwortwechsel, Seed-Admin
- [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) — Benutzerverwaltung (Oberfläche)
- [Epic_App_Shell](../epics/Epic_App_Shell/epic.md) — Rolle als Token-Claim, Guards

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #entity #benutzer #datenmodell #rollen #authentifizierung
