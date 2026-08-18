---
id: VSHELL-S02
status: draft
depends-on: [VSHELL-S01]
---

# Story: Responsives Layout

## Ziel

Die App passt ihr Layout automatisch an den Viewport an: Desktop zeigt die Sidebar im Icon-Collapse-Modus fest, Tablet und Mobile blenden sie als natives PrimeNG-Offcanvas mit Backdrop aus. Ein einziger, vereinheitlichter Trigger-Button im Content-Header steuert beide Modi. Der Sidebar-Footer bleibt auch im mobilen Zustand sichtbar.

## Kontext

Die Voranmelde-App wird von Verkäufern auch auf Mobilgeräten (Smartphones) genutzt. Sie hat drei Breakpoints: Desktop (>1024 px), Tablet (≤1024 px) und Mobile (≤768 px). Im Unterschied zur Haupt-App wird die Sidebar bereits ab Tablet zum Offcanvas.

**Vereinheitlichter Trigger:** PrimeNGs eigene Sidebar-Demos platzieren genau einen `pSidebarTrigger`-Button im Content-Header (außerhalb der Sidebar) — er muss außerhalb liegen, damit er eine komplett ausgeblendete Mobile-Sidebar wieder öffnen kann. Ersetzt die ursprünglich getrennten Elemente (Chevron im Sidebar-Header + separater Mobile-Burger-Button).

## Scope

**In Scope:** Shell-Layout-Komponente mit `<router-outlet>`, `p-sidebar-layout`/`p-sidebar-main` als Content-Wrapper, Content-Header mit einem `button[pButton][pSidebarTrigger]`, reaktiver Wechsel `[collapsible]="isMobile() ? 'offcanvas' : 'icon'"` + `[overlay]="isMobile()"` per `matchMedia`, `p-sidebar-backdrop` bei Mobile+offen.

**Out of Scope:** Seiteninhalte, Toast-Positionierung.

## PrimeNG-Element-Mapping

| Teil | Element |
|---|---|
| Backdrop (Mobile, offen) | `p-sidebar-backdrop` (nur gerendert wenn `isMobile() && open()`) |
| Content-Bereich | `p-sidebar-main` |
| Content-Header | eigenes `<header>` mit `button[pButton][pSidebarTrigger][target]="'<sidebar-id>'"` |
| Trigger-Icon | `@primeicons/angular` — `<svg data-p-icon="bars">`, konsistent mit VSHELL-S01 |
| Breakpoint-Logik | `window.matchMedia('(max-width: 1024px)')` → `isMobile` Signal, analog PrimeNG-Beispiel |

## UI-Spezifikation

```
Desktop (> 1024px) — Sidebar im Icon-Collapse-Modus:
┌──────────────┬──────────────────────────────┐
│   Sidebar    │  [☰]  ← Trigger im Content-Header
│   240/60 px  │──────────────────────────────│
│   (inkl.     │      <router-outlet>          │
│   Footer)    │  Content-BG: #f0f4f7, 26/22px │
└──────────────┴──────────────────────────────┘

Tablet (≤ 1024px) / Mobile (≤ 768px) — Sidebar als Offcanvas, initial geschlossen:
┌──────────────────────────────────────────────┐
│ [☰]  ← selber Trigger, jetzt öffnet Offcanvas │
├──────────────────────────────────────────────┤
│                <router-outlet>                │
│           Tablet: 26px / Mobile: 14px Padding │
└──────────────────────────────────────────────┘

Offcanvas offen (Mobile/Tablet):
┌──────────────┬──────────────────────────────┐
│ Sidebar      │  p-sidebar-backdrop           │
│ (mit Footer) │  (Tap → schließt)             │
└──────────────┴──────────────────────────────┘
```

## Akzeptanzkriterien

- [ ] **AC-1** — WHILE der Viewport > 1024 px ist, SHALL das System `[collapsible]="'icon'"` und `[overlay]="false"` setzen; die Sidebar bleibt als feste Spalte sichtbar (240/60 px je nach Collapse-Zustand).
- [ ] **AC-2** — WHILE der Viewport ≤ 1024 px ist, SHALL das System `[collapsible]="'offcanvas'"` und `[overlay]="true"` setzen; die Sidebar ist initial geschlossen (`open() === false`).
- [ ] **AC-3** — WHEN der Nutzer den `pSidebarTrigger`-Button antippt, THEN SHALL die Sidebar öffnen (Offcanvas-Slide-in auf Mobile/Tablet, Expand auf Desktop) mit dem Sidebar-Footer am unteren Rand.
- [ ] **AC-4** — WHEN der Nutzer den `p-sidebar-backdrop` antippt, THEN SHALL die Sidebar geschlossen werden.
- [ ] **AC-5** — WHEN der Nutzer im Offcanvas-Modus einen Navigationseintrag auswählt, THEN SHALL die Sidebar automatisch schließen.
- [ ] **AC-6** — THE SYSTEM SHALL `Content-Padding` auf Desktop und Tablet als 26 px oben/unten, 22 px links/rechts und auf Mobile (≤768 px) als 14 px oben/unten, 12 px links/rechts setzen.
- [ ] **AC-7** — WHILE der Viewport ≤ 768 px ist und ein Modal geöffnet ist, SHALL das System das Modal auf 100 % Breite und 100 % Höhe ohne border-radius rendern.
- [ ] **AC-8** — THE SYSTEM SHALL denselben `pSidebarTrigger`-Button für Desktop-Collapse und Mobile-Offcanvas-Öffnen verwenden (kein zweiter, separater Burger-Button).

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VSHELL-S01 | Sidebar-Komponente muss existieren |

## Tags & Piles

**Tags:** #layout #responsive #sidebar #tablet #mobile #burger-menu
