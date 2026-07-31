---
id: F-AR-001
status: draft
updated: 2026-07-31
---

# Epic: Login

## Index
- Überblick — Konzept
- 1. Layout (Desktop) — Desktop-Layout
- 2. Info-Area (links) — Info-Boxen
- 3. Login-Form (rechts) — Formular
- 4. Redirect nach Login — Weiterleitung
- 5. Demo-Hinweis (nur Entwicklung) — Demo-Modus
- 6. Registrierung — Selbstregistrierung
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Route:** `/login` (öffentlich)

**Ziel:** Verkäufer und Admins authentifizieren sich in der Voranmelde-App.

**User Story:** Als Nutzer der Voranmelde-App möchte ich mich mit E-Mail und Passwort anmelden, damit ich auf meine Daten zugreifen kann.

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
| **Countdown** | Tage + HH:MM:SS bis zum Basar · → [Countdown](../../../../components/countdown/component.md) `variant="info-box"` | Label 11 px uppercase, Wert 32 px 800, Datum 13 px |
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

---

## Akzeptanzkriterien

1. **AC-1** — WHEN Nutzername und Passwort eingegeben und „Anmelden" geklickt wird, THEN SHALL das System die Anmeldedaten prüfen und bei Erfolg die Startseite laden.
2. **AC-2** — IF Nutzername oder Passwort falsch ist, THEN SHALL das System die Meldung „Ungültige Anmeldedaten" anzeigen ohne Details preiszugeben.
3. **AC-3** — WHILE das Passwortfeld fokussiert ist und Enter gedrückt wird, SHALL das System die Anmeldung auslösen.
4. **AC-4** — WHERE eine aktive Sitzung vorhanden ist, SHALL das System die Login-Seite überspringen und direkt die Startseite anzeigen.
5. **AC-5** — WHEN „Passwort vergessen" geklickt wird, THEN SHALL das System den Passwortzurücksetzen-Dialog öffnen.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #login #authentifizierung #voranmelde-app #e-mail #passwort
