---
status: reviewed
reviewed-date: 2026-08-14
---

# Entity: Verkäufer

Voranmelde-App-Sicht — kanonische Quelle: [entities.md](../../entities.md).

## Felder

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | Backend-generiert, Unique-Check gegen DB vor Insert |
| `vorname` | string | ✅ | |
| `nachname` | string | ✅ | |
| `anschrift` | string | ❌ | Optional |
| `plz` | string | ✅ | Kein Format-Constraint (D-A-CH uneinheitlich, YAGNI) |
| `ort` | string | ✅ | |
| `telefon` | string | ✅ | Kein Format-Constraint |
| `email` | string | ✅ | = Login, unique über alle Verkäufer, Format-validiert |
| `verkaueferTypeId` | string (8 Zeichen) | ✅ | FK auf Verkäufer-Typ (Id, nicht Bezeichnung — bleibt stabil bei Umbenennung) |
| `istAdmin` | bool | ✅ | Default `false`. Quelle des `role`-Claims im JWT (`true` → `admin`, sonst `seller`). Gepflegt über die Checkbox „Admin-Rechte" in Epic_Verkaeufer Panel 05 |
| `inviteToken` | string? | — | UUID, einmalig verwendbar, wird bei `set-password` konsumiert |
| `inviteTokenExpiresAt` | DateTime? | — | 7 Tage nach Generierung; bei Konsum/Ablauf auf `null` |

**Nicht in der Voranmelde-App** (nur Haupt-App, kein Override — Q0-Entscheidung): `umsatzVerkaufsprovision`, `gebuehrProStueck`, `abgerechnetAm`.

## Verwendung

- [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) — Verwaltung durch Admin, Einladungsmechanismus
- [Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md) — referenzierte Verkäufer-Typen
- [Epic_Login](../epics/Epic_Login/epic.md) — `email` als Login-Identifier, `inviteToken` für Registrierung
- [Epic_Profil](../epics/Epic_Profil/epic.md) — Selbstbearbeitung durch Verkäufer
- [Epic_Export](../epics/Epic_Export/epic.md) — Export-Format enthält Verkäuferdaten

## Tags & Piles

**Tags:** #entity #verkaeufer #datenmodell
