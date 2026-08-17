---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: topbar

**Bibliothek:** [`button`](../../../components/button/component.md) (Burger) + eigenes Layout-Element
**Verwendung:** Nur Haupt-App, **nur mobil** (≤ 768 px) — [Epic_App_Shell](../epics/Epic_App_Shell/epic.md), BSHELL-S02

## Index
- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Verhalten — Öffnen und Schließen
- 3. Beim Drucken — unsichtbar
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Kopfleiste im mobilen Layout mit Burger-Button, die die Sidebar als Overlay öffnet.

---

## Überblick

Auf Desktop steht die [`sidebar`](../../../components/sidebar/component.md) fest neben dem Inhalt — dann gibt es **keine** Topbar. Unter 768 px verschwindet die Sidebar, und die Topbar wird der einzige Zugang zur Navigation.

Farbe identisch zur Sidebar (`var(--sidebar-bg)`), damit im Wechsel zwischen den Breakpoints kein Farbsprung entsteht.

---

## 1. ASCII-Darstellung

```
Mobile (≤ 768 px):
┌──────────────────────────────────────────────┐
│ ☰   Bazaar Suite                             │  ← Topbar, 56 px
├──────────────────────────────────────────────┤
│                                               │
│              <router-outlet>                  │
│                                               │

Sidebar offen (Overlay):
┌──────────────┬───────────────────────────────┐
│   Sidebar    │ ░░░░ Overlay (Tap → schließt) │
│  (slide-in)  │ ░░░░ rgba(0,0,0,0.4)          │
└──────────────┴───────────────────────────────┘
```

| Element | Stil |
|---|---|
| Topbar | Höhe 56 px, Hintergrund `var(--sidebar-bg)` |
| Burger (`#btnBurger`) | links, `p-button [text]="true"`, Icon in weiß |
| Titel | „Bazaar Suite", 15 px, 600, weiß |

Die Sidebar liegt im offenen Zustand bei `top: 56px` unter der Topbar — sie verdeckt sie nicht, damit der Burger als Schließ-Ziel erreichbar bleibt.

---

## 2. Verhalten

| Aktion | Wirkung |
|---|---|
| Tap auf Burger | Sidebar fährt von links ein (CSS-Slide), halbtransparentes Overlay erscheint |
| Tap auf Overlay | Sidebar schließt |
| Auswahl eines Navigationseintrags | Sidebar schließt **automatisch** |
| Viewport wird > 768 px | Topbar verschwindet, Sidebar wird fest |

Das automatische Schließen nach der Navigation ist der wichtigste Punkt: Ohne es bleibt die Sidebar über der neuen Seite stehen, und der Nutzer muss zweimal tippen, um etwas zu sehen.

---

## 3. Beim Drucken

Topbar, Sidebar und Overlay werden über die Print-Basisregel der App Shell ausgeblendet (BSHELL-S02 AC-6) — die Topbar bringt dafür **keine** eigene Regel mit.

## Akzeptanzkriterien

1. **AC-1** — WHILE der Viewport > 768 px ist, SHALL die Topbar nicht gerendert werden.
2. **AC-2** — WHILE der Viewport ≤ 768 px ist, SHALL die Topbar mit dem Hintergrund der Sidebar und dem Burger-Button links erscheinen; die Sidebar SHALL initial ausgeblendet sein.
3. **AC-3** — WHEN der Burger angetippt wird, THEN SHALL die Sidebar einfahren und ein halbtransparentes Overlay erscheinen.
4. **AC-4** — WHEN das Overlay angetippt wird, THEN SHALL die Sidebar schließen.
5. **AC-5** — WHEN ein Navigationseintrag gewählt wird, THEN SHALL die Sidebar automatisch schließen.
6. **AC-6** — THE SYSTEM SHALL die Sidebar im offenen Zustand unterhalb der Topbar positionieren.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #layout #mobile #navigation #haupt-app
