---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: login-form

**Bibliothek:** [`card`](../../../components/card/component.md) + `p-iconfield` + [`input`](../../../components/input/component.md) + [`button`](../../../components/button/component.md)
**Verwendung:** Nur Haupt-App — [Epic_Login](../epics/Epic_Login/epic.md)

## Index
- Überblick — Abgrenzung zur Voranmelde-App
- 1. ASCII-Darstellung — Layoutskizze
- 2. Aufbau — Felder und Buttons
- 3. Verhalten — Anmelden, Fehler, Weiterleitung
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Anmeldeformular mit Benutzername und Passwort, einspaltig und zentriert.

---

## Überblick

**Eigene Datei, nicht die Variante der Voranmelde-App** — der Unterschied ist zu groß für eine Varianten-Tabelle:

| Aspekt | Voranmelde-App | Haupt-App |
|---|---|---|
| Anmeldename | E-Mail | **Benutzername** — im LAN hat Kassenpersonal keine dienstliche Adresse, und ein kurzer Name ist am Tablet schneller getippt |
| Layout | zweispaltig mit Info-Panel (Countdown, Konditionen, Markdown-Text) | **einspaltig**, zentriert — es gibt hier keine Termine und keine Konditionen zu zeigen |
| Registrierung | Link auf eigene Seite | **keine** — Konten legt der Admin an |
| Passwort vergessen | Popover mit Hinweis | **statischer Text**, kein Klickziel |
| Nach Login | Home | Startseite, plus möglicher Zwangswechsel des Passworts |

---

## 1. ASCII-Darstellung

```
┌─────────────────────────────────────────┐
│                                         │
│          Bazaar Haupt-App               │
│                                         │
│   BENUTZERNAME                          │
│   👤 [anna                    ]         │
│   PASSWORT                              │
│   🔒 [••••••••              ] 👁        │
│                                         │
│   [        Anmelden        ]            │
│                                         │
│   Passwort vergessen? Wende dich an     │
│   den Admin.                            │
└─────────────────────────────────────────┘
```

Container `p-card`, `max-width: 360 px`, zentriert. Die Seite läuft **ohne AppShell** — keine Sidebar, keine Titelleiste.

---

## 2. Aufbau

| Element | PrimeNG |
|---|---|
| Benutzername | `p-iconfield` mit linkem `p-inputicon` (User) + `input pInputText` |
| Passwort | `p-iconfield` mit linkem `p-inputicon` (Schloss) + `input pInputPassword` + rechtem klickbarem `p-inputicon` (Eye/Eye-Slash, `[(mask)]`) |
| Anmelden | `p-button severity="primary"`, volle Breite |
| Passwort-Hinweis | reiner Text, 12.5 px, muted — **kein** Link, **kein** Popover |

Label-Stil und Fehlerdarstellung wie bei [`input`](../../../components/input/component.md).

Der Passwort-Hinweis ist bewusst nicht klickbar: Es gibt nichts zu öffnen. Ein Popover, das nur „wende dich an den Admin" sagt, ist ein Klick, der nichts liefert — dann kann der Satz auch gleich dastehen.

---

## 3. Verhalten

| Fall | Verhalten |
|---|---|
| Enter im Passwortfeld | löst die Anmeldung aus |
| Falsche Daten | Meldung „Ungültige Anmeldedaten" — **ohne** zu sagen, welcher der beiden Werte falsch war |
| Erfolg | Weiterleitung auf die ursprünglich angeforderte Seite (`returnUrl`), sonst auf die Startseite |
| Erfolg mit `mustChangePassword` | Weiterleitung auf `/change-password` — vor jeder anderen Seite |
| Aufruf mit gültiger Sitzung | direkte Weiterleitung auf die Startseite, das Formular erscheint nicht |

Der Fokus liegt beim Öffnen auf dem Benutzernamen-Feld.

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL Benutzername und Passwort abfragen, nicht eine E-Mail-Adresse.
2. **AC-2** — THE SYSTEM SHALL die Seite ohne Sidebar und ohne Titelleiste rendern.
3. **AC-3** — WHILE das Passwortfeld fokussiert ist und Enter gedrückt wird, SHALL die Anmeldung ausgelöst werden.
4. **AC-4** — IF die Anmeldedaten falsch sind, THEN SHALL das System „Ungültige Anmeldedaten" anzeigen, ohne preiszugeben, welcher Wert falsch war.
5. **AC-5** — THE SYSTEM SHALL den Passwort-Hinweis als statischen Text ohne Klickziel anzeigen.
6. **AC-6** — WHEN die Anmeldung erfolgreich ist und `mustChangePassword` gesetzt ist, THEN SHALL das System vor jeder anderen Seite auf die Passwortwechsel-Seite weiterleiten.
7. **AC-7** — THE SYSTEM SHALL keinen Registrierungs-Link anzeigen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #login #formular #haupt-app
