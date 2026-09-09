---
stage: 01-intake
status: confirmed
created: 2026-09-09
source: docs/requirements/advance-registration/roadmap/R00-fundament.md
scope: Restumfang von R00 (Variante A)
---

# Intake — R00 Fundament, Restumfang

**Voranmelde-App · Roadmap-Schritt R00 · Ergebnis der Brainstorming-Stufe vom 2026-09-09**

## 1. Auftrag und Schnitt

R00 ist teilweise gebaut. Diese Notiz beschreibt den **Restumfang** — was auf dem
bestehenden Stand noch fehlt, damit R00 abnehmbar ist. Der bestehende Stand wird nicht
in Frage gestellt: wo er der Doku widerspricht, gewinnt der Code und die Doku wird
nachgezogen (siehe Abschnitt 7).

Eine Ausnahme: der **SSR-Rückbau** in Abschnitt 4. SSR ist kein Stand, der einer
Entscheidung folgt — es ist der `ng new`-Default und in keinem Dokument erwähnt. Die
Regel „Code gewinnt" greift dort nicht, wo der Code nie eine Entscheidung war.

Gewählte Reihenfolge: **Theme vor Shell**. Erst das Frontend-Fundament inklusive
Industry-Theme und Icon-Setup, dann die App-Shell darauf. EF Core ist davon unabhängig
und kann davor oder danach laufen. Der compose-`frontend`-Service setzt den SSR-Rückbau
voraus, weil sein Dockerfile `dist/BAR.App/browser` baut — dieses Ausgabeverzeichnis
entsteht erst, wenn `outputMode: "server"` aus `angular.json` heraus ist.

Begründung: R00 warnt selbst, die Styleguide-Entscheidung müsse vor dem Theme-Setup
fallen, „sonst wird VSHELL-S05 zweimal gebaut". Dieselbe Logik gilt eine Ebene tiefer.
Sidebar, Layout und Sidebar-Footer auf dem Aura-Placeholder zu bauen und danach
umzufärben heißt, jede Komponente zweimal anzufassen. VSHELL-S05 hat
`depends-on: [VPROJ-S01]` und nicht auf die übrigen Shell-Stories — die Umstellung ist
mit der Story-Struktur verträglich.

## 2. Ist-Stand

**Steht schon**

- Backend `BAR.Domain` / `BAR.Application` / `BAR.Infrastructure` / `BAR.Host` mit `BAR.slnx`
- `GET /health` ohne Datenbankprüfung, `IClock` / `SystemClock`, `EntityId`, `DomainException`
- `AddInfrastructure()` als einziger Registrierungsort; `BAR.Host` kennt keine Adapter-Typen
- CORS-Policy in `Program.cs`: `http://localhost:4200` fest, Production-Origin über
  `CORS_ALLOWED_ORIGIN`
- Testprojekte `BAR.Domain.UnitTests`, `BAR.Host.IntegrationTests`, `BAR.Architecture.Tests`
  (xUnit v3, Microsoft.Testing.Platform, Testcontainers, NetArchTest)
- `compose.yaml` in `backend/` mit `db` (`postgres:18-alpine`) und `api`, Dockerfile für den Host
- Angular 22 `BAR.App` aus `ng new` — nackt, **mit SSR**, Vitest als Testrunner

**Fehlt**

- EF Core vollständig: kein NuGet-Paket, kein `BarDbContext`, keine Migration,
  kein `GET /health/ready`
- PrimeNG, ngx-translate, Icon-Paket, Fonts — nichts installiert
- ESLint gar nicht vorhanden, also auch keine Importgrenzen
- Feature-First-Verzeichnisstruktur und Path-Aliases
- App-Shell vollständig (VSHELL-S01 bis S05)
- `frontend`-Service in compose, `.env.example`

## 3. Entschiedene Fragen

