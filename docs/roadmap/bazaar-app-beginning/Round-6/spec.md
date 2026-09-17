---
round: Round-6
status: geklärt
---

# Spec: Round 6 — Sidebar & Navigation

## Fein-Spezifikation

### Ziel

Sidebar-Komponente mit drei Navigationsgruppen (Tagesgeschäft, Stammdaten, System),
Sidebar-Footer (Avatar/Username/Rolle/Abmelden als Anzeige-Platzhalter), rollenabhängige
Sichtbarkeit von „Einstellungen", Active-Route-Highlight, Badge-Platzhalter für offene
Artikel. Kein responsives Verhalten, keine Routing-Verdrahtung auf echte Seiten, keine
echten Auth-/Badge-Daten (jeweils eigene Rounds).

### Abweichung von BSHELL-S01 AC-3b (mit Nutzer abgestimmt) — mit Reihenfolge-Einschränkung

BSHELL-S01 AC-3b verlangt eine reine Dumb Component (Navigationseinträge komplett als
`@Input`, kein injizierter Service). Die tatsächliche Referenz-Implementierung
[`sidebar.ts`](../../../../src/advance-registration/frontend/BAR.App/src/app/core/shell/sidebar/sidebar.ts)
hat die Navigationsstruktur (`NAV_GROUPS`) **intern hartcodiert** und injiziert
`AuthService`/`RoleService` direkt.

Mit dem Nutzer abgestimmt (2026-09-17): **Round-6 spiegelt die Referenz-App** — die
Navigationsstruktur wird intern in der Sidebar-Komponente hartcodiert, kein
`@Input`-Contract für Label/Icon/Route je Gruppe.

**Reihenfolge-bedingte Einschränkung:** `AuthService`/`RoleService` existieren zum
Zeitpunkt von Round-6 **noch nicht** — sie entstehen erst in Round-9 (BSHELL-S05,
„Rollen-Claim steuert … Sidebar-Sichtbarkeit aus Round 6"). Round-6 kann sie also nicht
injizieren, unabhängig von der obigen Musterentscheidung. Stattdessen (deckt sich mit
round.md selbst: „Sidebar bekommt die Rolle als Input"):

- **Rolle** kommt in Round-6 als `input<Role>()` von der aufrufenden Shell-Komponente
  (noch ohne echten `AuthService` dahinter — die Shell übergibt vorerst einen festen
  Platzhalterwert).
- **Benutzeridentität** (Avatar-Initiale, Username, Rollenname im Footer) ebenfalls als
  `input()` — Anzeige-Platzhalter laut round.md.
- **Badge-Zahl** (offene Artikel) ebenfalls als `input(0)` — Datenanbindung folgt mit
  Epic_Artikelannahme (round.md: „Badge-Daten-API-Anbindung … Out of Scope").

**Round-9 refaktoriert diese drei Inputs weg** und injiziert stattdessen `AuthService`/
`RoleService` direkt in die Sidebar (gemäß der oben getroffenen
Muster-Entscheidung) — das ist zum jetzigen Zeitpunkt vorgemerkt für die Planung von
Round-9, nicht Teil dieses Plans.

Icons (AC-7: `@primeicons/angular`) folgen der bereits in
[Round-1/plan.md](../Round-1/plan.md) getroffenen Abweichung: **`@lucide/angular`**
statt `@primeicons/angular` — Referenz-Sidebar nutzt exakt dieses Paket
(`LucideLogOut` u. a.).

### Nachtrag (mit Nutzer abgestimmt, beim Planen von Round-8 aufgefallen): Token-Namen

BSHELL-S01 beschreibt noch eine **dunkle** Navy-Sidebar mit den Token-Namen
`var(--sidebar-bg)`/`var(--accent)`. Der neuere
[`design/industry-styleguide.md`](../../../requirements/bazaar-app/design/industry-styleguide.md)
Abschnitt 7 (Entscheidung vom 2026-08-18, App-spezifische Überschreibung) legt
stattdessen eine **helle** Sidebar auf `--color-surface` mit Akzent `--color-accent`
fest und ersetzt damit BSHELL-S01s Farbwahl. Mit dem Nutzer abgestimmt
(2026-09-17): **Industry-Styleguide folgen** — Round-6 verwendet daher überall
`var(--color-surface)` statt `var(--sidebar-bg)` und `var(--color-accent)` statt
`var(--accent)` (Token-**Namen**, nicht -Werte — Round-6 selbst definiert ohnehin keine
Werte, das bleibt Round 8 vorbehalten). Alle Stellen in diesem Plan, die
`var(--sidebar-bg)`/`var(--accent)` nennen, sind entsprechend als
`var(--color-surface)`/`var(--color-accent)` zu lesen.

### Akzeptanzkriterien

Wie in [BSHELL-S01](../../../requirements/bazaar-app/epics/Epic_App_Shell/stories/BSHELL-S01-sidebar-navigation.md)
AC-1 bis AC-7, mit folgenden Anpassungen:

- **AC-3b** angepasst: Navigationsstruktur intern hartcodiert statt vollständig als
  Input (s. o.) — Rolle, Benutzeridentität und Badge-Zahl bleiben Inputs, kein
  Service-Inject in Round-6 (erst Round-9). Kein HTTP-Request in der Komponente selbst.
- **AC-7** angepasst: `@lucide/angular` statt `@primeicons/angular`.
- **AC-6b** kann in Round-6 nur strukturell erfüllt werden (keine zeitgesteuerte
  Polling-Logik), der eigentliche Lade-Trigger „beim Betreten einer Route und nach
  Änderung" braucht die Datenquelle aus Epic_Artikelannahme — hier reicht der Nachweis,
  dass die Badge-Zahl ein reiner Input-Wert ohne internes Timer/Polling ist.

Übrige AC (1, 2, 3, 3c, 3d, 4, 5, 6) unverändert.

### Bewusst nicht in diesem Round

Responsives Verhalten (Burger-Menü, Breakpoints — Round 7), Routing-Verdrahtung auf
echte Seiten/Guards (Round 7), echte Auth-/Rollen-Daten (Round 9), Badge-Daten-API
(Epic_Artikelannahme), Theme-Farben/CSS-Tokens (Round 8 — Round-6 nutzt bereits die
Tokens `var(--color-surface)`, `var(--color-accent)` etc. per Namen, ohne dass sie schon
einen Wert haben, s. Nachtrag oben).

