---
id: BSHELL-S02
status: draft
depends-on: [BSHELL-S01]
---

# Story: Responsives Layout

## Ziel

Die App passt ihr Layout automatisch an den Viewport an: Desktop zeigt die Sidebar fest neben dem Content, Mobile blendet die Sidebar hinter einem Burger-Menü aus. Beim Drucken werden Sidebar und Layout-Chrome ausgeblendet.

## Kontext

Die Haupt-App wird auch auf kleineren Tablets am Basar-Tag genutzt. Der Breakpoint liegt bei 768 px. Auf Mobile erscheint eine Topbar mit Burger-Button; Sidebar-Farbe und Topbar-Hintergrund sind identisch.

## Scope

**In Scope:** Shell-Layout-Komponente mit `<router-outlet>`, Desktop-Zwei-Spalten-Layout, Mobile-Topbar (`#topbar`) mit Burger-Button (`#btnBurger`), Slide-in-Sidebar als Overlay, Tap auf Overlay schließt Sidebar, `@media print`-Basisregel.

**Out of Scope:** Seiteninhalte, Toast-Positionierung, fachliche Druckansichten (Epic_Druckfunktionen).

## UI-Spezifikation

```
Desktop (> 768px):
┌──────────────┬──────────────────────────────┐
│   Sidebar    │      <router-outlet>          │
│   228 px     │  Content-BG: #f0f2f5         │
│   fest       │  Padding: 26px 22px           │
└──────────────┴──────────────────────────────┘

Mobile (≤ 768px):
┌──────────────────────────────────────────────┐
│ ☰  [Burger] │  Bazaar Suite    [Topbar #1a2e4a]│
├──────────────────────────────────────────────┤
│                <router-outlet>                │
│           Content-Padding: 14px 12px          │
└──────────────────────────────────────────────┘

Mobile — Sidebar offen:
┌──────────────┬──────────────────────────────┐
│   Sidebar    │  ░░░░ Overlay (Tap→schließt) │
│  (slide-in)  │  ░░░░ rgba(0,0,0,0.4)       │
└──────────────┴──────────────────────────────┘
```

## Akzeptanzkriterien

- [ ] **AC-1** — WHILE der Viewport > 768 px ist, SHALL das System die Sidebar als feste Spalte (228 px) neben dem Content-Bereich anzeigen; kein Topbar sichtbar.
- [ ] **AC-2** — WHILE der Viewport ≤ 768 px ist, SHALL das System die Topbar (`#topbar`) mit dem Hintergrund `var(--sidebar-bg)` (identisch zur Sidebar) und den Burger-Button (`#btnBurger`) links anzeigen; die Sidebar ist initial ausgeblendet.
- [ ] **AC-3** — WHEN der Nutzer `#btnBurger` antippt, THEN SHALL die Sidebar von links einblenden (CSS slide-in-Animation) und ein halbtransparentes Overlay erscheinen.
- [ ] **AC-4** — WHEN der Nutzer das Overlay antippt, THEN SHALL die Sidebar wieder ausgeblendet werden.
- [ ] **AC-5** — WHEN der Nutzer in der Mobile-Sidebar einen Navigationseintrag auswählt, THEN SHALL die Sidebar automatisch schließen.
- [ ] **AC-6** — WHILE das Layout gedruckt wird (`@media print`), SHALL das System Sidebar, Topbar und alle Layout-Chrome-Elemente ausblenden; nur der Content-Bereich ist sichtbar. Diese Basisregel gilt für **jede** Seite; fachliche Druckansichten mit eigenem Layout gehören zu [Epic_Druckfunktionen](../../Epic_Druckfunktionen/epic.md).
- [ ] **AC-7** — THE SYSTEM SHALL `Content-Padding` auf Desktop als 26 px oben/unten, 22 px links/rechts und auf Mobile als 14 px oben/unten, 12 px links/rechts setzen.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| BSHELL-S01 | Sidebar-Komponente muss existieren, bevor das Layout sie einbinden kann |

## Tags & Piles

**Tags:** #layout #responsive #sidebar #mobile #burger-menu #print
