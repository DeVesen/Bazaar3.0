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

## Zeitstempel und Zeitzone

**Gespeichert wird ausschließlich UTC** — Spaltentyp `timestamp with time zone`
(`timestamptz`), Werte als `DateTime` mit `Kind = Utc`.

Harte Grenze des Stacks, keine bloße Konvention: Npgsql wirft eine Ausnahme, wenn in eine
`timestamptz`-Spalte ein `DateTime` mit `Kind = Local` oder `Unspecified` geschrieben wird.

**Anzeige in lokaler Zeit** (Europe/Berlin), umgerechnet ausschließlich im Frontend. Für diese
App wichtiger als für die Haupt-App: Die fünf Basar-Termine und der Countdown werden über
Wochen hinweg angezeigt, also **über die Sommerzeit-Umstellung hinweg**. Lokal gespeicherte
Zeitstempel würden dabei um eine Stunde springen.

Betrifft alle Zeitstempel, insbesondere die Termine in `Settings` und `createdAt`/`updatedAt`
der Artikel (Grundlage der Aktivitäts-Heatmap).

---

## Dezimal-Präzision

| Verwendung | Typ | Felder |
|---|---|---|
| Geldbeträge | `decimal(10,2)` | `itemFee` |
| Prozentsätze | `decimal(5,2)` | `commissionRate` |

EF Core mappt `decimal` ohne Angabe auf PostgreSQL `numeric` **ohne** Präzision — dann steht
12,499999 in der Datenbank, während die Anzeige 12,50 zeigt.

Diese App führt **keine** eigenen Konditionsfelder am Verkäufer; Provision und Gebühr kommen
immer aus dem Typ ([verkaeufer-typ.md](verkaeufer-typ.md)). Entsprechend gibt es hier weniger
Geldfelder als in der Haupt-App.

---

## Feldlängen

**Identisch mit der Haupt-App** — verbindliche Tabelle in
[`bazaar-app/entities/overview.md`](../../bazaar-app/entities/overview.md) Abschnitt
„Feldlängen".

Die Werte **müssen** übereinstimmen: Der JSON-Export überträgt dieselben Felder
([export.md](../api/export.md)). Wäre eine Grenze hier weiter, würde ein hier gültiger Wert
beim Import in die Haupt-App scheitern — und zwar erst am Basar-Morgen, wenn niemand mehr Zeit
hat, ihn zu kürzen.

Zusätzlich nur in dieser App: `infoText` mit **4000** Zeichen
([einstellungen.md](einstellungen.md)) — dort begründet, weil er als Markdown gerendert wird.

**Serverseitig geprüft** (`400` mit Feldfehler), im Formular zusätzlich als `maxlength`.

---

## Übergabe an die Haupt-App

Der einzige Berührungspunkt ist die Export-Datei; ihr Schema steht in
[`api/export.md`](../api/export.md). Die Feldtabellen der Haupt-App liegen in
`docs/requirements/bazaar-app/entities/` und gelten unabhängig von diesen hier.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #entities #datenmodell #overview #aggregate
