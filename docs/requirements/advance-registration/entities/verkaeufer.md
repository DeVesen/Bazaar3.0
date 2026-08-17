---
status: reviewed
reviewed-date: 2026-08-17
---

# Entity: Verkäufer

Verbindliche Quelle für diese App; Index → [overview.md](overview.md).

## Felder

Feldnamen englisch, Doku-Prosa deutsch (Sprachregel → [`spec.md`](../spec.md) Abschnitt 10.0.1).

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | In der Domäne erzeugt, Unique-Check gegen DB vor Insert |
| `firstName` | string | ✅ | Vorname |
| `lastName` | string | ✅ | Nachname |
| `address` | string | ❌ | Anschrift, optional |
| `postalCode` | string | ✅ | Kein Format-Constraint (D-A-CH uneinheitlich, YAGNI) |
| `city` | string | ✅ | Ort |
| `phone` | string | ✅ | Kein Format-Constraint |
| `email` | string | ✅ | = Login, unique über alle Verkäufer, Format-validiert |
| `sellerTypeId` | string (8 Zeichen) | ✅ | Referenz auf Verkäufer-Typ (Id, nicht Name — bleibt stabil bei Umbenennung) |
| `isAdmin` | bool | ✅ | Default `false`. Quelle des `role`-Claims im JWT (`true` → `admin`, sonst `seller`). Gepflegt über die Checkbox „Admin-Rechte" in Epic_Verkaeufer Panel 05 |
| `passwordHash` | string? | — | bcrypt/Argon2-Hash. `null` = per Invite angelegt, Passwort noch nicht gesetzt — damit deckt ein Feld den Invite-Zustand mit ab, ohne zweites Flag |
| `inviteToken` | string? | — | UUID, einmalig verwendbar, wird bei `set-password` konsumiert |
| `inviteTokenExpiresAt` | DateTime? | — | 7 Tage nach Generierung; bei Konsum/Ablauf auf `null` |

**Refresh-Tokens hängen nicht am Verkäufer**, sondern in einer eigenen Tabelle
([`refresh-token.md`](refresh-token.md)) — eine Zeile pro aktiver Sitzung, damit ein
Nutzer auf mehreren Geräten angemeldet bleiben kann.

`passwordHash` und `inviteToken` verlassen die Domäne **nie** über einen Response — die
DTOs in [`sellers.md`](../api/sellers.md) und [`profile.md`](../api/profile.md) führen
sie nicht.

**Nicht in der Voranmelde-App** (nur Haupt-App, kein Override — Q0-Entscheidung): die Abrechnungsfelder (Verkaufsprovision, Gebühr pro Stück, abgerechnet am).

**Aggregate-Zuschnitt:** `Seller` ist ein Aggregate ohne Block- und ohne Token-Collection — Nummernblöcke ([`nummernblock.md`](nummernblock.md)) und Refresh-Tokens ([`refresh-token.md`](refresh-token.md)) sind eigene Aggregates. Blöcke, weil ihre Invariante über alle Verkäufer hinweg gilt; Tokens, weil sie einen anderen Lebenszyklus haben (Minuten bis Wochen) und beim Laden eines Verkäufers nichts beitragen.

## Verwendung

- [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) — Verwaltung durch Admin, Einladungsmechanismus
- [Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md) — referenzierte Verkäufer-Typen
- [Epic_Login](../epics/Epic_Login/epic.md) — `email` als Login-Identifier, `inviteToken` für Registrierung
- [Epic_Profil](../epics/Epic_Profil/epic.md) — Selbstbearbeitung durch Verkäufer
- [Epic_Export](../epics/Epic_Export/epic.md) — Export-Format enthält Verkäuferdaten

## Tags & Piles

**Tags:** #entity #verkaeufer #datenmodell
