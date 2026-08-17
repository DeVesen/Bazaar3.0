---
id: BSHELL-S01
status: draft
depends-on: [BPROJ-S01]
---

# Story: Sidebar & Navigation

## Ziel

Admin und Kassenpersonal navigieren über eine fest sichtbare Sidebar zwischen den Bereichen der Haupt-App. Die aktive Route ist visuell hervorgehoben; offene Artikel werden als Badge am Menüpunkt „Artikelannahme" angezeigt.

## Kontext

Die Haupt-App hat keine Login-Seite — die Sidebar ist immer sichtbar. Sie gliedert sich in drei Gruppen: Tagesgeschäft, Stammdaten, System. Das Logo zeigt „Bazaar **Suite**", wobei „Suite" in der Akzentfarbe erscheint.

## Scope

**In Scope:** Sidebar-Komponente, Navigationsstruktur (drei Gruppen + Trennlinien), Logo-Block, Active-Route-Highlight, Badge für offene Artikel (Zahl), alle visuellen Maße und Farben.

**Out of Scope:** Mobile-Burger-Menü (folgt in BSHELL-S02), Seiteninhalte, Badge-Daten-API-Anbindung (folgt im Epic Artikelannahme).

## UI-Spezifikation

```
┌────────────────────────┐
│  Bazaar Suite          │  ← Logo (17px, 800, weiß; "Suite" in #2e86c1)
│  (Logo-Block, 228px)   │  ← border-bottom 1px rgba(255,255,255,0.1)
├────────────────────────┤
│  TAGESGESCHÄFT         │  ← Section-Label (10px, 700, uppercase)
│  ○ Artikelannahme  [3] │  ← Badge (offene Artikel, AC-6)
│  ○ Verkauf             │
│  ○ Abrechnung          │
│  ─────────────         │  ← Trennlinie
│  STAMMDATEN            │
│  ○ Verkäufer           │
│  ○ Artikel             │
│  ○ Marken              │
│  ○ Kategorien          │
│  ○ Verkäufer-Typen     │
│  ─────────────         │
│  SYSTEM                │
│  ○ Statistik           │
│  ○ Einstellungen       │
└────────────────────────┘
```

Aktiver Eintrag: Akzentfarbe `#2e86c1` als Hintergrund-Highlight.

**Maße** (Farben → spec.md §10.1):

| Element | Wert |
|---|---|
| Sidebar-Breite | 228 px |
| Logo-Block Padding | 20 px 18 px 16 px |
| Section-Label | 10 px, 700, uppercase, 1.2 px letter-spacing |
| Trennlinie | 1 px solid rgba(255,255,255,0.07), mx 14 px |
| Nav-Item Padding | 9 px 18 px |
| Nav-Item Font | 13.5 px |
| Nav-Icon | 16 px, Breite 18 px |

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL eine Sidebar-Komponente mit der Breite 228 px und dem Hintergrund `#1a2e4a` rendern.
- [ ] **AC-2** — THE SYSTEM SHALL im Logo-Block „Bazaar **Suite**" anzeigen, wobei „Suite" in `#2e86c1` gefärbt ist.
- [ ] **AC-3** — THE SYSTEM SHALL drei Navigationsgruppen mit Section-Labels („TAGESGESCHÄFT", „STAMMDATEN", „SYSTEM") und PrimeNG-Trennlinien zwischen den Gruppen rendern.
- [ ] **AC-4** — WHEN der Nutzer einen Navigationseintrag anklickt, THEN SHALL der Eintrag als aktiv hervorgehoben werden und Angular Router zur zugehörigen Route navigieren.
- [ ] **AC-5** — WHILE der Nutzer auf einer Route ist, SHALL der zugehörige Navigationseintrag dauerhaft aktiv hervorgehoben bleiben (auch nach Seiten-Reload).
- [ ] **AC-6** — WHEN die Anzahl offener Artikel > 0 ist, THEN SHALL ein `p-badge` mit der Zahl am Navigationseintrag „Artikelannahme" erscheinen; bei 0 offenen Artikeln ist kein Badge sichtbar.
- [ ] **AC-7** — THE SYSTEM SHALL Material Icons (npm-Paket, kein CDN) für die Nav-Icons verwenden.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| BPROJ-S01 | Angular-Projekt und PrimeNG müssen installiert sein |

## Tags & Piles

**Tags:** #sidebar #navigation #layout #primeng #badge #material-icons
