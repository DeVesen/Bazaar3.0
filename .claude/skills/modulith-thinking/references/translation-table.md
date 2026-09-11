# Rückübersetzung — Unternehmensbild ↔ Fachbegriff

| Unternehmensbild | Fachbegriff | Vertiefung |
|---|---|---|
| Unternehmen | Modulith | `architecture-styles` — Deployment-Achse |
| Fachabteilung | Bounded Context | `software-design-principles` → `references/ddd.md` |
| Aktenablage der Abteilung | eigenes Schema / eigener DbContext | `architecture-styles/references/deployment.md` |
| Anlaufstelle der Abteilung | Port / Contracts-Projekt | `software-design-principles/references/ddd.md` (Repository) |
| Verbindungsstelle über den Abteilungen | Context-Mapping-Schicht (ACL, Open Host Service, Published Language) | `software-design-principles/references/ddd.md` |
| zentrale Koordination vs. eigenständige Reaktion | Orchestrierung vs. Choreografie (In-Process Domain Events) | `architecture-styles/references/data-flow.md` |
| Telefon / E-Mail / Kundenportal | Transport-Adapter (REST, tRPC, SignalR) | — kein Bestandteil der Abteilung |
| Abteilung zieht aus | Modul-Extraktion zu Microservice | `architecture-styles/references/deployment.md` |
| Akte | Aggregate | `software-design-principles/references/ddd.md` |
| Aktenverantwortlicher | Aggregate Root | `software-design-principles/references/ddd.md` |
| Beleg innerhalb der Akte | Entity (nicht-Root) | `software-design-principles/references/ddd.md` |
| reine Angabe | Value Object | `software-design-principles/references/ddd.md` |
| Logbucheintrag | Domain Event | `software-design-principles/references/ddd.md` |
| Vorzimmer | Application-Schicht | `software-design-principles/references/ddd.md` |
| Sachbearbeiter | Domain | `software-design-principles/references/ddd.md` |
| Registratur | Repository / Infrastructure | `software-design-principles/references/ddd.md` |
| Fachreferent ohne eigene Akte | Domain Service | `software-design-principles/references/ddd.md` |
| Konzern | Verbund mehrerer eigenständiger Moduliths/Systeme | — kein einzelner Fachbegriff |
| Tochterunternehmen | eigenständiges System mit eigenem Deployment | `architecture-styles/references/deployment.md` |
| Austauschformat zwischen zwei Firmen | Published Language (Context Mapping) | `software-design-principles/references/ddd.md` |
| Zimmer innerhalb der Abteilung | kompilierbare Einheit mit eigener Referenzgrenze | `dotnet-modulith-bridge` (`.csproj`) · `angular-modulith-bridge` (kein 1:1-Äquivalent) |
