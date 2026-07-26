# Bazaar 3.0 — Claude Code Guide

## Projekt-Steckbrief

Zwei-App-Suite für Nummern-Basar:
- **Haupt-App (bazaar):** Lokal betrieben, verwaltet den laufenden Basar
- **Voranmelde-App (advance-registration):** Cloud-betrieben, nimmt Voranmeldungen entgegen

| | |
|---|---|
| **Tech-Stack** | Angular 19, PrimeNG, .NET 9, EF Core, PostgreSQL, Docker |
| **Tests** | Jest (Angular), xUnit (.NET), Integration Tests, Cypress (E2E) |
| **Deployment** | Docker-only (dev-deploy, build-and-push, docker-compose pro App) |
| **Sprache** | Kommunikation: Deutsch · UI: Deutsch · Code/Scripts/Docker: Englisch |

---

## Workspace-Root-Struktur

```
C:\Develop\Bazaar-3.0\          ← Workspace-Root = Repo-Root
  src/
    bazaar/                     ← Haupt-App
      backend/                  (.NET 9 Clean Architecture Solution)
      frontend/                 (Angular 19 + PrimeNG)
      deploy/
        docker/                 (Dockerfiles, docker-compose)
        scripts/                (PowerShell Deploy-Skripte)
    advance-registration/       ← Voranmelde-App
      backend/
      frontend/
      deploy/
        docker/
        scripts/
  docs/                         ← Anforderungsdokumentation: Suite-Übersicht, Lastenhefte, Entitäten, Feature-Specs
  .claude/                      ← Harness-Konfiguration (Skills, Settings)
  .mcp.json
```

---

## Anforderungsdokumentation (`docs/`)

Alle Spezifikationen und Feature-Beschreibungen liegen in `docs/`.
Einstiegspunkt → [`docs/overview.md`](docs/overview.md)

| Begriff / Datei | Bedeutung |
|---|---|
| **Suite-Übersicht** | `docs/overview.md` — Einstiegsdokument: beide Apps, Kernidee, Querschnittsthemen, Links zu allen Specs |
| **Haupt-App Lastenheft** | `docs/bazaar-app/requirements.md` — Anforderungsspezifikation Haupt-App |
| **Haupt-App Features** | `docs/bazaar-app/features/` — Feature-Beschreibungen (Feature_*.md) |
| **Voranmelde-App Lastenheft** | `docs/advance-registration/requirements.md` — Anforderungsspezifikation Voranmelde-App |
| **Voranmelde-App Features** | `docs/advance-registration/features/` — Feature-Beschreibungen (Feature_*.md) |
| **Entitäten** | `docs/entities.md` — Datenmodell beider Apps (Felder, Typen, App-Zugehörigkeit 🏠☁️✅) |

---

## Backend-Architektur

Beide Apps verwenden **Microservices** — je App eine Solution, je Service ein eigenes schlankes .NET-Projekt (eigener Prozess, eigener Docker-Container).

**Datenbankstrategie:** Eine gemeinsame PostgreSQL-Instanz pro App. Jeder Service verwendet ausschließlich seinen eigenen DB-Schema-Namespace — kein Cross-Schema-Joining.

### Voranmelde-App — Services

```
src/advance-registration/backend/
  AdvanceRegistration.sln
  Gateway/            ← einziger extern erreichbarer Service (YARP + JWT-Validierung)
  AuthService/        (schema: auth)    Login, Registrierung, Einladungs-Links, JWT, Rollen
  SellerService/      (schema: seller)  Verkäufer-Profile, Verkäufer-Types, Nummernblöcke
  CatalogService/     (schema: catalog) Marken, Kategorien (inkl. Import/Export zwischen Apps)
  ItemService/        (schema: item)    Artikel pro Verkäufer, CRUD, Aktivitäts-Zeitstempel
  SettingsService/    (schema: settings)Basar-Konfiguration, Info-Text, System-Parameter
```

> Export (JSON-Datei) ist rein client-seitig — kein Backend-Endpunkt (docs/advance-registration/features/Feature_Export.md).

### Haupt-App — Services

