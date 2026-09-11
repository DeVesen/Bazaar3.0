---
name: angular-modulith-bridge
description: >
  Use when translating the modulith-thinking business model into a concrete Angular
  structure — mapping departments onto `features/`, deciding what belongs in `core/`
  vs `shared/` vs a feature, how a feature's own files are laid out, or how cross-feature
  boundaries are enforced without a compiler (ESLint). Also when a frontend feature needs
  data owned by another department and it's unclear whether that's a direct import or a
  backend call.
  Technology bridge — requires `modulith-thinking` for the vocabulary it translates.
  Triggers: @angular-modulith-bridge, Feature-Struktur, Cross-Feature-Import, core vs
  shared, Modulith in Angular, Smart Component, Leaf Component.
  Background: setzt `modulith-thinking` voraus; nutzt `software-design-principles`
  (DDD-in-Angular-Tabelle) und `architecture-styles` (Modulith-Regeln) als Vertiefung.
  Opt-out: ohne angular-modulith-bridge.
---

# Angular-Brücke: Modulith-Denken in Angular

Übersetzt das Unternehmensbild aus `modulith-thinking` in eine konkrete Angular-Struktur.
**Setzt den anderen Skill voraus.** Die Übersetzung von DDD-Begriffen auf Angular
(Domain Service, Repository, Integration-/Leaf-Component) steht bereits vollständig in
`software-design-principles` → `references/ddd.md`, Abschnitt „DDD in Angular" — dieser Skill
wiederholt das nicht, sondern setzt eine Ebene höher an: beim Unternehmensbild.

---

## Grundriss

| Unternehmensbild | Angular |
|---|---|
| Unternehmen | eine Angular-Anwendung, ein Deployment |
| Abteilung | ein Feature-Bereich unter `features/<name>/` |
| Fachgruppe | Unterordner in `pages/`/`components/` — nur bei mehreren Fachgruppen |
| Anlaufstelle | `<name>-api.service.ts` |
| Zimmer | kein eigenes .NET-Äquivalent — siehe unten |
| Aktenablage | lebt im Backend-Modul; das Feature hat höchstens Zwischenzustand, keine Quelle der Wahrheit |
| Konzern / Tochterunternehmen | getrennte Angular-Anwendungen (Voranmelde-App / Haupt-App) — nichts verbindet sie im Code |

---

## Der große Unterschied zum Backend: keine Verbindungsstelle im Frontend

Im Unternehmensbild sitzt die Verbindungsstelle *über* den Abteilungen und verbindet sie.
Im Frontend gibt es diese Schicht **nicht** — und zwar bewusst nicht, nicht aus Vergessen.

Jedes Feature ist ein dünner Client **genau einer** Backend-Anlaufstelle. Braucht eine Seite
Daten aus mehreren Abteilungen — etwa ein Dashboard, das Profil- und Verkäufer-Typ-Daten
zusammen zeigt —, dann komponiert das **backendseitig** ein eigenes, dafür zuständiges Modul
(z. B. eine eigene Auswertungs-Abteilung mit eigenem Endpoint), nicht das Frontend durch
mehrere Api-Services gleichzeitig. Das Frontend-Feature für so ein Dashboard bleibt genauso
dünn wie jedes andere — ein `-api.service.ts`, ein Endpoint, keine eigene Komposition.

**Deshalb: Cross-Feature-Imports sind kein Sonderfall, den man abwägt — sie sind grundsätzlich
verboten.** Ein Feature importiert nie aus einem anderen Feature. Braucht es fremde Daten,
ist die Antwort immer „das gehört backendseitig komponiert", nie „dann importier ich kurz
den Api-Service von nebenan".

---

## Zimmer im Frontend: ESLint statt Compiler

.NET bekommt die Zimmer-Grenze vom Compiler geschenkt (`.csproj`-Referenzgrenze). TypeScript
hat dieses Mittel im Standard-Angular-Workspace nicht — ein Feature-Ordner ist kein eigenes
kompilierbares Zimmer, nur eine Ordnerkonvention. Die Grenze existiert trotzdem, nur anders
durchgesetzt: **ESLint statt Compiler.**

- Cross-Feature-Imports sind per Lint-Regel verboten (`eslint-plugin-boundaries` oder
  gleichwertig) — dieselbe Rolle wie NetArchTest in .NET, nur zur Lint-Zeit statt zur
  Kompilierzeit geprüft.
- `core/` und `shared/` importieren nie aus `features/` — die Abhängigkeitsrichtung bleibt
  einseitig, wie beim Hexagon.

Eine hart kompilierte Grenze (eigenes Nx-Library-Projekt mit TS-Project-References je Feature)
ist möglich, aber eine eigene, größere Werkzeug-Entscheidung — kein Default. Solange kein
zweites Team parallel an unterschiedlichen Features arbeitet und sich dabei blockiert, reicht
die Lint-Grenze.

---

## `core/` · `shared/` · `features/` — drei verschiedene Rollen

| Ordner | Rolle | Unternehmensbild-Entsprechung |
|---|---|---|
| `core/` | app-weite technische Singletons (Auth, Interceptor, Config) | SharedKernel — Plumbing, keine Fachlichkeit |
| `shared/` | wiederverwendbare, dumme UI-Komponenten | kein Äquivalent im Unternehmensbild — reine Präsentationswiederverwendung |
| `features/<name>/` | eine Abteilung | Abteilung |

`shared/` ist bewusst kein SharedKernel-Äquivalent, auch wenn der Name das nahelegt — es
transportiert keine Domänensprache, nur Render-Logik. Die eigentliche technische
Gemeinsamkeit sitzt in `core/`.

---