| # | Frage | Entscheidung |
|---|---|---|
| 1 | Scope dieser Notiz | Restumfang von R00 auf dem bestehenden Stand |
| 2 | Icon-Set (spec.md §13 Frage 3, Konflikt 1) | Lucide als dokumentierte Ausnahme nur für Icons |
| 3 | SSR im Frontend | wird zurückgebaut |
| 4 | Shell ohne Login vorführbar | handgeschriebenes Fake-JWT im `localStorage`, kein Sonderpfad im Code |
| 5 | Frontend-Service und API-Zugriff | nginx serviert statischen Build und proxied `/api` + `/health` |
| 6 | Reichweite des Lucide-Austauschs | zentral über globalen PassThrough, `@primeicons/angular` entfällt |

### 3.1 Auflösung von spec.md §13 Frage 3

Die Konfliktliste in `design/industry-styleguide.md` §8 hat vier offene Zeilen, aber nur
eine ist ein echtes Entweder-oder.

- **Konflikt 2 (eigene `.btn` / `.card`-Klassen auf nativem HTML)** — bereits durch
  §10.0.4 entschieden. PrimeNG-Komponenten, kein natives HTML für interaktive Elemente.
  Die Klassen-Notation aus Styleguide §6 bleibt Referenz für das Aussehen.
- **Konflikt 3 (Theming-Mechanismus)** — kein Widerspruch, nur ein Wie. Industrys Werte
  werden PrimeNG-Design-Tokens per `definePreset`; was PrimeNG keinen Token für hat,
  bleibt CSS Custom Property. Beides koexistiert.
- **Konflikt 4 (Blueprint-Eckkreuze)** — kein Widerspruch. Die vier `<i class="corner">`
  sind kein interaktives Element, die native-HTML-Regel greift nicht. Umsetzung als
  `bar-blueprint`-Wrapper mit Pseudo-Elementen, also genau der von §10.0.4 vorgesehene
  Custom-Wrapper.
- **Konflikt 1 (Icon-Set)** — der einzige echte Konflikt, entschieden für Lucide.
  Begründung: der Styleguide ist gebunden, seine Werte aus Abschnitt 1–4 sind laut §8
  verbindlich, und Industry lebt vom durchgängigen 1.5-Stroke. Lucide ist kein
  UI-Framework, sondern ein SVG-Set — die „keine weiteren Libraries"-Regel bleibt für
  Komponenten unangetastet.

Reichweite: Die PrimeNG-Doku hält fest, „PrimeIcons library is optional as PrimeNG
components can use any icon with templating", und PassThrough lässt sich global in
`providePrimeNG({ pt: … })` konfigurieren. Der Austausch passiert daher **zentral an
einer Stelle**, nicht Template für Template. `@primeicons/angular` wird nicht
installiert; zwei Icon-Pakete parallel zu halten endet garantiert inkonsistent.

## 4. Frontend-Fundament

**SSR-Rückbau.** Gelöscht: `src/server.ts`, `src/main.server.ts`,
`src/app/app.config.server.ts`, `src/app/app.routes.server.ts`. Deinstalliert:
`@angular/ssr`, `@angular/platform-server`, `express`, `@types/express`. Aus
`app.config.ts` fällt `provideClientHydration()`, aus `angular.json` fallen
`outputMode: "server"`, `server` und `ssr`, aus `package.json` das Skript
`serve:ssr:BAR.App`. Build-Output wird `dist/BAR.App/browser`.

Begründung: SSR steht in keinem Epic, keiner Story und nicht in `spec.md` — es ist der
`ng new`-Default, keine dokumentierte Entscheidung. Die App liegt vollständig hinter
Login, kein SEO-Bedarf. Das eine anonyme Stück (R11 Countdown-Embed) braucht für den
laufenden Countdown ohnehin Client-JS. Behielte man SSR, bekäme jede auth-berührende
Story dauerhaft eine Plattform-Verzweigung: `TokenStore` liest `localStorage`, Guards
laufen serverseitig ohne Browser-Storage, der Interceptor hat auf dem Server kein Token.

