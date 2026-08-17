---
id: BSHELL-S01
status: draft
depends-on: [BPROJ-S01]
---

# Story: Sidebar & Navigation

## Ziel

Admin und Kassenpersonal navigieren über eine fest sichtbare Sidebar zwischen den Bereichen der Haupt-App. Die aktive Route ist visuell hervorgehoben; offene Artikel werden als Badge am Menüpunkt „Artikelannahme" angezeigt.

## Kontext

Die Sidebar ist auf allen Seiten hinter dem Login sichtbar; die Login-Seite selbst läuft ohne AppShell (siehe [Epic_Login](../../Epic_Login/epic.md)). Sie gliedert sich in drei Gruppen: Tagesgeschäft, Stammdaten, System, plus einen Footer mit Benutzeridentität und Logout. Das Logo zeigt „Bazaar **Suite**", wobei „Suite" in der Akzentfarbe erscheint.

**„Offene Artikel"** im Badge heißt: Artikel, die angenommen, aber noch nicht freigegeben sind. Die Zahl stammt aus derselben Abfrage, die die Artikelannahme-Seite ohnehin braucht — fachlich verbindlich ist [Epic_Artikelannahme](../../Epic_Artikelannahme/epic.md).

**Rollenabhängig:** Kassenpersonal sieht den Eintrag **Einstellungen** nicht (Rechte-Matrix → [`spec.md`](../../../spec.md) Abschnitt 4.1). Einen Role-Toggle wie in der Voranmelde-App gibt es hier **nicht** — der Admin hat alle Rechte des Kassenpersonals, ein Toggle würde ihm nur künstlich Rechte wegnehmen.

## Scope

**In Scope:** Sidebar-Komponente, Navigationsstruktur (drei Gruppen + Trennlinien), Logo-Block, Sidebar-Footer (Benutzeridentität + Logout), Active-Route-Highlight, Badge für offene Artikel (Zahl), alle visuellen Maße.

**Die Sidebar ist eine Dumb Component:** Sie erhält ihre Einträge — Label, Icon, Route, Badge-Zahl — als Input und kennt weder Übersetzung noch Datenbeschaffung. Die Haupt-App füttert feste deutsche Labels hinein, die Voranmelde-App übersetzte Strings; damit bleibt die i18n-Entscheidung in der App und die Komponente in beiden Apps dieselbe (Grundregel → [`docs/components/overview.md`](../../../../components/overview.md)).

Die Komponente selbst gehört **suite-weit** nach `docs/components/sidebar/` — beide Apps bauen denselben PrimeNG-Compound mit denselben Gruppen-und-Trennlinien-Struktur; Unterschied sind nur Farben und Einträge. Aktuell liegt die Beschreibung noch unter `advance-registration/components/custom/sidebar.md`; das Verschieben ist Sache von `element-extraction`.

**Out of Scope:** Mobile-Burger-Menü (folgt in BSHELL-S02), Seiteninhalte, Badge-Daten-API-Anbindung (folgt im Epic Artikelannahme), Auth-Infrastruktur und Guards (eigene Story, siehe Hinweis in [epic.md](../epic.md)).

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
│  ○ Einstellungen       │  ← nur Admin
├────────────────────────┤
│  (A) Anna Admin        │  ← Sidebar-Footer, immer am unteren Rand
│      Admin             │
│      Abmelden          │
└────────────────────────┘
```

Aktiver Eintrag: Akzentfarbe (`var(--accent)`) als Hintergrund-Highlight.

**Kein Eintrag „Druckfunktionen".** Drucken ist eine Aktion innerhalb eines Arbeitsschritts, keine Seite: Der Ausdruck startet automatisch nach dem Buchen in der Artikelannahme bzw. per Button in der Abrechnung (siehe [Epic_Druckfunktionen](../../Epic_Druckfunktionen/epic.md)).

**Sidebar-Footer:** Avatar, Benutzername, Rollenname und Abmelden — Beschreibung → [`sidebar-footer`](../../../../components/sidebar-footer/component.md) (C-009). Ohne Role-Toggle; den nutzt nur die Voranmelde-App.

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

- [ ] **AC-1** — THE SYSTEM SHALL eine Sidebar-Komponente mit der Breite 228 px und dem Hintergrund `var(--sidebar-bg)` rendern — die Farbwerte selbst SHALL sie nicht kennen (Tokens → BSHELL-S04).
- [ ] **AC-2** — THE SYSTEM SHALL im Logo-Block „Bazaar **Suite**" anzeigen, wobei „Suite" in `var(--accent)` gefärbt ist.
- [ ] **AC-3** — THE SYSTEM SHALL drei Navigationsgruppen mit Section-Labels („TAGESGESCHÄFT", „STAMMDATEN", „SYSTEM") und PrimeNG-Trennlinien zwischen den Gruppen rendern.
- [ ] **AC-3b** — THE SYSTEM SHALL die Navigationseinträge (Label, Icon, Route, Badge-Zahl) als Input erhalten; die Komponente SHALL keinen Service injizieren und keinen HTTP-Request auslösen.
- [ ] **AC-3c** — WHILE der angemeldete Nutzer die Rolle Kassenpersonal hat, SHALL der Eintrag „Einstellungen" nicht gerendert werden (Rechte-Matrix → [`spec.md`](../../../spec.md) Abschnitt 4.1).
- [ ] **AC-3d** — THE SYSTEM SHALL am unteren Rand der Sidebar den Sidebar-Footer mit Avatar, Benutzername, Rollenname und „Abmelden" anzeigen; ein Role-Toggle SHALL nicht vorhanden sein.
- [ ] **AC-4** — WHEN der Nutzer einen Navigationseintrag anklickt, THEN SHALL der Eintrag als aktiv hervorgehoben werden und Angular Router zur zugehörigen Route navigieren.
- [ ] **AC-5** — WHILE der Nutzer auf einer Route ist, SHALL der zugehörige Navigationseintrag dauerhaft aktiv hervorgehoben bleiben (auch nach Seiten-Reload).
- [ ] **AC-6** — WHEN die Anzahl offener Artikel > 0 ist, THEN SHALL ein `p-badge` mit der Zahl am Navigationseintrag „Artikelannahme" erscheinen; bei 0 offenen Artikeln ist kein Badge sichtbar.
- [ ] **AC-6b** — THE SYSTEM SHALL die Badge-Zahl beim Betreten einer Route und nach jeder Änderung an Artikeln neu laden; ein zeitgesteuertes Polling SHALL **nicht** stattfinden.
- [ ] **AC-7** — THE SYSTEM SHALL Material Icons (npm-Paket, kein CDN) für die Nav-Icons verwenden.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| BPROJ-S01 | Angular-Projekt und PrimeNG müssen installiert sein |

## Tags & Piles

**Tags:** #sidebar #navigation #layout #primeng #badge #material-icons
