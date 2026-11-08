# Migration: von zwei Apps zur Suite

Status: Entwurf · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [zielbild](zielbild.md) · [roadmap](../roadmap.md) · [leitplanken](../leitplanken.md) (L10)
Entscheidungen: E0, E2, E15
Schlagworte: Migration, Umzug, Altlasten, V1, V2, V3, V4, V5, V6, V7, V8, V9, V10, B1, Doppelverkauf, Import-Fehler, Umnummerieren, Präfix, Datenübernahme, Rückfallebene, Strangler

## Zweck und Abgrenzung

Hier steht, **wie wir von heute zur Suite kommen**, ohne einen Basar zu gefährden: Altlasten,
Code-Zusammenführung, Datenübernahme und Rückfallebene. Die zeitliche Abfolge steht in der [Roadmap](../roadmap.md).

## Heute

Zwei unterschiedlich gebaute Backends:
- Voranmeldung: modularer Monolith (`BAR.*`), vier Schemas, snake_case.
- Haupt-App: Schichten-Hexagon (`Bazaar.*`), Schema `public`, PascalCase.

Dazu die Altlasten aus der Analyse unten.

## Ziel

### Code

- Die Suite übernimmt das **Modul-Muster der Voranmeldung**: Modul je Fachbereich, Schema je Modul, veröffentlichte Schnittstellen, Architekturtests.
- Die Fachlogik der Haupt-App (Annahme, Kasse, Abrechnung, Druck, Statistik) wandert **schrittweise** in Module. Bestehende Ports und Handler werden dabei mitgenommen, nicht neu geschrieben.
- Ein gemeinsames Präfix und eine Solution für die Suite festlegen. Die heutigen Präfixe `BAR.` und `Bazaar.` lösen sich auf (offen, siehe unten).

### Daten

- **Start mit einem neuen Basar** im neuen Bestand. Die Verkäuferkonten der Voranmeldung werden übernommen, die Altdaten der Haupt-App archiviert.
- Duplikate bereinigen, bevor Constraints greifen: Marken/Kategorien mit Unterschied nur in Groß- und Kleinschreibung, Verkäufer-Typ-Namen, Artikelnummern.
- Eine einheitliche Namenskonvention (snake_case, Schemas) und neue Migrationsstränge.

### Rückfallebene

- Bis die Suite einen Basar stabil getragen hat, bleiben die **heutigen Apps samt Datei-Weg** einsatzbereit.
- Die Entscheidung für den Echtbetrieb fällt nach einer Generalprobe (Go/No-Go je Etappe in der [Roadmap](../roadmap.md)).

### Altlasten (aus der Code-Analyse, am Code geprüft)

| # | Befund | In der Suite | Vorher in heutigen Apps beheben? |
|---|---|---|---|
| V1 | Umnummerieren in der Annahme löscht den Artikel und legt ihn neu an (`Bazaar.Application/Intake/IntakeHandler.cs`) | entfällt durch zwei Nummernfelder | ja, klein (`Article.Renumber` existiert) |
| V2 | Erneuter Import löscht abgegebene, unverkaufte Artikel samt Annahmegebühr (`Bazaar.Application/Import/RunImportHandler.cs`) | entfällt (kein Import mehr) | **ja, sofort**, solange importiert wird |
| V3 | Abrechnung löscht nicht abgegebene Artikel, abwählbar (`SettleSellerHandler.cs`) | wird zum Zustand „Nicht abgegeben“ | nein |
| V4 | Kein Basar-Konzept (`BAR.Modules.Operations/Domain/Settings.cs`) | Basar-Konzept (L9) | nein |
| V5 | Doppelverkauf an zwei Kassen möglich, kein Concurrency-Token (`RecordSaleHandler.cs`, `EfUnitOfWork.cs`) | von Anfang an abgesichert | **ja, sofort** |
| V6 | Voranmelde-Nummer ohne DB-Eindeutigkeit; Blöcke sind per Exclusion-Constraint abgesichert | Constraint je Basar | nein |
| V7 | Termine nur angezeigt, nicht durchgesetzt (`GetPublicInfoQueryHandler.cs`) | durchgesetzt (Basar-Termine) | nein |
| V8 | Vorangemeldete Artikel bekommen nie „angenommen“ gesetzt (`Bazaar.Domain/Article/Article.cs`) | Annahme setzt den Zustand einheitlich | nein |
| V9 | Login-Token 5 Tage, kein Schutz gegen Passwort-Raten (`JwtOptions.cs`, `BAR.Host/Program.cs`) | gemeinsame Identität mit kurzen Tokens und Rate-Limit | ja, vor weiteren Basaren |
| V10 | Voranmeldung nur als eine Instanz lauffähig (`AdminBootstrapState`) | entfällt | nein |
| B1 | Keine Datensicherung, `:latest`-Images | siehe [betrieb](betrieb.md) | **ja, sofort** |

## Berührungspunkte

- [roadmap](../roadmap.md): Etappen 1 (Härten) und 2–4 (Umzug)
- [datenmodell](../querschnitt/datenmodell.md): Zielschema
- [api-konventionen](../querschnitt/api-konventionen.md): Verträge für die heutigen Frontends

## Offene Fragen

1. Präfix und Namen der Suite-Assemblies (z. B. `Bazaar.Suite.*` oder `Suite.*`). Danach CLAUDE.md und die Specs anpassen.
2. Repository-Aufbau: ein Ordner `src/suite/` oder Umbau innerhalb der bestehenden Ordner?
3. Werden Verkäuferkonten aus der Voranmeldung **komplett** übernommen oder nur aktive?

## Nächste Planungsschritte

- Modulschnitt (siehe [zielbild](zielbild.md)) und Präfix entscheiden.
- Liste der Daten, die übernommen bzw. archiviert werden.
