---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# API: Einstellungen

Systemparameter. Fachliche Quelle → [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) Abschnitt 1, Entity → [`entities/einstellungen.md`](../entities/einstellungen.md).

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md)

| Endpoint | Auth |
|---|---|
| `GET /api/settings` | `authenticated` |
| `PUT /api/settings` | `admin` |

---

## Lesen ist nicht Admin-Sache

Das Epic stellt alle Endpoints der Einstellungen-Seite auf `admin`. Für `GET` ist das nicht haltbar: `scannerPauseMs` steuert den Kamera-Modus **am Annahmetisch**, und ANNAHME-S01 AC-9 verlangt ausdrücklich, den Wert aus den Einstellungen zu lesen statt ihn als Konstante zu führen. Mit Admin-only-Lesen könnte die App des Kassenpersonals den Parameter nicht laden und müsste auf einen hartkodierten Default zurückfallen — womit der Parameter seinen Zweck verliert.

**Deshalb: `GET` = `authenticated`, `PUT` = `admin`.** Die Werte sind keine Geheimnisse; die Seite selbst bleibt über `adminGuard` Admin-only, was das Ändern schützt.

---

## 1. `GET /api/settings`

```
GET /api/settings

→ 200 OK
{ "scannerPauseMs": 3000 }
```

Das Frontend liest die Werte **beim App-Start** und hält sie im Speicher. Kein Nachladen pro Scan.

---

## 2. `PUT /api/settings`

```
PUT /api/settings
{ "scannerPauseMs": 5000 }

→ 204 No Content
→ 400 Bad Request   errors: { "scannerPauseMs": ["Wert muss zwischen 500 und 15000 liegen"] }
```

**Vollersetzung** aller Felder, sofort wirksam — beim nächsten App-Start der anderen Geräte, ohne Neustart des Servers.

Wertebereich `500`–`15000` ms: Unter einer halben Sekunde ist das Scan-Ergebnis nicht lesbar, über 15 Sekunden blockiert es den Annahmetisch. Fünf Sekunden Zwangspause je Scan summieren sich bei 300 Artikeln schon auf 25 Minuten Warten — der Default von 3 000 ms ist bewusst niedrig.

---

## Genau ein Parameter

`suchDebounceMs` gehört **nicht** hierher: Eine Debounce-Zeit für Suchfelder ist eine Frontend-Tuning-Konstante ohne fachlichen Anlass und steht fest im Code. Die Voranmelde-App hat denselben Parameter aus demselben Grund aus ihren Einstellungen entfernt.

Ebenfalls nicht enthalten und nur in der Voranmelde-App vorhanden: die fünf Basar-Termine der Countdown-Sequenz, `defaultTypeId` und die Nummernblock-Parameter. Begründung je Feld → [`entities/einstellungen.md`](../entities/einstellungen.md).

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #einstellungen #konfiguration #scanner