**Struktur.** `src/app/core/`, `src/app/shared/`, `src/app/features/` angelegt;
Path-Aliases `@core/*`, `@shared/*`, `@features/*` in `tsconfig.json`.
Feature-Konvention nach VPROJ-S01 AC-6: `features/<feature>/` mit
`<feature>.routes.ts`, `pages/`, `components/`, `data/`, `model/`.

**ESLint.** Bisher nicht installiert — `ng add @angular/eslint`, dann drei
`no-restricted-imports`-Grenzen nach VPROJ-S01 AC-9: kein Import zwischen zwei
Features, kein Import aus `shared/` nach `features/` oder `core/`, kein Import aus
`core/` nach `features/`. Ein Verstoß bricht den Lint-Lauf.

**i18n.** `@ngx-translate/core` und `@ngx-translate/http-loader`,
`provideTranslateService` mit DE als Default und EN als Fallback. Dateien nach
`public/i18n/de.json` und `public/i18n/en.json`, Loader-Prefix `/i18n/`. Das weicht von
VPROJ-S01 AC-4 und VSHELL-S05 AC-3 ab, die `src/assets/i18n/` nennen — Angular 22
bedient Assets aus `public/`, `src/assets/` existiert im Projekt nicht. Beide ACs werden
nachgezogen. EN bleibt leer bis R12, DE wird ab R01 gepflegt.

**Theme.** PrimeNG 22 mit `@primeuix/themes`, `definePreset` auf Aura-Basis. Die
Industry-Ramps aus Styleguide §2 werden zu den Primary- und Surface-Tokens
(Accent 100 `#eef6ff` bis 900 `#1d2d3d`, Neutral 100 `#f5f5f8` bis 900 `#2b2b2d`),
Border-Radius auf `0`, Dichte 0.85. Was PrimeNG keinen Token für hat, bleibt CSS Custom
Property auf `:root` in `styles.scss`: `--space-1` bis `--space-8`, `--shadow-sm/md/lg`,
`--font-heading`, `--font-body`, `--color-divider`. Fonts lokal per
`@fontsource/barlow` und `@fontsource/barlow-condensed` — kein Google-CDN
(Styleguide §7).

**Icons.** `lucide-angular`, Stroke 1.5. Ein globaler PassThrough-Block in
`providePrimeNG({ pt: … })` ersetzt die Icon-Slots der genutzten Komponenten. Er startet
mit dem, was die Shell braucht, und wächst pro Epic um die neu genutzten Komponenten —
an einer Stelle prüfbar, nicht über Templates verteilt.

**Blueprint.** Eine `bar-blueprint`-Wrapper-Komponente in `shared/` zeichnet die vier
Registrierkreuze aus Styleguide §5 per Pseudo-Elementen und umschließt beliebigen
Inhalt. Der in Styleguide §6 dokumentierte Dialog-Bug wird **nicht** mitübernommen:
transparente Fläche gilt nur für `.blueprint`-Container, Dialoge bekommen `#f2f2f3`
nach Styleguide §7.

**Tests.** Vitest bleibt wie eingerichtet — das ist beabsichtigt, nicht versehentlich.
Ein Beispieltest auf der Blueprint-Komponente erfüllt VPROJ-S05 AC-7 für die
Frontend-Ebene.

## 5. App-Shell

**Auth-Infrastruktur (VSHELL-S04, unverändert übernommen).** Vier Bausteine in
`core/auth/`: `TokenStore` als einziger `localStorage`-Zugriff mit den drei Keys
`bazaar_token`, `bazaar_refresh_token`, `bazaar_active_role`; `JwtDecoder` als reine
Funktion ohne Angular-DI; `AuthService` mit `currentUser`-Signal und `isLoggedIn` als
`computed()`, Token wird beim App-Start einmal dekodiert; `RoleService` mit
`activeRole`-Signal. Dazu `jwtInterceptor` als `HttpInterceptorFn` mit Bearer-Header und
Ausnahmeliste `/health`, `/api/auth/*`, `/api/public/*`, 401-Refresh mit geteiltem
Aufruf bei parallelen 401ern und Refresh-Token-Rotation. Guards: `authGuard` leitet nach
`/login?returnUrl=<ursprüngliche-URL>`, `adminGuard` nach `/home`.

