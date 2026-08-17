---
status: reviewed
reviewed-date: 2026-08-17
---

# API: Verkäufer-Typen

Stammdaten für Provision und Abgabegebühr. Ein Typ ist die **einzige** Quelle
der Konditionen eines Verkäufers — diese App kennt keinen Override pro Verkäufer
(siehe [`entities/verkaeufer-typ.md`](../entities/verkaeufer-typ.md); eigene
Konditionsfelder pro Verkäufer gibt es erst in der Haupt-App).

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md).

Epic → [Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md) ·
Entity → [`entities/verkaeufer-typ.md`](../entities/verkaeufer-typ.md) ·
Component → [`typ-popup.md`](../../../components/typ-popup/component.md)

---

## Endpoints

| Endpoint | Auth | Zweck |
|---|---|---|
| `GET /api/seller-types` | `admin` | Liste aller Typen |
| `POST /api/seller-types` | `admin` | Typ anlegen |
| `PUT /api/seller-types/{id}` | `admin` | Typ ändern — **wirkt sofort live** |
| `DELETE /api/seller-types/{id}` | `admin` | Typ löschen |

**Durchgehend `admin`** — anders als bei
[Marken und Kategorien](master-data.md) braucht kein Verkäufer diese Liste:
Der eigene Typ kommt aufgelöst über [`GET /api/profile`](profile.md), die
Default-Konditionen der Login-Seite über
[`GET /api/public/info`](public.md), und die Selbstregistrierung erlaubt keine
Typwahl — sie vergibt `defaultTypeId` (siehe [`auth.md`](auth.md)).

---

## Objekt

```json
{
  "id": "t1b2c3d4",
  "name": "Standard",
  "commissionRate": 12.5,
  "itemFee": 0.50,
  "sellerCount": 47
}
```

| Feld | Bemerkung |
|---|---|
| `name` | Unique — die Typen müssen im Dropdown unterscheidbar bleiben |
| `commissionRate` | Prozentsatz `0`–`100`, **Dezimalstellen erlaubt** (12,5 % ist ein realistischer Satz). Die UI zeigt ihn mit `minFractionDigits="2"` und „%"-Suffix. |
| `itemFee` | Gebühr pro abgegebenem Artikel, 2 Dezimalstellen |
| `sellerCount` | Anzahl zugewiesener Verkäufer — Spalte „Verkäufer" in der Typen-Tabelle. Macht vor einer Änderung sichtbar, wie viele Verkäufer sie trifft (siehe Live-Wirkung unten), und ist dieselbe Zahl, die über die Löschsperre entscheidet. |

---

## 1. `GET /api/seller-types`

Vollständige Liste, nicht paginiert
([`cross-cutting.md`](cross-cutting.md) Abschnitt 4) — sie dient zugleich als
Quelle für das `p-select` im Verkäufer-Dialog.

**Response `200`** — Array von Typ-Objekten

---

## 2. `POST /api/seller-types`

**Request**
```json
{ "name": "Gewerblich", "commissionRate": 20.0, "itemFee": 1.00 }
```

Alle drei Felder Pflicht. **Kein Inline-Anlegen** über ein
AutoComplete-Modal wie bei Marke/Kategorie — ein Typ braucht zwingend Provision
und Gebühr, das Anlegen-Modal hat aber nur ein Namensfeld. Neue Typen entstehen
ausschließlich hier.

**Response `201`** — angelegter Typ

**Fehler**

| Code | `detail` |
|---|---|
| `400` | Pflichtfeld fehlt, oder `commissionRate` außerhalb `0`–`100`, oder `itemFee` < 0 |
| `409` | `errorCode: seller_type.name_taken` — „Ein Verkäufer-Typ mit dieser Bezeichnung existiert bereits" |

---

## 3. `PUT /api/seller-types/{id}`

Gleicher Body wie `POST`.

> **Die Änderung wirkt sofort auf alle zugewiesenen Verkäufer.** Es gibt kein
> Snapshot-Feld beim Verkäufer — die Konditionen werden bei jedem Lesen aus dem
> Typ aufgelöst. Eine Änderung schlägt damit unmittelbar durch auf:
> die Verkäufer-Tabelle ([`sellers.md`](sellers.md)), „Meine Konditionen" auf
> der Home-Seite ([`home.md`](home.md)), Panel 03 im Profil
> ([`profile.md`](profile.md)) und — falls es der Default-Typ ist — die
> „Default-Konditionen" auf der öffentlichen Login-Seite
> ([`public.md`](public.md)).

Kein Bestätigungsdialog spezifiziert; die Spalte `sellerCount` in der Tabelle
macht die Tragweite vorab sichtbar.

**Response `200`** — aktualisierter Typ ·
**Fehler:** `400` Validierung · `404` unbekannte ID · `409` Bezeichnung vergeben

---

## 4. `DELETE /api/seller-types/{id}`

**Response `204`**

**Fehler** — zwei getrennte Konfliktfälle, in dieser Prüfreihenfolge:

| Code | `detail` | Bedingung |
|---|---|---|
| `409` | `errorCode: seller_type.in_use` — „Verkäufer-Typ wird noch verwendet" | `sellerCount > 0` (Epic_Verkaeufer_Typen AC-3) |
| `409` | `errorCode: seller_type.is_default` — „Kann nicht gelöscht werden — ist aktuell Standard-Typ in den Einstellungen" | `id == defaultTypeId` (AC-4) |
| `404` | — | Unbekannte ID |

Zuweisung wird zuerst geprüft, weil das der häufigere Fall ist.

Kein Kaskadenlöschen — Referenzschutz nach
[`cross-cutting.md`](cross-cutting.md) Abschnitt 5.

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #verkaeufer-typen #stammdaten #konditionen #crud
