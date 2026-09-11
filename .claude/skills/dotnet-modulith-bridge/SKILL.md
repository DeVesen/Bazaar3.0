---
name: dotnet-modulith-bridge
description: >
  Use when translating the modulith-thinking business model into a concrete .NET
  solution — deciding .csproj/project layout, how many projects a module needs
  ("Zimmertiefe"), Contracts-project boundaries, the SharedKernel, assembly prefixes,
  or how to enforce module boundaries with NetArchTest. Also when scaffolding a new
  .NET backend that should stay ready for a later module extraction.
  Technology bridge — requires `modulith-thinking` for the vocabulary it translates.
  Triggers: @dotnet-modulith-bridge, .csproj-Zuschnitt, Solution-Struktur, wie viele
  Projekte, Contracts-Projekt, Modulith in .NET, SharedKernel.
  Background: setzt `modulith-thinking` voraus; nutzt `architecture-styles`
  (Deployment-/Data-Flow-Achse) und `software-design-principles` (DDD) als Vertiefung.
  Opt-out: ohne dotnet-modulith-bridge.
---

# .NET-Brücke: Modulith-Denken in .NET

Übersetzt das Unternehmensbild aus `modulith-thinking` in eine konkrete .NET-Solution.
**Setzt den anderen Skill voraus** — hier steht nur noch die Technik hinter den Begriffen,
nicht mehr, was sie bedeuten.

---

## Grundriss

| Unternehmensbild | .NET |
|---|---|
| Unternehmen | eine Solution, ein Deployment |
| Abteilung | `<Prefix>.Modules.<Name>` — ein oder mehrere Projekte, je nach Zimmertiefe |
| Zimmer | ein `.csproj` |
| Anlaufstelle | `<Prefix>.Modules.<Name>.Contracts` — einzig von außen referenzierbar |
| Aktenablage | eigenes Schema (oder eigener `DbContext`) je Modul |
| Verbindungsstelle | In-Process-Domain-Event-Dispatch über `SharedKernel` + Outbox je meldendem Modul |
| Transportmittel | Host-Projekt: Minimal-API-Endpoints |
| Konzern / Tochterunternehmen | getrennte Solutions/Repos — nichts in .NET verbindet sie |

---

## Namens-Präfix

Ein Präfix pro Unternehmen (Tochterunternehmen), projektweit festgelegt — sonst kollidieren
Assembly-Namen, sobald ein suite-weites Test- oder Tooling-Projekt entsteht. In dieser Suite:
`BAR.` für die Voranmelde-App, `Bazaar.` für die Haupt-App (Details, falls vorhanden: Projekt-
`CLAUDE.md`).

---

## Host: Composition Root + Transportmittel

Ein Projekt, referenziert alle Module — DI, Konfiguration, Middleware *und* die
Minimal-API-Endpoints in einem. Der Name trägt beide Rollen (`Host`) oder betont die
HTTP-Fläche (`Api`) — projektspezifisch, keine feste Vorgabe dieses Skills.

`Features/<Modulname>/` im Host hält die Endpoints — die rufen **ausschließlich** das
`.Contracts`-Projekt des jeweiligen Moduls auf, nie dessen Domain/Application/Infrastructure
direkt. Jedes Modul bringt dafür eine eigene DI-Erweiterung mit (z. B. `AddAnmeldungModule(...)`),
die `Program.cs` aufruft — das Modul verdrahtet sich selbst, der Host kennt nur den Aufruf.

---

## Wie viele Zimmer je Abteilung

**Default: ein Projekt (Domain/Application/Infrastructure als Ordner) + `.Contracts`.**
Zwei Projekte, nicht vier.

Volle Aufteilung in eigene `.Domain`/`.Application`/`.Infrastructure`-Projekte lohnt sich nur,
wenn beides zutrifft:
- Das Fachmodell ist dicht genug, dass es einen eigenständigen, testwürdigen Algorithmus
  enthält (nicht nur CRUD-Validierung).
- Ein versehentlicher Verstoß gegen die Domain-Reinheit (z. B. eine EF-Core-Referenz in der
  Domäne) soll **beim Tippen** auffallen, nicht erst beim nächsten Testlauf.

Trifft nur eines zu, oder ist die Antwort unklar — beim Default bleiben. Die Reinheit prüft
in beiden Fällen derselbe NetArchTest (siehe unten), nur einmal namespace- und einmal
assembly-gefiltert; der Unterschied ist ausschließlich der Zeitpunkt, zu dem ein Verstoß
auffällt, nicht ob er auffällt.

**`.Contracts` nur, wenn ein zweiter Referenzierer existiert** — dieselbe Faustregel wie bei
Ports allgemein. Ein Modul, das nur der Host aufruft und das sonst niemand referenziert (ein
reiner Export- oder Auswertungsdienst ohne Publikum innerhalb der Solution), braucht kein
eigenes `.Contracts`-Projekt.

---

## Innerhalb eines Zimmers