```
src/bazaar/backend/
  Bazaar.sln
  Gateway/            ← einziger extern erreichbarer Service (YARP)
  SellerService/      (schema: seller)  Verkäufer CRUD, Verkäufer-Types
  ItemService/        (schema: item)    Artikel CRUD, Artikelstatus, Artikelannahme
  SalesService/       (schema: sales)   Buchungen, Kassenvorgang
  SettlementService/  (schema: settle)  Abrechnung, Rückgabe nicht verkaufter Artikel
  CatalogService/     (schema: catalog) Marken, Kategorien
  SettingsService/    (schema: settings)System-Konfiguration + Import aus Voranmelde-App
```

> Kein AuthService (Haupt-App ist lokales Tool ohne Login-Flow).
> Keine Statistik-Service (Statistik-Seite ist 100% client-seitig, docs/bazaar-app/features/Feature_Statistik.md).

### Gateway-Architektur

```
Frontend (Angular)
    │
    │  HTTPS (einziger öffentlicher Port)
    ▼
┌─────────────────────────────────────────┐
│  Gateway (YARP)                         │
│  - Routing → interne Services           │
│  - JWT-Validierung (Voranmelde-App)     │
│  - Einziger Docker-Port nach außen      │
└───────────────┬─────────────────────────┘
                │  Internes Docker-Netzwerk (nicht öffentlich)
    ┌───────────┼───────────┬───────────┐
    ▼           ▼           ▼           ▼
AuthService  SellerService  ItemService  ...
```

- Alle Backend-Services laufen **nur im internen Docker-Netzwerk**
- Kein Service außer dem Gateway hat einen nach außen gemappten Port
- Authentifizierung (JWT) wird im Gateway geprüft — Services vertrauen intern

### Typische Service-Struktur (schlank)

```
ServiceName/
  ServiceName.csproj     (Minimal API, .NET 9)
  Program.cs
  Endpoints/             (Minimal API Endpoint-Gruppen)
  Domain/                (Entities, Value Objects)
  Infrastructure/        (EF Core DbContext, Migrations, Repositories)
  Tests/                 (xUnit — Unit + Integration Tests im selben Projekt)
```

### Backend-Entscheidungen

| Thema | Entscheidung |
|-------|-------------|
| **Gateway** | YARP (Yet Another Reverse Proxy) — je App ein Gateway-Projekt in der Solution |
| **Fehlerbehandlung** | Result-Pattern (kein Exception-Flooding zum Client) |
| **API-Fehlerformat** | ProblemDetails / RFC 7807 — Endpoint mappt Result auf HTTP-Codes |
| **Logging** | Serilog — keine PII in Logs |
| **Tracing** | Correlation-IDs in jedem Request (Header + Logs) |
| **API-Versionierung** | URL-Versioning (`/api/v1/...`) |
| **Secrets** | User Secrets (Dev) · Environment-Variablen (Prod) |
| **Resilience** | Nicht nötig — beide Apps laufen unabhängig voneinander |

---

## Frontend-Architektur

Zwei **separate Angular 19 Projekte** (kein Nx, keine gemeinsamen Libs):
- `src/bazaar/frontend/` — Haupt-App
- `src/advance-registration/frontend/` — Voranmelde-App

UI-Bibliothek: **PrimeNG** (kein Angular Material)
Signals-basierte Architektur, Standalone Components, moderne Control-Flow-Syntax (@if/@for).

---

## Key Skills