Alle 14 Akzeptanzkriterien sind ohne Backend prüfbar: Fake-Tokens für `JwtDecoder` und
`AuthService`, `HttpTestingController` für Interceptor und Refresh-Pfad. R00 braucht
keinen `/api/auth/*`-Endpoint.

**Layout (VSHELL-S02).** Drei Breakpoints nach spec.md §10.1: Desktop über 1024 px
Sidebar fest, keine Titelleiste; Tablet bis 1024 px Burger mit slide-in und Titelleiste;
Mobile bis 768 px zusätzlich Modals randlos auf 100 % / 100 vh. Titelleiste in
Sidebar-Farbe `#e9e9ea`, Sidebar bei `top: 56px`. Sidebar-Footer bleibt in allen
Zuständen am unteren Rand.

**Sidebar (VSHELL-S01).** Zwei Varianten nach spec.md §7 — Admin mit vier Gruppen und
elf Einträgen, Verkäufer mit zwei Gruppen und vier Einträgen. Rendert rollenabhängig
über `RoleService.activeRole()`, nicht über den Token-Claim direkt, damit der
Role-Toggle wirkt. Sidebar-Footer: Avatar auf Accent 400 `#94bce3`, Name, Logout,
Role-Toggle nur bei Rolle `admin` (spec.md §12.4). Logo „Basar **Voranmelde**" in
Barlow Condensed 600, zweites Wort in `--color-accent`.

**Routing (VSHELL-S03).** Lazy Loading je Feature über `<feature>.routes.ts`, englische
Pfade. Für jeden Sidebar-Eintrag eine Platzhalter-Route auf eine leere Page-Komponente:
`/home`, `/my-articles`, `/sellers`, `/articles`, `/brands`, `/categories`,
`/seller-types`, `/profile`, `/settings`, `/export`, `/number-blocks`. Dazu `/login` als
leere Seite (R01 füllt sie) und `/embed/countdown` als Route **außerhalb** der Shell —
ohne Sidebar, ohne Footer, ohne Titelleiste, kein Guard —, damit R11 später nicht am
Layout vorbei muss. Admin-Routen hinter `adminGuard`, alles Übrige hinter `authGuard`.

**Theme (VSHELL-S05, neu geschrieben).** Die Story steht auf Teal `#1b3a4b` und Grün
`#0e8a5f` sowie sieben CSS-Variablen, die es nicht mehr gibt — spec.md §12.1 und
Styleguide §7 sind auf Industry Steel Blue umgestellt. Die Story wird umgeschrieben:
Preset-Konfiguration statt Aura-Placeholder, Token-Tabelle aus Styleguide §7 statt der
alten Farbliste, ngx-translate-Pfad auf `public/i18n/`. Das i18n-Teil-Scope bleibt bei
ihr, auch wenn die Installation in VPROJ-S01 passiert.

**Vorführbarkeit ohne Login.** Kein Sonderpfad im Produktionscode. Ein
handgeschriebenes, unsigniertes Fake-JWT (Header und Payload base64, beliebige
Signatur — der Client prüft sie nicht, nur `sub`, `role`, `exp`) wird per
Browser-Konsole in `localStorage` gesetzt. Die Abnahme-Anleitung von R00 bekommt zwei
fertige Zeilen zum Kopieren, eine mit Rolle `admin`, eine mit Rolle `seller`.

Begründung gegen die Alternative einer Dev-Rolle in `environment.ts`: Das wäre
Produktionscode, den R01 wieder ausbauen muss, und es verlegt die Rollenquelle für die
Dauer eines Roadmap-Schritts an eine Stelle, an die sie nicht gehört. Das Fake-JWT
prüft dagegen genau den Pfad, der später echt läuft — `TokenStore` liest, `JwtDecoder`
dekodiert, `authGuard` lässt durch, Sidebar rendert rollenabhängig, Role-Toggle
schaltet.

