---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: change-password-page

**Bibliothek:** [`card`](../../../components/card/component.md) + [`input`](../../../components/input/component.md) + [`button`](../../../components/button/component.md)
**Verwendung:** Nur Haupt-App — [Epic_Login](../epics/Epic_Login/epic.md), Route `/change-password`

## Index
- Überblick — Zwei Anlässe
- 1. ASCII-Darstellung — Layoutskizze
- 2. Verhalten — Zwang und freiwilliger Wechsel
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Seite zum Ändern des eigenen Passworts — erzwungen beim ersten Login oder freiwillig.

---

## Überblick

Zwei Anlässe, eine Seite:

| Anlass | Erkennbar an | Verlassen möglich? |
|---|---|---|
| **Erzwungen** — Konto neu angelegt oder Passwort vom Admin zurückgesetzt | Claim `mustChangePassword` im Token | **nein**, bis gewechselt wurde |
| **Freiwillig** — Nutzer will sein Passwort ändern | direkter Aufruf der Route | ja, Abbrechen führt zurück |

Die Seite läuft **ohne Sidebar** — im erzwungenen Fall soll gar nicht erst der Eindruck entstehen, man könne woanders hin. Ein `passwordChangeGuard` leitet jede andere Route hierher um, solange das Flag gesetzt ist.

---

## 1. ASCII-Darstellung

```
┌─────────────────────────────────────────┐
│  Passwort ändern                        │
│                                         │
│  Dein Passwort wurde vom Admin gesetzt. │
│  Bitte wähle ein eigenes.               │
│                                         │
│  AKTUELLES PASSWORT                     │
│  [••••••••                    ]         │
│  NEUES PASSWORT                         │
│  [                            ]         │
│  NEUES PASSWORT WIEDERHOLEN             │
│  [                            ]         │
│                                         │
│  [       Passwort ändern      ]         │
└─────────────────────────────────────────┘
```

Container `p-card`, `max-width: 360 px`, zentriert. Der Einleitungssatz erscheint **nur** im erzwungenen Fall; beim freiwilligen Wechsel steht dort ein Abbrechen-Button.

---

## 2. Verhalten

| Fall | Verhalten |
|---|---|
| Neues Passwort kürzer als 8 Zeichen | Feldfehler, Absenden gesperrt |
| Wiederholung stimmt nicht | Feldfehler an der Wiederholung |
| Aktuelles Passwort falsch | Meldung am ersten Feld nach dem Absenden (`401`) |
| Erfolg im erzwungenen Fall | **neues Token ohne das Flag**, dann Weiterleitung auf die Startseite |
| Erfolg im freiwilligen Fall | Toast „✓ Passwort geändert", zurück zur vorigen Seite |

**Das neue Token ist der entscheidende Teil:** Ohne es würde `passwordChangeGuard` den Nutzer sofort wieder hierher schicken — er hätte gewechselt und käme trotzdem nicht weiter. Der Server stellt es im Antwortkörper aus ([`api/auth.md`](../api/auth.md)).

Keine Stärke-Klassen und kein Stärke-Meter: Die Konten legt der Admin an, es registriert sich niemand selbst. Mindestlänge 8 Zeichen, mehr nicht.

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL die Seite ohne Sidebar rendern.
2. **AC-2** — WHILE der Claim `mustChangePassword` gesetzt ist, SHALL jede andere Route auf diese Seite umgeleitet werden und kein Abbrechen-Button erscheinen.
3. **AC-3** — IF das neue Passwort kürzer als 8 Zeichen ist oder die Wiederholung abweicht, THEN SHALL das System einen Feldfehler anzeigen und nicht absenden.
4. **AC-4** — IF das aktuelle Passwort falsch ist, THEN SHALL das System eine Meldung am Feld anzeigen.
5. **AC-5** — WHEN der Wechsel im erzwungenen Fall erfolgreich ist, THEN SHALL das System das neue Token ohne das Flag übernehmen und auf die Startseite weiterleiten.
6. **AC-6** — THE SYSTEM SHALL kein Passwort-Stärke-Meter anzeigen.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #passwort #login #haupt-app
