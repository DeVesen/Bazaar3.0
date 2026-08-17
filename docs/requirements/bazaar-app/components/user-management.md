---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: user-management

**Bibliothek:** [`table`](../../../components/table/component.md) + [`modal`](../../../components/modal/component.md) + [`select`](../../../components/select/component.md) + [`badge`](../../../components/badge/component.md) + [`confirmdialog`](../../../components/confirmdialog/component.md)
**Verwendung:** Nur Haupt-App, **nur Admin** — [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) Abschnitt 3

## Index
- Überblick — Konzept
- 1. ASCII-Darstellung — Tabelle und Dialog
- 2. Tabelle — Spalten
- 3. Dialog — Anlegen, Rolle, Passwort
- 4. Schutzregeln — Letzter Admin
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Ablage

**Beschreibung:** Benutzerliste mit Anlegen, Rollenwechsel, Passwort-Zurücksetzen und Löschen.

---

## Überblick

Eine Tabelle und ein Dialog — deshalb liegt die Benutzerverwaltung als Bereich in den Einstellungen und nicht in einem eigenen Epic.

**Benutzer sind keine Verkäufer.** Ein Benutzer ist ein Konto zum Anmelden; Verkäufer melden sich in dieser App nie an. Die beiden Listen haben keinen Berührungspunkt.

---

## 1. ASCII-Darstellung

```
┌──────────────────────────────────────────────────────┐
│  Benutzer                              [+ Neu]       │
├──────────────────────────────────────────────────────┤
│  Benutzername   Rolle            Status         Aktion│
│  anna           Admin            —              ✏️ 🗑 │
│  kasse1         Kassenpersonal   [Wechsel offen] ✏️ 🗑│
│  kasse2         Kassenpersonal   —              ✏️ 🗑 │
└──────────────────────────────────────────────────────┘

Dialog (Modal sm):
┌────────────────────────────────┐
│  Neuer Benutzer           [✕]  │
├────────────────────────────────┤
│  BENUTZERNAME                  │
│  [kasse3               ]       │
│  ROLLE                         │
│  [Kassenpersonal      ▾]       │
│  INITIALPASSWORT               │
│  [                    ]        │
│  ℹ Wird beim ersten Login      │
│    zum Ändern verlangt.        │
├────────────────────────────────┤
│      [Abbrechen] [Speichern]   │
└────────────────────────────────┘
```

---

## 2. Tabelle

| Spalte | Inhalt |
|---|---|
| Benutzername | Anmeldename |
| Rolle | `Admin` oder `Kassenpersonal` |
| Status | Badge **„Wechsel offen"**, wenn `mustChangePassword` gesetzt ist; sonst „—" |
| Aktion | Bearbeiten · Löschen |

**Nicht paginiert** — ein Basar-Team ist einstellig bis zweistellig.

Die Status-Spalte ist die nützlichste: Sie zeigt dem Admin, welche Konten noch nie benutzt wurden. Ein Konto, das seit Wochen „Wechsel offen" steht, hat sich nie angemeldet.

`passwordHash` erscheint **nirgends** — auch nicht maskiert.

---

## 3. Dialog

Derselbe Dialog für Anlegen und Bearbeiten, mit unterschiedlichen Feldern:

| Modus | Felder |
|---|---|
| **Anlegen** | Benutzername · Rolle · Initialpasswort |
| **Bearbeiten** | Rolle · optional „Neues Passwort setzen" |

Der Benutzername ist nach dem Anlegen **nicht** änderbar — er ist die Anmeldeidentität, und ein Wechsel würde bedeuten, dass sich niemand mehr auskennt, wer wer ist.

**Hinweis im Dialog:** Ein vom Admin gesetztes Passwort ist ein Übergabewert, kein Dauerzustand — das System verlangt beim nächsten Login den Wechsel. Der Satz steht im Dialog, damit der Admin es dem Betroffenen gleich mitsagen kann.

**Rollenwechsel wirkt beim nächsten Login.** Das laufende Token behält seinen `role`-Claim bis zum Ablauf; bei einem Wechsel von Admin auf Kassenpersonal behält die Person also bis zu 16 Stunden ihre Rechte. Der Dialog weist darauf hin — im geschlossenen LAN ist das vertretbar, aber es soll niemanden überraschen.

Kein Self-Service-Reset: Ohne Mailserver im LAN gibt es keinen Zustellweg für einen Reset-Link.

---

## 4. Schutzregeln

| Regel | Wirkung |
|---|---|
| Letztes Admin-Konto löschen | abgelehnt (`409`) |
| Letztem Admin die Rolle entziehen | abgelehnt (`409`) |

Sonst sperrt sich das Team selbst aus, und der Seed-Admin greift nicht mehr — er entsteht nur, wenn **kein** Benutzer existiert.

Löschen erfolgt mit Bestätigungsdialog. Es berührt keine Artikel und keine Abrechnung, darum gibt es außer der Letzter-Admin-Regel keine weitere Löschsperre.

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL die Benutzerliste ohne Paginierung mit Benutzername, Rolle, Status und Aktionen anzeigen.
2. **AC-2** — THE SYSTEM SHALL ein Badge „Wechsel offen" anzeigen, wenn für den Benutzer ein Passwortwechsel aussteht.
3. **AC-3** — THE SYSTEM SHALL den Benutzernamen nach dem Anlegen nicht zur Änderung anbieten.
4. **AC-4** — WHEN ein Benutzer angelegt oder dessen Passwort zurückgesetzt wird, THEN SHALL das System den Zwangswechsel setzen und im Dialog darauf hinweisen.
5. **AC-5** — THE SYSTEM SHALL im Dialog darauf hinweisen, dass ein Rollenwechsel erst beim nächsten Login des Benutzers wirkt.
6. **AC-6** — IF das letzte Admin-Konto gelöscht oder ihm die Admin-Rolle entzogen werden soll, THEN SHALL das System die Aktion mit `409` ablehnen.
7. **AC-7** — THE SYSTEM SHALL den Passwort-Hash in keiner Antwort und keiner Anzeige ausgeben.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #component #benutzer #rollen #admin #haupt-app
