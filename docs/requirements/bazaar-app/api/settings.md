---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-10-31
---

# API: Einstellungen

Systemparameter. Fachliche Quelle → [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) Abschnitt 1, Entity → [`entities/einstellungen.md`](../entities/einstellungen.md).

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md)

| Endpoint | Auth |
|---|---|
| `GET /api/settings` | `authenticated` |
| `PUT /api/settings` | `admin` |
| `GET /api/settings/print-texts` | `authenticated` |
| `PUT /api/settings/print-texts` | `admin` |

---

## Lesen ist nicht Admin-Sache

Das Epic stellt alle Endpoints der Einstellungen-Seite auf `admin`. Für `GET` ist das nicht haltbar: `scannerPauseMs` steuert den Kamera-Modus **am Annahmetisch**, und ANNAHME-S01 AC-9 verlangt ausdrücklich, den Wert aus den Einstellungen zu lesen statt ihn als Konstante zu führen. Mit Admin-only-Lesen könnte die App des Kassenpersonals den Parameter nicht laden und müsste auf einen hartkodierten Default zurückfallen — womit der Parameter seinen Zweck verliert.

**Deshalb: `GET` = `authenticated`, `PUT` = `admin`.** Die Werte sind keine Geheimnisse; die Seite selbst bleibt über `adminGuard` Admin-only, was das Ändern schützt.

---

## 1. `GET /api/settings`

```
GET /api/settings

→ 200 OK
{ "scannerPauseMs": 3000, "releaseOnClose": true, "defaultSellerTypeId": null }
```

Das Frontend liest die Werte **beim App-Start** und hält sie im Speicher. Kein Nachladen pro Scan. Ausnahme: Das Freigeben-Popup lädt die Einstellungen bei jedem Öffnen neu (`releaseOnClose`), damit eine gespeicherte Änderung ohne App-Neuladen gilt; ebenso laden „Neuer Verkäufer" und die Artikelannahme sie beim Öffnen neu (`defaultSellerTypeId`).

`releaseOnClose` (bool, Standard `true`): `true` = das Freigeben-Popup gibt Artikel erst beim Schließen frei, `false` = bei Verkäufern mit Gebühr je Stück 0 wird jeder erfasste Artikel sofort freigegeben. Bei Gebühr je Stück größer 0 hat der Wert keine Wirkung. Fehlt das Feld im `PUT`, gilt `true`.

`defaultSellerTypeId` (`string | null`, Standard `null`): der **Standard-Verkäufer-Typ** — Id eines Verkäufer-Typs, der bei „Neuer Verkäufer" und in der Artikelannahme (Verkäufer neu anlegen) vorausgewählt wird. `null` = kein fester Standard; dann gilt der am häufigsten zugewiesene Typ (höchster `sellerCount`, bei Gleichstand der erste). Wird der Typ gelöscht, setzt der Server den Wert auf `null` zurück ([`seller-types.md`](seller-types.md) Abschnitt 4).

---

## 2. `PUT /api/settings`

```
PUT /api/settings
{ "scannerPauseMs": 5000, "releaseOnClose": false, "defaultSellerTypeId": "b7c1e4f2" }

→ 204 No Content
→ 400 Bad Request   errors: { "scannerPauseMs": ["Wert muss zwischen 500 und 15000 liegen"] }
→ 404 Not Found     errorCode: seller_type.not_found
```

**Vollersetzung** aller Felder, sofort wirksam — beim nächsten App-Start der anderen Geräte, ohne Neustart des Servers.

`defaultSellerTypeId` ist optional: `null`, leer oder weggelassen = kein Standard. Eine unbekannte Id lehnt der Server mit `404` und Code `seller_type.not_found` ab — derselbe Fehler wie beim Anlegen eines Verkäufers mit unbekanntem Typ.

Wertebereich `500`–`15000` ms: Unter einer halben Sekunde ist das Scan-Ergebnis nicht lesbar, über 15 Sekunden blockiert es den Annahmetisch. Fünf Sekunden Zwangspause je Scan summieren sich bei 300 Artikeln schon auf 25 Minuten Warten — der Default von 3 000 ms ist bewusst niedrig.

---

## 3. `GET`/`PUT /api/settings/print-texts` — Freitexte der Druckdokumente

Markdown-Freitexte für Kopf- und Fußzeile (und beim Beleg für den Text über der Artikelliste). Lesen darf jeder angemeldete Nutzer (jeder Druck braucht die Texte), Schreiben nur ein Admin. Drei Sätze:

```
GET /api/settings/print-texts

→ 200 OK
{
  "abgabeBeleg":          { "text1": "…", "text2": "…", "text3": "…", "text4": "…", "text5": "…" },
  "verkaeuferUebersicht": { "text1": "…", "text2": "…", "text3": "…", "text4": "…", "text5": "…" },
  "articleAushang":       { "text1": "…", "text2": "…", "text3": "…", "text4": "…" }
}
```

| Satz | Felder |
|---|---|
| `abgabeBeleg`, `verkaeuferUebersicht` | `text1` Kopfzeile links · `text2` Kopfzeile Mitte · `text3` über der Artikelliste · `text4` Fußzeile links · `text5` Fußzeile Mitte |
| `articleAushang` | `text1` Kopfzeile links · `text2` Kopfzeile Mitte · `text3` Fußzeile links · `text4` Fußzeile Mitte (rechts stehen feste Werte: Datum/Uhrzeit bzw. „Seite x von y") |

`PUT` ersetzt **alle drei Sätze vollständig**: `204 No Content`; `400`, wenn ein Satz fehlt, ein Text fehlt (`null`) oder länger als **5000 Zeichen** ist. Bestehende Datenbanken erhalten für den Artikel-Aushang leere Texte (Migration). Änderungen gelten ab dem nächsten Druck. Darstellung und Sanitizing (keine Links, Bilder, HTML) sind Sache des Frontends → [`print-document`](../components/print-document.md).

---

## Weitere Parameter bewusst nicht enthalten

`suchDebounceMs` gehört **nicht** hierher: Eine Debounce-Zeit für Suchfelder ist eine Frontend-Tuning-Konstante ohne fachlichen Anlass und steht fest im Code. Die Voranmelde-App hat denselben Parameter aus demselben Grund aus ihren Einstellungen entfernt.

Ebenfalls nicht enthalten und nur in der Voranmelde-App vorhanden: die fünf Basar-Termine der Countdown-Sequenz und die Nummernblock-Parameter. Einen Standard-Typ kennt seit 2026-10-30 auch diese App (`defaultSellerTypeId`, s. o.) — anders als `defaultTypeId` der Voranmelde-App sperrt er das Löschen des Typs aber nicht. Begründung je Feld → [`entities/einstellungen.md`](../entities/einstellungen.md).

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #einstellungen #konfiguration #scanner