Wie die Ordner in einem Modul-Projekt liegen, unabhängig davon, ob es ein oder vier
`.csproj` sind (dann gilt dasselbe je Projekt statt je Ordner):

```
<Prefix>.Modules.<Name>/
├── Domain/
├── Application/
│     └── <ein Ordner je Anwendungsfall>
└── Infrastructure/
      ├── DependencyInjection.cs     ← registriert das Modul beim Host
      └── Persistence/
            ├── Repositories/
            ├── Configurations/      (EF Core Fluent API)
            ├── Queries/             (Read-Models, CQRS-Stufe 1/2)
            ├── Migrations/
            └── ErrorTranslation/    (DB-Fehler → Domain-Exceptions)
```

**Fachgruppen-Zwischenordner nur, wenn ein Modul mehrere klar getrennte Fachgruppen hat** —
dann je einer in `Domain/` und `Application/`, mit den Anwendungsfällen darunter statt direkt
darin. Ein Modul mit nur einer Fachgruppe bleibt flach. Dieselbe gestufte Entscheidung wie
die Zimmertiefe selbst — keine feste Regel, sondern „lohnt sich das hier wirklich".

```
<Prefix>.Modules.Anmeldung/
├── Domain/
│     ├── Registrierung/
│     └── Artikelpflege/
├── Application/
│     ├── Registrierung/
│     │     └── <Anwendungsfälle>
│     └── Artikelpflege/
│           └── <Anwendungsfälle>
└── Infrastructure/   (Aufbau wie oben)
```

---

## SharedKernel

Ein Projekt, das jedes Modul referenzieren darf und das selbst nichts referenziert. Enthält
ausschließlich Plumbing — `IDomainEvent`, das Dispatcher-Interface, `IClock` und ähnliche
technische Ports, keine Fachlichkeit. Sobald ein Typ hier Domänensprache trägt, gehört er in
ein Modul, nicht hierher.

---

## Grenzen prüfen statt dokumentieren

Ein Architektur-Testprojekt (NetArchTest) prüft, was der Compiler allein nicht erzwingt —
kein Modul referenziert das Domain-/Application-/Infrastructure-Projekt eines anderen Moduls,
nur dessen `.Contracts`. Bei einem Ein-Projekt-Modul dieselbe Prüfung, nur nach Namespace statt
nach Assembly gefiltert. Vorbild: das bestehende `DependencyDirectionTests`-Muster, erweitert
um die Modulgrenze.

---

## Persistenz je Modul

Eigenes Schema je Modul in einer Datenbank ist der pragmatische Standard — ein
Connection-String, ein Compose-Service. Ein eigener `DbContext` je Modul ist der teurere
Schritt, der bei einem späteren Auszug nichts mehr offenlässt. Siehe `modulith-thinking` →
„Wenn eine Abteilung auszieht" für die Abwägung.

---

## Cross-Modul-Kommunikation

Zwei Kanäle, wie bei der Verbindungsstelle im Unternehmensbild:

1. **Aktive Nachfrage** — synchroner Aufruf über das `.Contracts`-Projekt eines anderen
   Moduls, zur Laufzeit.
2. **Reaktion auf Ereignis** — In-Process Domain Event über den `SharedKernel`-Dispatcher,
   mit einer Outbox-Tabelle im Schema des meldenden Moduls. Details und die Regel „eine
   Abfrage ist niemals ein Event": `architecture-styles` → `references/data-flow.md`,
   Abschnitt „Event-Driven Integration".

---

## Durchgerechnetes Beispiel: BAR

| Modul | Projekte | Zimmertiefe-Begründung |
|---|---|---|
| `Anmeldung` | `.Contracts` + 1 | Default — dichtes Fachmodell (Nummernvergabe-Kaskade), aber Konsistenz mit den anderen Modulen wog schwerer als der IDE-vs-Testlauf-Vorteil |
| `Verkaeuferverwaltung` | `.Contracts` + 1 | Default — moderates Modell |
| `Stammdaten` | `.Contracts` + 1 | Default — dünnes CRUD-Modell |
| `Betrieb` | `.Contracts` + 1 | Default — dünnes CRUD-Modell |
| `Export` | nur 1 | kein zweiter Referenzierer — kein `.Contracts` |
| `Host`, `SharedKernel` | je 1 | — |

**Summe: 11 Projekte.** Vier davon `.Contracts`-Projekte, fünf Module, `Host` und
`SharedKernel`. Keines der Module bekam die volle Vier-Projekte-Tiefe — Konsistenz über alle
Module war der Ausschlag, nicht ein hartes Kriterium.

---

## Verweise

| Bereich | Datei/Skill |
|---|---|
| Das Unternehmensbild, das hier übersetzt wird | `modulith-thinking` |
| Modulith-Regeln, Deployment-Achse | `architecture-styles/references/deployment.md` |
| Event-Driven Integration, Outbox | `architecture-styles/references/data-flow.md` |
| Bounded Context, Repository, Context Mapping | `software-design-principles/references/ddd.md` |

---

## Opt-out

`ohne dotnet-modulith-bridge` → Skill nicht laden.