## Innerhalb eines Features

Am bestehenden Muster in dieser Suite abgelesen (z. B. `features/profile/`,
`features/sellers/`):

```
features/<name>/
├── <name>.routes.ts
├── <name>-api.service.ts        ← Anlaufstelle / Registratur (HTTP, kein Fachwissen)
└── pages/
      └── <Name>Page.ts           ← Vorzimmer: Smart/Integration-Component, orchestriert nur
```

Bei mehreren Fachgruppen oder wiederverwendbaren Leaf-Teilen kommt `components/` dazu —
genau wie `features/register/components/` oder `features/my-articles/components/` es heute
schon zeigen:

```
features/<name>/
├── <name>.routes.ts
├── <name>-api.service.ts
├── pages/
│     └── <Name>Page.ts
└── components/
      └── <ein Ordner/Datei je Leaf-Component oder Fachgruppen-Teilansicht>
```

**Sachbearbeiter-Logik** (Domain Service im Sinne von `ddd.md`) bleibt in einem eigenen
Angular-Service ohne HTTP und ohne State — niemals in der Page- oder Leaf-Component selbst.
Eine Page, die selbst rechnet statt zu delegieren, ist keine Integration-Component mehr,
sondern eine versteckte Fachabteilung ohne eigenen Namen.

Fachgruppen-Zwischenordner nur, wenn ein Feature wirklich mehrere hat — dieselbe gestufte
Entscheidung wie bei den Zimmern in .NET, nicht anders nur weil die Technik wechselt.

---

## Durchgerechnetes Beispiel: BAR

| Abteilung | Bestehende Features |
|---|---|
| `anmeldung` | `number-blocks`, `my-articles` (Selbstverwaltung), `articles` (Admin-Übersicht) |
| `verkaeuferverwaltung` | `sellers` (Verwaltung), `profile`, `register`, `set-password` (Selbstverwaltung) |
| `stammdaten` | `brands`, `categories`, `seller-types` |
| `betrieb` | `settings` |
| `export` | `export` — Abteilung und Feature fallen hier zusammen |
| außerhalb | `login` (Zugang) |
| außerhalb | `home` (Sichtkomposition — liest über mehrere Abteilungen hinweg) |
| außerhalb | `countdown-embed` (öffentliche Exposition — liest nur bei Betrieb, aber ohne Login und ohne AppShell) |
| außerhalb | `not-found` (rein technisch, kein Backend-Bezug) |

`register` und `set-password` bei `verkaeuferverwaltung` statt bei „Zugang" ist eine Lesart,
keine feststehende Tatsache — beide legen den Verkäufer-Datensatz selbst an/aktivieren, statt
nur einen bestehenden zu prüfen wie `login`.

**`countdown-embed` ist kein zweiter Fall von Home, auch wenn beide „außerhalb" stehen.** Home
liest quer über mehrere Abteilungen — echte Sichtkomposition. Countdown-Embed liest nur eine
einzige Abteilung (Betrieb, die Basar-Termine), ganz normal über eine Anlaufstelle — nur ohne
Login und ohne AppShell, weil die Route öffentlich ist und sich per `<iframe>` einbetten lässt.
Das ist eine Zugriffs-/Darstellungsfrage, keine Abteilungsfrage. Genau diese Kategorie —
öffentlich lesbar, dünn, keine eigene Akte — hat BARs Backend bereits als eigenen `Public/`-
Ordner, getrennt von `Settings`/Betrieb.

**Die Abteilungsebene ist reine Navigationshilfe, keine technische Notwendigkeit** — die
ESLint-Grenze verbietet Cross-Feature-Imports unabhängig von der Ordnertiefe. Bei wenigen
Features lohnt sie sich nicht; bei BARs 16 Features schon. Login, Home, Countdown-Embed und
Not-Found liegen dabei **innerhalb** von `features/`, nur ohne Abteilungs-Unterordner — sie
sind keine eigene Ebene neben `features/`, nur Features ohne Abteilung:

```
src/app/
├── core/                              ← auth, theme, shell
├── shared/                            ← dumme UI, kein Abteilungsbezug
│
└── features/
      ├── anmeldung/
      │     ├── number-blocks/
      │     ├── my-articles/
      │     └── articles/
      │
      ├── verkaeuferverwaltung/
      │     ├── sellers/
      │     ├── profile/
      │     ├── register/
      │     └── set-password/
      │
      ├── stammdaten/
      │     ├── brands/
      │     ├── categories/
      │     └── seller-types/
      │
      ├── betrieb/
      │     └── settings/
      │
      ├── export/
      │     └── export/
      │
      ├── login/               ← Zugang
      ├── home/                ← Sichtkomposition
      ├── countdown-embed/     ← öffentliche Exposition (Betrieb-Daten, ohne Login/Shell)
      └── not-found/           ← rein technisch
```

Jedes Feature bleibt innen wie im Abschnitt oben (`<name>.routes.ts`, `<name>-api.service.ts`,
`pages/`) — die Abteilungsebene ändert nur, wo der Ordner liegt, nicht was drin ist.

---

## Verweise

| Bereich | Datei/Skill |
|---|---|
| Das Unternehmensbild, das hier übersetzt wird | `modulith-thinking` |
| DDD-Begriffe in Angular (Domain Service, Repository, Integration-/Leaf-Component) | `software-design-principles/references/ddd.md` |
| Modulith-Regeln, geprüfte statt dokumentierte Grenze | `architecture-styles/references/deployment.md` |
| Component-Hierarchie (IODA/IOSP) | `software-design-principles` → Regel 5 |

---

## Opt-out

`ohne angular-modulith-bridge` → Skill nicht laden.