## 6. Backend und Compose

**EF Core (VPROJ-S04).** `Npgsql.EntityFrameworkCore.PostgreSQL` **nur** in
`BAR.Infrastructure`. `BarDbContext` in `BAR.Infrastructure/Persistence/`,
Connection-String ausschließlich aus `ConnectionStrings__DefaultConnection`.
`AddInfrastructure()` bekommt eine `IConfiguration`-Überladung,
`EnableRetryOnFailure(3)` konfiguriert. Migration `InitialCreate` in
`BAR.Infrastructure`, **ohne Tabellenänderungen**. `MigrateAsync()` beim Start in jeder
Umgebung, mit Retry: 10 Versuche, Wartezeit ab 1 s verdoppelnd, maximal 15 s je Versuch,
insgesamt höchstens 60 s; danach Abbruch mit Exit-Code ungleich 0 und Host, Port und
Datenbankname im Log, ohne Passwort. Eine inhaltlich fehlgeschlagene Migration bricht
ebenfalls ab und nimmt keine Anfragen an. Selbst geöffnete Transaktionen laufen über
`strategy.ExecuteAsync(...)`. `GET /health/ready` kommt neu dazu (503 bei fehlender
Datenbank), `GET /health` bleibt ohne Datenbankprüfung.

Weil `InitialCreate` leer ist, wird R00 Abnahme #5 umgeschrieben. „Die Datenbank
enthält die Tabellen" ist nicht erfüllbar, solange R00 keine Fachlichkeit hat, und
widerspricht VPROJ-S04 AC-3. Neue Formulierung: die Migration ist eingespielt,
`__EFMigrationsHistory` existiert, `dotnet ef migrations list` zeigt `InitialCreate` als
einzigen Eintrag.

**Compose.** `compose.yaml` wandert von `backend/` nach `src/advance-registration/`,
damit beide Build-Kontexte erreichbar sind. Services:

- `db` — unverändert (`postgres:18-alpine`, Healthcheck, Volume)
- `api` — Build-Kontext auf `backend/` angepasst, Ports und Connection-String
  unverändert, Name bleibt `api`
- `frontend` — neu. Mehrstufiges Dockerfile in `frontend/BAR.App/`: Node baut
  `dist/BAR.App/browser`, nginx serviert es, Port `4200:80`. Die nginx-Konfiguration
  proxied `/api` und `/health` an `api:8080` und fällt für alles Übrige auf
  `index.html` zurück (SPA-Routing).

Damit sind Frontend und API im Browser ein Origin — CORS spielt zur Laufzeit keine
Rolle mehr, und die bestehende Policy in `Program.cs` bleibt unverändert und deckt
weiter `ng serve` auf Port 4200 ab. `ng serve` bleibt der Weg für die tägliche Arbeit,
nur außerhalb von compose.

Begründung gegen absolute API-URLs mit CORS zur Laufzeit: getrennte Origins sind der
häufigste Fehlerherd zwischen Frontend und API, und eine API-Basis-URL je Umgebung in
`environment.ts` ist zusätzlicher Pflegeaufwand ohne Gegenwert. Begründung gegen
`ng serve` im Container: dann bleibt das Artefakt, das später nach Azure Container Apps
geht, bis R12 ungetestet.

`.env.example` wird angelegt mit `POSTGRES_PASSWORD`, `JWT_SECRET`, `JWT_ISSUER`,
`JWT_AUDIENCE`, `CORS_ALLOWED_ORIGIN`.

## 7. Doku-Korrekturen, die mit R00 fällig sind

