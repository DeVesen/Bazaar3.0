---
name: modulith-thinking
description: >
  Use when a system needs structuring in business terms before any framework decision —
  the whole as a company with departments, before deciding how each department is built
  in code. Also for explaining Modulith, Bounded Context or microservice-extraction to
  non-technical stakeholders, scoping what could later become its own service, or placing
  a cross-department interface that belongs neither to a department nor to the transport
  (REST, tRPC, SignalR). Theory-only, technology-agnostic — framework bridges (Angular,
  .NET) are separate, not-yet-existing companion skills.
  Triggers: @modulith-thinking, Unternehmen und Abteilungen, Fachabteilung, Modulith
  denken, Abteilung auslagern, "wie strukturieren wir das grundsätzlich", Context Mapping.
  Background: baut auf `architecture-styles` (Deployment-Achse) und
  `software-design-principles` (DDD) auf. Opt-out: ohne modulith-thinking.
---

# Modulith-Denken

Bevor über Framework oder Programmiersprache gesprochen wird: wie schneide ich ein System
dem Grundsatz nach? Dieser Skill beschreibt das **rein in Unternehmenssprache** — bewusst
ohne Code, ohne Projektnamen, ohne Technologie. Er ist die Brücke zwischen „wie denke ich
darüber nach" und den zwei technischen Nachschlagewerken `architecture-styles` und
`software-design-principles`, die dasselbe in Fachbegriffen ausbuchstabieren.

---

## Das Bild: Unternehmen und Fachabteilungen

> Ich denke grundsätzlich in einem Unternehmen mit Fachabteilungen.

Das **Unternehmen** ist die Deploy-Einheit — ein Haus, ein Eingang, ein Betrieb.

Jede **Fachabteilung** — Einkauf, Lager, Rechnungswesen, Marketing — hat:
- ihre eigene Fachsprache (dasselbe Wort kann in zwei Abteilungen Verschiedenes bedeuten,
  und das ist korrekt so)
- ihre eigene Aktenablage (keine Abteilung greift in die Ablage einer anderen)
- ihre eigene Arbeitsweise (eigene Logik, eigene Entscheidungen)
- genau eine offizielle Anlaufstelle nach außen — keine Abteilung wird direkt in ihren
  Interna angesprochen

**Wann nicht:** Bei einer einzelnen kleinen Anwendung ohne erkennbare, eigenständige
Fachbereiche ist das Unternehmen faktisch eine einzige Abteilung — das Bild lohnt sich erst,
sobald mehrere Bereiche mit eigener Sprache und eigenen Daten erkennbar sind.

---

## Die Verbindungsstelle über den Abteilungen

Abteilungen sprechen nicht direkt in die Aktenablage der anderen — sie brauchen eine
Verbindungsstelle. Die gehört **zu keiner** Abteilung, sondern sitzt darüber und kennt die
Anlaufstelle jeder Abteilung.

Zwei unabhängige Dinge sind dabei zu trennen:

1. **Wie die Verbindungsstelle intern koordiniert** — entweder eine zentrale Stelle fragt
   aktiv bei den Abteilungen an, oder jede Abteilung reagiert selbständig auf das, was
   anderswo passiert ist, ohne dass jemand zentral steuert. Das ist eine bewusste
   Entscheidung, kein Automatismus — ein zentraler Koordinator, der mit der Zeit selbst
   Fachwissen ansammelt statt nur zu verbinden, wird zur heimlichen sechsten Abteilung ohne
   eigene Sprache. Details zur zweiten Variante: `architecture-styles` →
   `references/data-flow.md`, Abschnitt „Event-Driven Integration".
2. **Wie sie nach außen zur Welt spricht** — Telefon, E-Mail, Kundenportal — ist reines
   Transportmittel. Es gehört nicht zur Abteilung und nicht zwingend zur Verbindungsstelle
   selbst, sondern ist die Tür, durch die beide nach draußen sichtbar werden.

---

## Wenn eine Abteilung auszieht

Entscheidet das Unternehmen, dass eine Abteilung eigenständig werden soll — eigenes
Gebäude, eigene Skalierung —, kann sie ausziehen, **ohne umzuziehen**: Ihre Aktenablage war
schon immer ihre eigene, ihre Anlaufstelle schon immer die einzige Tür nach draußen.

Das stimmt aber nur, wenn diese Trennung vorher schon echt war — nicht nur eine
Ordnerbeschriftung. Die konkreten Regeln dafür (eigenes Schema, keine Durchgriffe, geprüfte
statt dokumentierte Grenze) stehen in `architecture-styles` → `references/deployment.md`,
Abschnitt „Modularer Monolith".

---

## Rückübersetzung — Unternehmensbild ↔ Fachbegriff

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

---

## Noch nicht Teil dieses Bildes

- **Innerhalb einer Fachabteilung** — Fachgruppen/Fachbereiche einer Abteilung (Aggregates,
  Domain Services, Module innerhalb eines Bounded Context). Eigene Vertiefung, bewusst noch
  offen.
- **Framework-/sprachspezifische Übersetzung** — wie eine Fachabteilung konkret in Angular
  oder .NET gebaut wird. Geplante eigene Brücken-Skills, noch nicht vorhanden.

---

## Opt-out

`ohne modulith-thinking` → Skill nicht laden.
