---
status: reviewed
reviewed-date: 2026-08-17
---

# API: Public & Infrastruktur

Die einzigen Endpoints der Voranmelde-App, die ohne Token erreichbar sind —
neben `/api/auth/*` (siehe [`auth.md`](auth.md)).

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md).

Epics → [Epic_Countdown_Widget](../epics/Epic_Countdown_Widget/epic.md) ·
[Epic_Login](../epics/Epic_Login/epic.md) ·
[VPROJ-S02](../epics/Epic_Projektanlage/stories/VPROJ-S02-dotnet-api-anlegen.md)

---

## Endpoints

| Endpoint | Auth | Zweck |
|---|---|---|
| `GET /api/public/info` | `public` | Basar-Termine, Default-Konditionen und Info-Text für alle nicht-authentifizierten Ansichten |
| `GET /health` | `public` | Liveness-Probe (Container-Orchestrierung) |

---

## 1. `GET /api/public/info`

> **Umbenannt.** Hieß in den Epics ursprünglich `GET /api/public/countdown` und
> lieferte nur die 5 Termine. Da die öffentliche Login-Seite zusätzlich
> Default-Konditionen und den Info-Text braucht (Epic_Login Abschnitt 2), wurde
> der Endpoint erweitert und passend benannt — statt einen zweiten
> Public-Endpoint einzuführen.

**Response `200`**

```json
{
  "voranmeldeschluss": "2026-09-30T23:59:00+02:00",
  "abgabeVon":         "2026-10-05T08:00:00+02:00",
  "abgabeBis":         "2026-10-05T18:00:00+02:00",
  "basarVon":          "2026-10-06T09:00:00+02:00",
  "basarBis":          "2026-10-06T16:00:00+02:00",
  "defaultConditions": { "verkaufsprovisionAnteil": 15.0, "abgabegebuehr": 0.50 },
  "infoText": "## Hinweise\n\nBitte bringen Sie …"
}
```

| Feld | Typ | Quelle |
|---|---|---|
| `voranmeldeschluss` … `basarBis` | ISO 8601 \| `null` | Einstellungen Abschnitt 1 → [`settings.md`](settings.md) |
| `defaultConditions` | `{ verkaufsprovisionAnteil, abgabegebuehr }` \| `null` | Backend löst `defaultTypeId` gegen den Verkäufer-Typ auf und liefert die Werte **fertig aufgelöst**. `defaultTypeId` selbst wird nicht ausgeliefert — sonst bräuchte es einen öffentlichen Seller-Types-Endpoint. |
| `infoText` | Markdown-String \| `null` | Einstellungen Abschnitt 3 |

### Nicht konfigurierte Werte

Jedes Feld kann `null` sein — der Normalzustand direkt nach dem Deployment,
solange der Admin die Einstellungen nicht gepflegt hat. Der Endpoint antwortet
trotzdem mit `200`; das Frontend blendet die betroffene Info-Box bzw.
Countdown-Phase aus. Kein `500`, damit die Login-Seite bedienbar bleibt.

### Konsumenten

| Verwendung | Genutzte Felder |
|---|---|
| Login-Seite, [`login-info-panel`](../components/custom/login-info-panel.md) | alle |
| `/embed/countdown`, [`countdown-timeline-page`](../components/custom/countdown-timeline-page.md) | nur die 5 Termine |
| Home Verkäufer, [`home-dashboard`](../components/custom/home-dashboard.md) | `abgabeVon`, `abgabeBis` |
| Home Admin | alle 5 Termine |

**Ein Response-Shape für alle vier** — das Embed-Widget erhält `infoText` und
`defaultConditions` mit, ohne sie zu rendern. Bewusst so: ein `?fields=`-Parameter
wäre für zwei Zahlen und ein Textfeld nicht gerechtfertigt. Ein Sicherheitsthema
ist es nicht — es sind exakt die Daten, die ohnehin auf der öffentlichen
Login-Seite stehen.

**DRY-Grund für die Auslagerung:** Die authentifizierten Home-Endpoints
(`/api/home/seller`, `/api/home/admin`) liefern die Termine **nicht** mit, um die
5 Datumsfelder nicht in mehreren Responses zu duplizieren. Eine Home-Ansicht
feuert daher zwei parallele Requests. Bewusst kein `Cache-Control` spezifiziert —
Caching würde Epic_Einstellungen AC-3 („sofort wirksam") verletzen.

### Embedding

`/embed/countdown` ist die **einzige** Route der App, für die
`X-Frame-Options`/CSP `frame-ancestors` das Einbetten von beliebigen Domains
erlauben. Alle anderen Routen bleiben auf `DENY`/`same-origin`
(Epic_Countdown_Widget Abschnitt 4).

---

## 2. `GET /health`

**Response `200`**
```json
{ "status": "healthy" }
```

Ohne Auth, ohne `/api`-Präfix. Wird von Azure Container Apps als Liveness-Probe
verwendet (VPROJ-S02 AC-4/AC-6).

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #public #countdown #embed #health #iframe