| # | Wo | Was |
|---|---|---|
| 1 | `spec.md` §13 Frage 3 | auf entschieden, mit der Auflösung aus Abschnitt 3.1 |
| 2 | `spec.md` §10.0.4 | Icon-Absatz von `@primeicons/angular` auf `lucide-angular` (Stroke 1.5) plus globaler PassThrough; Ausnahme begründet |
| 3 | `design/industry-styleguide.md` §8 | alle fünf Konflikte auf entschieden, Auflösung je Zeile |
| 4 | `VPROJ-S01` | AC-4 auf `public/i18n/`; AC-5 und AC-10 entfallen; SSR-Verzicht als Vorgabe aufnehmen |
| 5 | `VPROJ-S03` | AC-1 auf `compose.yaml` in `src/advance-registration/`, Servicename `api` statt `backend` |
| 6 | `VPROJ-S05` | AC-1 von Jest auf Vitest |
| 7 | `VSHELL-S05` | vollständig neu — Industry statt Teal/Grün, `public/i18n/` |
| 8 | `Epic_Projektanlage/epic.md` | der Satz, die App lebe in einem eigenen Repository mit `frontend/` und `backend/` am Root, ist überholt — real ist Monorepo unter `src/advance-registration/`, verbindlich nach `CLAUDE.md` |

## 8. Fertig, wenn — von Hand prüfbar

Ersetzt die sechs Punkte in `R00-fundament.md`.

1. `docker compose up` startet `db`, `api` und `frontend` ohne Fehler.
2. Die App ist unter `http://localhost:4200` erreichbar und zeigt keine
   Browser-Konsolenfehler.
3. Fake-JWT mit Rolle `admin` im `localStorage` gesetzt: die Admin-Sidebar zeigt vier
   Gruppen und elf Einträge, der Role-Toggle ist sichtbar und schaltet auf die
   Verkäufer-Ansicht.
4. Fake-JWT mit Rolle `seller`: die Verkäufer-Sidebar zeigt zwei Gruppen und vier
   Einträge, kein Role-Toggle.
5. Fenster auf 1024 px und auf 768 px verkleinern: Sidebar wird zum Burger-Menü,
   Titelleiste erscheint, Sidebar-Footer bleibt am unteren Rand. Bei 768 px sind Modals
   randlos.
6. `GET /health` antwortet mit 200. `GET /health/ready` antwortet mit 200 bei laufender
   Datenbank und mit 503, wenn der `db`-Container gestoppt ist.
7. `dotnet ef migrations list` zeigt `InitialCreate` als einzigen Eintrag,
   `__EFMigrationsHistory` existiert in der Datenbank.
8. `npm test` (Vitest), `npm run lint` und `dotnet test` laufen grün. Der
   NetArchTest-Architekturtest ist dabei und schlägt bei einer absichtlich verbotenen
   Referenzrichtung an.

## 9. Nicht in diesem Schritt

- Jede Form von Geschäftslogik, jeder fachliche Endpoint
- `/api/auth/*`, Login-Formular, Registrierung (R01) — hier entsteht nur die
  Auth-Infrastruktur im Frontend
- Englische Übersetzungstexte (R12)
- Inhalte auf den Platzhalter-Seiten
- Migration mit Tabellen — kommt mit der ersten Entität in R01

## 10. Quellen

- [`R00-fundament.md`](../../requirements/advance-registration/roadmap/R00-fundament.md)
- [`spec.md`](../../requirements/advance-registration/spec.md) §7 · §10.0.1 · §10.0.4 · §10.1 · §12.1 · §12.4 · §13
- [`design/industry-styleguide.md`](../../requirements/advance-registration/design/industry-styleguide.md)
- [`Epic_Projektanlage`](../../requirements/advance-registration/epics/Epic_Projektanlage/epic.md) — VPROJ-S01 bis S05
- [`Epic_App_Shell`](../../requirements/advance-registration/epics/Epic_App_Shell/epic.md) — VSHELL-S01 bis S05
- PrimeNG-Doku: Icons (PrimeIcons optional, Templating), Pass Through (globale Konfiguration)

## Tags & Piles

**Piles:** #pile/dv-test #pile/advance-registration
**Tags:** #intake #r00 #fundament #setup #app-shell #primeng #lucide #efcore #docker
