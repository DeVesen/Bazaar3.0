---
round: Round-3
status: geklärt
---

# Spec: Round 3 — EF Core & Datenbankanbindung

## Fein-Spezifikation

### Ziel

Persistenzschicht der Haupt-App: `BazaarDbContext` in `Bazaar.Infrastructure`, PostgreSQL
per `Npgsql.EntityFrameworkCore.PostgreSQL`, `MigrateAsync()` bei jedem Start mit
Wartelogik, `EnableRetryOnFailure(3)`, DB-Check im `/health`-Endpoint, Repository- und
Fluent-API-Mapping-Muster als Vorlage für die fachlichen Epics. Keine fachlichen
Entities, keine Seed-Daten (letztere: Epic_Login).

### Reihenfolge-Hinweis: Round-3 vor Round-4, obwohl BPROJ-S04 formal BPROJ-S03 voraussetzt

BPROJ-S04 (diese Story) nennt in „Abhängigkeiten" auch BPROJ-S03 (Docker-Compose-DB,
Round 4) — Grund: `dotnet ef` läuft vom Host gegen `localhost:5432`. Die Roadmap-Slicing
ordnet Round 3 aber **vor** Round 4 ein ([`Round-4/round.md`](../Round-4/round.md)
„Voraussetzung": „Datenbankanbindung bereits existieren"). Kein Widerspruch, sondern
eine Implementierungsreihenfolge-Frage:

Für Round-3 selbst genügt **irgendeine** lokal erreichbare PostgreSQL-Instanz auf
`localhost:5432` zum Entwickeln/Verifizieren der Migration — z. B. ein Wegwerf-Container
(`docker run --rm -p 5432:5432 -e POSTGRES_PASSWORD=dev postgres:17`), **nicht** das
endgültige Compose-Setup aus BPROJ-S03/Round-4. Der `ConnectionStrings__DefaultConnection`
zeigt in beiden Fällen auf dieselbe Adresse, sodass Round 4 später nichts an
`BazaarDbContext` ändern muss — nur den Betrieb der DB selbst (Compose statt Wegwerf-
Container) ersetzt.

### Änderung an Round-2/BPROJ-S02: `/health`-Verhalten

BPROJ-S04 sagt explizit: „Das ändert BPROJ-S02 AC-7, wo `/health` als statische Antwort
beschrieben war." Der in [Round-2/plan.md](../Round-2/plan.md) Schritt 10 angelegte
`/health`-Endpoint wird in Round-3 **erweitert**, nicht neu gebaut — aus dem generischen
`Results.Ok(...)` wird `AddHealthChecks().AddDbContextCheck<BazaarDbContext>()`.

### Akzeptanzkriterien

Wie in [BPROJ-S04](../../../requirements/bazaar-app/epics/Epic_Projektanlage/stories/BPROJ-S04-efcore-datenbank-setup.md)
AC-1 bis AC-9, unverändert übernommen (inkl. AC-4b Fluent-API-Pflicht, AC-8
Execution-Strategy-Pflicht für alle fünf Transaktions-Endpoints — Letztere entstehen erst
in fachlichen Epics, das Muster/die Regel gilt aber ab hier).

### Bewusst nicht in diesem Round

Fachliche Entities (Artikel, Verkäufer, Marken, Kategorien, Verkäufer-Typen, Benutzer),
Seed-Admin (Epic_Login), Docker-Compose-Datenbankdienst selbst (Round 4).

