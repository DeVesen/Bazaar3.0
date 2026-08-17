---
status: reviewed
reviewed-date: 2026-08-17
---

# Entity: Refresh-Token

Nur in dieser App. Verbindliche Quelle; Index → [overview.md](overview.md).

Ein Datensatz pro **aktiver Sitzung**. Die Tabelle ersetzt das frühere Einzelfeld
`refreshTokenHash` am Verkäufer: Mit einem Feld konnte nur ein Gerät gleichzeitig
angemeldet bleiben, ein Login auf dem Handy entwertete den Laptop.

Feldnamen englisch, Doku-Prosa deutsch (Sprachregel → [`spec.md`](../spec.md) Abschnitt 10.0.1).

## Felder

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | In der Domäne erzeugt |
| `sellerId` | string (8 Zeichen) | ✅ | ID-Referenz auf den Verkäufer, **kein** Navigations-Property zurück |
| `tokenHash` | string | ✅ | SHA-256 des ausgegebenen Refresh-Tokens, **unique**. Nie der Klartext — ein DB-Leak gibt damit keine gültigen Tokens her |
| `expiresAt` | DateTime | ✅ | 30 Tage nach Ausgabe (siehe [`api/auth.md`](../api/auth.md)) |
| `createdAt` | DateTime | ✅ | Ausgabezeitpunkt |
| `lastUsedAt` | DateTime? | — | Letzter erfolgreicher `/refresh`-Aufruf. Rein informativ (Support-Frage „wann war das Gerät zuletzt aktiv") |

**Constraints:**
- `tokenHash` unique über die gesamte Tabelle.
- Index auf `sellerId` — jede Sitzungs-Operation filtert danach.

## Lebenszyklus

| Auslöser | Wirkung |
|---|---|
| `POST /api/auth/login` \| `/register` \| `/set-password` | Neue Zeile. Abgelaufene Zeilen **desselben** Verkäufers werden dabei gelöscht — Aufräumen ohne Hintergrundjob |
| `POST /api/auth/refresh` | Zeile zum eingereichten Hash löschen, neue Zeile anlegen (eine Transaktion). Ein zweiter Aufruf mit demselben Token findet keine Zeile mehr → `401` |
| `PUT /api/profile/password` | **Alle** Zeilen des Verkäufers löschen — Passwortwechsel meldet überall ab |
| `DELETE /api/profile` \| `DELETE /api/sellers/{id}` | Alle Zeilen des Verkäufers löschen (Teil der Kaskade) |
| Mehr als 5 aktive Zeilen | Älteste (`createdAt`) beim Anlegen löschen — begrenzt die Tabelle, ohne dem Nutzer im Weg zu stehen |

Kein Client-Logout-Endpoint: Beim Logout löscht das Frontend seine Tokens
(VSHELL-S04 AC-9), die Zeile bleibt bis `expiresAt` liegen und wird beim nächsten
Login desselben Verkäufers mit aufgeräumt. Nachrüstbar ist ein serverseitiger Logout
jederzeit — eine Zeile löschen.

## Verortung im Backend

Eigenes Aggregate mit Port `IRefreshTokenRepository` (`Bazaar.Domain/Ports/`).
Die Hash-Bildung ist eine reine Funktion in der Domäne; das Ausstellen des JWT
selbst bleibt im Adapter (`Bazaar.Infrastructure`), weil es Signaturschlüssel braucht.

## Verwendung

- [Epic_Login](../epics/Epic_Login/epic.md) — Token-Ausgabe, Rotation
- [Epic_Profil](../epics/Epic_Profil/epic.md) — Passwortwechsel, Account-Löschung
- [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) — Löschkaskade durch den Admin
- [VSHELL-S04](../epics/Epic_App_Shell/stories/VSHELL-S04-auth-infrastruktur.md) — Client-Seite des Refresh-Flows

## Tags & Piles

**Tags:** #entity #refresh-token #auth #session #datenmodell
