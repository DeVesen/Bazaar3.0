---
id: VSHELL-S02
status: draft
depends-on: [VSHELL-S01]
---

# Story: Responsives Layout

## Ziel

Die App passt ihr Layout automatisch an den Viewport an: Desktop zeigt die Sidebar fest, Tablet und Mobile blenden sie hinter einem Burger-Menü aus. Der Sidebar-Footer bleibt auch im mobilen Zustand sichtbar.

## Kontext

Die Voranmelde-App wird von Verkäufern auch auf Mobilgeräten (Smartphones) genutzt. Sie hat drei Breakpoints: Desktop (>1024 px), Tablet (≤1024 px) und Mobile (≤768 px). Im Unterschied zur Haupt-App wird die Sidebar bereits ab Tablet hinter einem Burger-Menü ausgeblendet.

## Scope

**In Scope:** Shell-Layout-Komponente mit `<router-outlet>`, Desktop-Zwei-Spalten-Layout, Tablet- und Mobile-Topbar (`#topbar`) mit Burger-Button (`#btnBurger`), Slide-in-Sidebar als Overlay, Overlay-Tap schließt Sidebar, Sidebar-Footer bleibt in Sidebar-Overlay sichtbar.

**Out of Scope:** Seiteninhalte, Toast-Positionierung.

## UI-Spezifikation

```
Desktop (> 1024px):
┌──────────────┬──────────────────────────────┐
│   Sidebar    │      <router-outlet>          │
│   240 px     │  Content-BG: #f0f4f7         │
│   fest       │  Padding: 26px 22px           │
│   (inkl.     │                               │
│   Footer)    │                               │
└──────────────┴──────────────────────────────┘

Tablet (≤ 1024px) / Mobile (≤ 768px):
┌──────────────────────────────────────────────┐
│ ☰ [Burger]  │  Bazaar Voranmelde  [Topbar #1b3a4b]│
├──────────────────────────────────────────────┤
│                <router-outlet>                │
│           Tablet: 26px / Mobile: 14px Padding │
└──────────────────────────────────────────────┘

Sidebar offen (Overlay):
┌──────────────┬──────────────────────────────┐
│ Sidebar      │  ░░░░ Overlay (Tap→schließt) │
│ (slide-in,   │  ░░░░ rgba(0,0,0,0.4)       │
│ mit Footer)  │                              │
└──────────────┴──────────────────────────────┘
```

## Akzeptanzkriterien

- [ ] **AC-1** — WHILE der Viewport > 1024 px ist, SHALL das System die Sidebar als feste Spalte (240 px) neben dem Content-Bereich anzeigen; kein Topbar sichtbar.
- [ ] **AC-2** — WHILE der Viewport ≤ 1024 px ist, SHALL das System die Topbar (`#topbar`) mit dem Hintergrund `#1b3a4b` und den Burger-Button (`#btnBurger`) links anzeigen; die Sidebar ist initial ausgeblendet.
- [ ] **AC-3** — WHEN der Nutzer `#btnBurger` antippt, THEN SHALL die Sidebar von links einblenden (CSS slide-in-Animation) mit dem Sidebar-Footer am unteren Rand.
- [ ] **AC-4** — WHEN der Nutzer das Overlay antippt, THEN SHALL die Sidebar ausgeblendet werden.
- [ ] **AC-5** — WHEN der Nutzer in der Sidebar-Overlay einen Navigationseintrag auswählt, THEN SHALL die Sidebar automatisch schließen.
- [ ] **AC-6** — THE SYSTEM SHALL `Content-Padding` auf Desktop und Tablet als 26 px oben/unten, 22 px links/rechts und auf Mobile (≤768 px) als 14 px oben/unten, 12 px links/rechts setzen.
- [ ] **AC-7** — WHILE der Viewport ≤ 768 px ist und ein Modal geöffnet ist, SHALL das System das Modal auf 100 % Breite und 100 % Höhe ohne border-radius rendern.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VSHELL-S01 | Sidebar-Komponente muss existieren |

## Tags & Piles

**Tags:** #layout #responsive #sidebar #tablet #mobile #burger-menu
