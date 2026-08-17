---
status: reviewed
reviewed-date: 2026-08-17
---

# Datenmodell — Voranmelde-App

**Verbindliche Quelle des Datenmodells dieser App.** Jede Entität hat eine eigene Datei
mit vollständiger Feldtabelle; dieses Verzeichnis ist damit ohne Dokumente außerhalb von
`docs/requirements/advance-registration/` lesbar.

| Entität | Datei | Kurz |
|---|---|---|
| Verkäufer | [verkaeufer.md](verkaeufer.md) | Stammdaten, Login-Identität, Invite-Zustand |
| Refresh-Token | [refresh-token.md](refresh-token.md) | Eine Zeile pro aktiver Sitzung |
| Artikel | [artikel.md](artikel.md) | Vorab erfasster Artikel, ohne Status |
| Nummernblock | [nummernblock.md](nummernblock.md) | Vergebener Nummernbereich, eigenes Aggregate |
| Verkäufer-Typ | [verkaeufer-typ.md](verkaeufer-typ.md) | Einzige Quelle der Konditionen |
| Marke | [marke.md](marke.md) | Stammdatum, denormalisiert im Artikel |
| Kategorie | [kategorie.md](kategorie.md) | Stammdatum, denormalisiert im Artikel |
| Einstellungen | [einstellungen.md](einstellungen.md) | Singleton: Termine, Default-Typ, Nummern-Parameter |

**Sprachregel:** Feldnamen englisch, Doku-Prosa deutsch — siehe
[`spec.md`](../spec.md) Abschnitt 10.0.1.

**IDs:** 8-stellige alphanumerische ID, in der Domäne erzeugt, Unique-Check gegen die DB
vor dem Insert (`spec.md` Abschnitt 11.5).

**Aggregate-Schnitt:** `Seller`, `Article`, `NumberBlock`, `RefreshToken`, die beiden
Stammdaten und `Settings` sind je ein eigenes Aggregate. Referenzen zwischen ihnen sind
reine IDs ohne Navigations-Properties — Blöcke und Tokens hängen nicht am Verkäufer, weil
ihre Invarianten bzw. Lebenszyklen andere sind.

## Übergabe an die Haupt-App

Der einzige Berührungspunkt ist die Export-Datei; ihr Schema steht in
[`api/export.md`](../api/export.md). Die Feldtabellen der Haupt-App liegen in
`docs/requirements/bazaar-app/entities/` und gelten unabhängig von diesen hier.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #entities #datenmodell #overview #aggregate
