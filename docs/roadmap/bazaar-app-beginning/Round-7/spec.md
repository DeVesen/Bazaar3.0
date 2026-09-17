---
round: Round-7
status: geklärt
---

# Spec: Round 7 — Responsives Layout & Routing-Skeleton

## Fein-Spezifikation

### Ziel

Vollständiges App-Layout (Desktop-Zwei-Spalten, Mobile-Burger-Menü mit Overlay,
Breakpoint 768 px, Druck-Basisregel) und Routing-Skeleton mit Lazy Loading, Platzhalter-
Seiten für alle Feature-Routen, `/login` außerhalb der AppShell, Redirect `/` → `/intake`.
Nach diesem Round ist die App navigierbar — noch mit Stub-Guards ohne echte Auth-Logik.

Zwei Stories, beide betreffen dasselbe Shell-Grundgerüst:

1. **BSHELL-S02** — Responsives Layout (Shell-Komponente, Topbar, Burger, Overlay, Print).
2. **BSHELL-S03** — Routing-Skeleton (`app.routes.ts`, Lazy Routes, Guard-Grundgerüst),
   **eingeschränkt** auf das, was round.md tatsächlich in den Umfang nimmt (s. u.).

### Reihenfolge-Hinweis: BSHELL-S03 vor BSHELL-S05, obwohl die Story formal davon abhängt

BSHELL-S03 nennt `depends-on: [BSHELL-S02, BSHELL-S05]` — die Guards sollen laut Story
bereits echte Prüflogik haben. round.md selbst löst das anders auf: „Funktionale
Guards `authGuard`/`adminGuard` als Grundgerüst — Prüflogik greift auf die
Auth-Infrastruktur zu, die in einem eigenen Häppchen [Round 9] entsteht; hier zunächst
die Route-Verdrahtung." Round-7 baut also **Stub-Guards**, die vorerst immer `true`
zurückgeben (Grundgerüst, kein Redirect-Verhalten), Round 9 ersetzt den Rumpf durch die
in `auth.guard.ts`/`admin.guard.ts` der Referenz-App gezeigte echte Prüflogik (s.
Implementationsplan Schritt 5).

### Eingeschränkter Umfang gegenüber BSHELL-S03

round.md nennt in seinem „Umfang" **weder** `/change-password` noch
`passwordChangeGuard` — nur `authGuard`/`adminGuard` und die zehn Fach-Routen plus
`/login`. BSHELL-S03 selbst führt `passwordChangeGuard` und `/change-password` zusätzlich
auf (AC-5, Route-Tabelle). Da die Aufgabenstellung dieses Planungslaufs nur Round 1–9
umfasst und round.md diese beiden Elemente bewusst ausklammert, werden
`passwordChangeGuard` und `/change-password` in Round-7 **nicht** umgesetzt — sie gehören
vermutlich zu einem späteren, hier nicht geplanten Round (Epic_Login-Umfeld). Kein
Blocker für die Akzeptanzkriterien AC-1 bis AC-4, AC-6 bis AC-10 der Story; AC-5 wird für
Round-7 als „nicht in diesem Round" behandelt.

### Akzeptanzkriterien

- [BSHELL-S02](../../../requirements/bazaar-app/epics/Epic_App_Shell/stories/BSHELL-S02-responsives-layout.md)
  AC-1 bis AC-7, unverändert.
- [BSHELL-S03](../../../requirements/bazaar-app/epics/Epic_App_Shell/stories/BSHELL-S03-routing-skeleton.md)
  AC-1, AC-1b, AC-2, AC-3, AC-4, AC-6, AC-7, AC-8, AC-9, AC-10 — mit dem Vorbehalt, dass
  AC-2/AC-3 (Redirect auf `/login` bzw. `/intake`) in Round-7 nur **strukturell** über
  Stub-Guards nachweisbar sind, die noch keine echte Login-Prüfung kennen (s. u.,
  Verifikation). **AC-5 (`passwordChangeGuard`) ist nicht Teil dieses Rounds.**

### Bewusst nicht in diesem Round

Auth-Infrastruktur selbst (Round 9), Theme-Farben (Round 8), fachlicher Seiteninhalt
jeder Route, Preloading-Strategie, `passwordChangeGuard`/`/change-password` (s. o.),
Toast-Positionierung, fachliche Druckansichten (Epic_Druckfunktionen).