| Skill | Trigger / Zweck |
|-------|----------------|
| `feature-delivery` | Zentraler Orchestrator — bei jedem Feature-Start; Modi: Lean (Default), Strong (mit Scouts + 6 Reviewer), Check/Check-Plus (Bewertung ohne Implementierung) |
| `angular-developer` | Angular-Implementierung: Komponenten, Signals, Formulare, DI, Routing, Testing, Migrations |
| `angular-new-app` | Neue Angular-App anlegen — Decision Gate + Implementierungsplan vor `ng new` |
| `angular-cache-busting` | Cache-Probleme im Deployment |
| `backend-ef-migrations` | EF Core Migrationen (dotnet ef migrations add, Triplet-Pflicht, View-SQL) |
| `dev-tooling` | MCP-Gateway — Routing-Einstieg wenn unklar ist welcher MCP zu verwenden ist |
| `dev-mcp` | Dateien lesen/suchen, Scaffolding, Build, Test, Git — 49 Tools, MCP-First-Gate |
| `codebase-analyzer` | Code-Review, Analyse, Index, Symbol-Suche, Metriken — 43 Tools |
| `build-log-filter` | Shell-Logs verdichten (ng serve, npm start, Shell-Fallback nach BLOCKER) |
| `code-intel-workflow` | MCP-Routing für Code-Intelligence-Ketten: Symbol suchen, Batch-Reads, Rename-Impact, Post-Slice |
| `acceptance-design` | Anforderungen auf Testbarkeit prüfen und in F1-Format schärfen (WAS testen) |
| `test-design` | Test-Konventionen Backend (.NET: xUnit, FluentAssertions, Moq) + Frontend (Angular: Karma/Jasmine, TestBed) |
| `software-design-principles` | Design-Nordstern (sauber · funktional · getestet · wartbar · nachhaltig) — automatisch für feature-delivery |
| `delivery-inspection` | Anforderungserfüllungs-Gate vor Auslieferung — 6 parallele Reviewer |
| `commit-message` | Commit-Titel (max. 50 Zeichen) + Beschreibung (max. 500 Zeichen) generieren |
| `skill-creator` | Neue Skills (SKILL.md) und Agent-Profile (.claude/agents/) anlegen und optimieren |

---

## Verhaltensregeln

### Verbotene Anti-Patterns (sofort ansprechen, niemals einbauen)

**Allgemein:** God Class, Spaghetti Code, Big Ball of Mud, Golden Hammer,
Magic Numbers/Strings, Copy-Paste-Programmierung, Premature Optimization,
Hard Coding, Exception Swallowing, Error Hiding, Cargo Cult Programming,
Not Invented Here, Boat Anchor.

**C# / .NET:**
- `async void` — nur bei Event-Handlern erlaubt; immer `async Task`
- `.Result` / `.Wait()` / `.GetAwaiter().GetResult()` — nie (Deadlock-Gefahr)
- Captive Dependency (Scoped in Singleton, z.B. DbContext in Singleton)
- Service Locator statt Constructor-Injection
- N+1-Queries (Lazy Loading in Schleifen) — `.Include()` / Projektionen nutzen
- `SaveChanges()` in Schleifen
- Entities direkt nach außen (immer DTOs)
- Fehlendes `AsNoTracking()` bei Lese-Queries
- Exceptions für Kontrollfluss
- Statischer veränderlicher State

**Angular:**
- Nicht abonnierte Subscriptions — `async`-Pipe, `takeUntilDestroyed()` oder `takeUntil(destroy$)`
- Nested Subscriptions — stattdessen `switchMap` / `mergeMap`
- Funktionsaufrufe im Template `{{ getValue() }}` — Properties, Pipes oder Signals
- Kein `track` bei `@for`
- Default Change Detection — OnPush bevorzugen
- Fat Components (Business-Logik in Service auslagern)
- `any` überall — TypeScript-Typen konsequent nutzen
- Veraltete Muster: `*ngIf`/`*ngFor` → `@if`/`@for`; `@Input()` → `input()` Signal

### Compliance

- **OWASP Top 10** als Mindeststandard (XSS, SQL-Injection via EF-Parametrisierung, CSRF)
- **Secrets-Management:** Keine Credentials im Code/Repo — User Secrets (Dev), Environment-Variablen (Prod)
- **DSGVO/GDPR:** Datensparsamkeit, Recht auf Löschung technisch umsetzbar, Privacy by Design
- **Authentifizierung:** OAuth2/OIDC — keine selbstgebaute Krypto
- **Audit-Logging:** Serilog im Backend, keine PII in Logs
- **Dependency-Scanning:** `dotnet list package --vulnerable`, `npm audit`

---

## MCP-Konfiguration

Konfiguriert in `.mcp.json` im Workspace-Root:

| MCP | Zweck | Status |
|-----|-------|--------|
| `dev-mcp` | Dev-Tools (Filesystem, Git, Scaffolding, Build) | Pflicht |
| `codebase-analyzer` | Code-Review, Analyse, Metriken | Pflicht |
| `browser-inspector` | Browser-Inspektion | Optional |
| `primeng` | PrimeNG-Komponenten-Dokumentation & Code-Generierung | Aktiv |
