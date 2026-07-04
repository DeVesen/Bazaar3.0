# Feature: Login

**App:** Voranmelde-App
**Route:** `/login` (öffentlich)

---

## Überblick

Die Login-Seite ist in **zwei Hälften** aufgeteilt. Nach erfolgreichem Login → Redirect auf **Home-Seite** (unabhängig von der Rolle).

---

## 1. Layout (Desktop)

```
┌─────────────────────────┬─────────────────────────┐
│   Info-Area (50 %)      │   Login-Form (50 %)     │
│   (dunkler Hintergrund) │   (heller Hintergrund)  │
│                         │                         │
│  ⏱ Countdown            │  [E-Mail]               │
│  💰 Default-Konditionen  │  [Passwort]             │
│  📄 Markdown-Text        │  [Anmelden]             │
│                         │  Noch kein Konto? …     │
└─────────────────────────┴─────────────────────────┘
```

**Mobile (≤ 768 px):** Info-Area ausgeblendet — nur Login-Form sichtbar.

---

## 2. Info-Area (links)

Hintergrund: `#1b3a4b`, padding 60 px 48 px.

3 Info-Boxen:

| Box | Inhalt | Stil |
|---|---|---|
| **Countdown** | Tage + HH:MM:SS bis zum Basar | Label 11 px uppercase, Wert 32 px 800, Datum 13 px |
| **Default-Konditionen** | Provision (%) + Abgabegebühr (€) des `defaultTypeId`-Types | Werte in Akzentfarbe `#3ecf8e`, 700 |
| **Markdown-Info** | Admin-konfigurierter Info-Text | 13 px, line-height 1.7 |

Box-Stil: `background: rgba(255,255,255,0.06–0.08); border-radius: 10px; padding: 14–18px; margin-bottom: 20px`

---

## 3. Login-Form (rechts)

Hintergrund: weiß, padding 60 px 48 px.
Form: **max-width 360 px**, zentriert (margin auto).

- Überschrift: 22 px, 800
- Subtitle: 13.5 px, muted, mb 28 px
- Field-Label: 12 px, 700, uppercase, 0.4 px, muted, mb 5 px
- Input `pInputText`: padding 10 px 13 px, 14.5 px
- Login-Button: `p-button severity="primary"`, volle Breite, 15 px, 700, mt 6 px
- Registrierung-Link: text-align center, mt 16 px, 13 px

---

## 4. Redirect nach Login

Nach erfolgreichem Login → **Home-Seite** (unabhängig von Admin oder Verkäufer-Rolle).

---

## 5. Demo-Hinweis (nur Entwicklung)

In der Entwicklungsversion: kleiner Hinweis auf verfügbare Demo-Accounts.
In der Produktionsversion entfällt dieser Hinweis vollständig.

---

## 6. Registrierung

Link auf der Login-Seite → Registrierungsseite.
Selbstregistrierung: E-Mail + Passwort → Profil + automatischer Nummernblock.
