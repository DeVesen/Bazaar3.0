---
id: DOC-002
status: draft
updated: 2026-08-17
---

# Datenmodell — Suite-Übersicht

**Diese Datei enthält keine verbindlichen Feldtabellen mehr.** Das Datenmodell jeder App
steht in deren eigenem Verzeichnis, damit `docs/requirements/<app>/` vollständig für sich
kopierbar bleibt:

| App | Verbindliche Quelle |
|---|---|
| Voranmelde-App | [`advance-registration/entities/overview.md`](advance-registration/entities/overview.md) |
| Haupt-App | [`bazaar-app/entities/overview.md`](bazaar-app/entities/overview.md) |

Diese Seite dient nur der Orientierung: welche Entität in welcher App existiert und wo
sich die Fassungen unterscheiden. Bei Widerspruch gewinnt immer die App-Datei.

---

## Wer hat was

| Entität | Voranmelde-App | Haupt-App | Wesentlicher Unterschied |
|---|---|---|---|
| **Artikel** | ✅ | ✅ | Haupt-App zusätzlich `alternativePrice` und die vier Status-Zeitstempel (`acceptedAt`, `releasedAt`, `soldAt`, `returnedAt`); in der Voranmelde-App ist jeder Artikel implizit „registriert" |
| **Verkäufer** | ✅ | ✅ | Voranmelde-App: Login-Identität (`passwordHash`, Invite-Felder, `isAdmin`). Haupt-App: eigene Konditionsfelder (`salesCommission`, `feePerItem`) und `settledAt` |
| **Verkäufer-Typ** | ✅ | ✅ | Voranmelde-App: einzige Quelle der Konditionen. Haupt-App: nur Vorlage, überschreibbar am Verkäufer |
| **Marke / Kategorie** | ✅ | ✅ | Gleiche Felder (`name`, `original`); `original` bedeutet in der Voranmelde-App „während der Voranmeldephase angelegt", in der Haupt-App „am Basar-Tag angelegt" |
| **Nummernblock** | ✅ | — | Nummernvergabe passiert ausschließlich vorab |
| **Refresh-Token** | ✅ | — | Nur die Voranmelde-App hat eine Anmeldung |
| **Einstellungen** | ✅ (Entity) | Parameter | Haupt-App hält ihre Parameter lokal, nicht als Entity (`bazaar-app/spec.md` Abschnitt 8) |

## Gemeinsame Konventionen

Beide Apps folgen denselben zwei Regeln — jeweils in ihrer eigenen Spec festgeschrieben,
hier nur zusammengefasst:

- **Feldnamen englisch**, Doku-Prosa deutsch
  ([Voranmelde-App §10.0.1](advance-registration/spec.md), [Haupt-App §7.0.1](bazaar-app/spec.md))
- **IDs**: 8-stellige alphanumerische ID, case-sensitive, backend-generiert. Beim Import
  übernimmt die Haupt-App die IDs der Voranmelde-App unverändert

## Übergabepunkt

Der einzige Berührungspunkt der Datenmodelle ist die JSON-Datei zwischen den Apps —
beidseitig dokumentiert, damit keine Seite auf die andere angewiesen ist:

| Richtung | Dokument |
|---|---|
| Schreiben (Export) | [`advance-registration/api/export.md`](advance-registration/api/export.md) |
| Lesen (Import) | [`bazaar-app/entities/import-format.md`](bazaar-app/entities/import-format.md) |

Ändert sich das Schema, müssen **beide** Dateien angepasst werden.

## Tags & Piles

**Piles:** #pile/docs
**Tags:** #entities #datenmodell #übersicht #export-format
