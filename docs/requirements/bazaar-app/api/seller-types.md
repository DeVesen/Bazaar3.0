---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# API: Verkäufer-Typen

Vorlagen für Provision und Gebühr. Fachliche Quelle → [Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md), Entity → [`entities/verkaeufer-typ.md`](../entities/verkaeufer-typ.md).

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md)

| Endpoint | Auth |
|---|---|
| `GET /api/seller-types` | `authenticated` |
| `POST /api/seller-types` | `admin` |
| `PUT /api/seller-types/{id}` | `admin` |
| `DELETE /api/seller-types/{id}` | `admin` |

---

## 1. `GET /api/seller-types`

**Nicht paginiert** — die Liste ist einstellig bis zweistellig und dient als Dropdown-Quelle.

```
GET /api/seller-types

→ 200 OK
[
  { "id": "b7c1e4f2", "name": "Privat",
    "commissionRate": 15.0, "itemFee": 0.50, "sellerCount": 128 }
]
```

**`GET` ist `authenticated`, nicht `admin`** — hier weicht die Haupt-App bewusst von der Voranmelde-App ab, wo alle vier Endpoints Admin-only sind. Der Grund ist konkret: Kassenpersonal legt in der Artikelannahme neue Verkäufer an, und `sellerTypeId` ist am Verkäufer ein Pflichtfeld ([`sellers.md`](sellers.md)) — ohne Typenliste kann es das Feld nicht füllen. In der Voranmelde-App entsteht diese Situation nicht, weil dort kein Verkäufer andere Verkäufer anlegt.

`sellerCount` macht vor einer Änderung sichtbar, wie viele Verkäufer betroffen sind, und ist dieselbe Zahl, die über die Löschsperre entscheidet.

**Default-Sortierung:** `name` aufsteigend.

---

## 2. `POST /api/seller-types`

```
POST /api/seller-types
{ "name": "Gewerblich", "commissionRate": 20.0, "itemFee": 1.00 }

→ 201 Created   Location: /api/seller-types/c2d8a1b9
→ 400 Bad Request  errors: { "commissionRate": ["Provision muss zwischen 0 und 100 liegen"] }
→ 409 Conflict     errorCode: seller_type.already_exists
```

**Wertebereiche werden serverseitig geprüft:** `commissionRate` zwischen 0 und 100, `itemFee` nicht negativ. Ein Formular lässt sich umgehen, der Handler nicht — und eine Provision von 150 % würde die Abrechnung stillschweigend zerlegen.

**Name unique** nach Trim und ohne Berücksichtigung der Groß-/Kleinschreibung. Der Name ist zugleich der **app-übergreifende Matching-Schlüssel** beim Import.

---

## 3. `PUT /api/seller-types/{id}`

```
PUT /api/seller-types/{id}
{ "name": "Privat", "commissionRate": 12.0, "itemFee": 0.50 }

→ 204 No Content
→ 400 Bad Request / 409 Conflict   wie bei POST
```

**Wirkt nicht rückwirkend.** Verkäufer tragen `salesCommission` und `feePerItem` als **eigene Felder**; eine Änderung am Typ verändert bereits erfasste Verkäufer nicht, sonst würden sich Abrechnungen rückwirkend verschieben.

Das ist der zentrale Unterschied zur Voranmelde-App, wo es keinen Override gibt und Typänderungen sofort live wirken. Hier zählt der Wert am Verkäufer, damit eine bereits gedruckte Auszahlung nicht nachträglich falsch wird.

**Neu belegt** werden die Felder am Verkäufer nur beim Anlegen und beim **Typwechsel** — Letzterer überschreibt sie, auch manuell gesetzte, nach Bestätigung im Frontend ([`sellers.md`](sellers.md) Abschnitt 4).

---

## 4. `DELETE /api/seller-types/{id}`

```
DELETE /api/seller-types/{id}

→ 204 No Content
→ 409 Conflict   errorCode: seller_type.in_use
                 detail: "Typ ist noch 128 Verkäufern zugewiesen"
```

Es gibt **keine** Löschsperre wegen eines Standard-Typs — anders als in der Voranmelde-App, wo `defaultTypeId` in den Einstellungen einen Typ bindet. Diese App kennt keinen konfigurierten Default; das Anlege-Formular schlägt den **am häufigsten zugewiesenen** Typ vor, und dieser Vorschlag entsteht zur Laufzeit aus `sellerCount` ([Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md) Abschnitt 3).

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #verkaeufer-typen #provision #gebuehr
