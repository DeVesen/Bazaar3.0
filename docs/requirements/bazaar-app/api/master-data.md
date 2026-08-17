---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# API: Stammdaten (Marken und Kategorien)

**Eine Datei für beide Ressourcen**, weil sie endpoint-seitig identisch sind: dieselben vier Operationen, dieselbe Auth-Stufung, dieselben Fehlerfälle — nur eine andere Ressource. Zwei getrennte Dateien würden bei jeder Änderung doppelt angefasst.

Fachliche Quelle → [Epic_Marken](../epics/Epic_Marken/epic.md) und [Epic_Kategorien](../epics/Epic_Kategorien/epic.md), Entities → [`marke.md`](../entities/marke.md), [`kategorie.md`](../entities/kategorie.md).

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md)

| Endpoint | Auth |
|---|---|
| `GET /api/brands` · `GET /api/categories` | `authenticated` |
| `POST /api/brands` · `POST /api/categories` | `authenticated` |
| `PUT /api/brands/{id}` · `PUT /api/categories/{id}` | `admin` |
| `DELETE /api/brands/{id}` · `DELETE /api/categories/{id}` | `admin` |

Im Folgenden steht `<resource>` für `brands` oder `categories`; `<entity>` in `errorCode` entsprechend für `brand` oder `category`.

---

## 1. `GET /api/<resource>`

**Nicht paginiert** — die Liste dient auch als Quelle für AutoComplete und Filter, und die Datenmenge ist zweistellig.

```
GET /api/brands

→ 200 OK
[
  { "id": "f1a8c3d7", "name": "Nike", "original": true, "articleCount": 5 }
]
```

`articleCount` wird **für beide Rollen** geliefert. Eine rollenabhängige Response wäre zusätzlicher Code und ein zweiter Testfall für eine Zahl, die Kassenpersonal auf der Artikel-Seite ohnehin sehen darf. (Die Voranmelde-App macht es anders — dort dürfen Verkäufer die Artikel *anderer* nicht sehen; dieser Grund existiert hier nicht.)

**Default-Sortierung:** `name` aufsteigend.

---

## 2. `POST /api/<resource>`

```
POST /api/brands
{ "name": "Nike" }

→ 201 Created   Location: /api/brands/f1a8c3d7
→ 409 Conflict  errorCode: brand.already_exists
                detail: "Marke existiert bereits"
```

**`original` steht nicht im Request** — der Server setzt es aus der Rolle des Aufrufers: Admin → `true` (kuratiertes Stammdatum), Kassenpersonal → `false` (am Annahmetisch über das AutoComplete-Popup entstanden). Ein Feld im Request wäre ein Schalter, den niemand bewusst bedient.

**`authenticated`, nicht `admin`:** Kassenpersonal muss eine unbekannte Marke sofort anlegen können, sonst blockiert die Artikelannahme am erstbesten Etikett.

**Duplikatprüfung nach Trim und ohne Berücksichtigung der Groß-/Kleinschreibung.** Gilt für **beide** Wege — Stammdaten-Seite und AutoComplete-Popup. Am Basar-Tag entstehen sonst „nike", „Nike " und „NIKE" nebeneinander, und die Filter zerfallen.

---

## 3. `PUT /api/<resource>/{id}`

```
PUT /api/brands/{id}
{ "name": "Nike", "original": true }

→ 204 No Content
→ 409 Conflict   errorCode: brand.already_exists
```

**Admin-only.** Zwei Änderungen in einem Vertrag:

- **Name:** Die Änderung wird in **alle betroffenen Artikel nachgezogen** — der Artikel referenziert Marke und Kategorie über den **Namen**, nicht über einen Fremdschlüssel ([`entities/artikel.md`](../entities/artikel.md)). Ohne das Nachziehen zerfallen Filter und Zähler.
- **`original`:** erlaubt, eine am Basar-Tag entstandene „Neu"-Marke nachträglich zu Stammdaten zu befördern — oder umgekehrt.

---

## 4. `DELETE /api/<resource>/{id}`

```
DELETE /api/brands/{id}

→ 204 No Content
→ 409 Conflict   errorCode: brand.in_use
                 detail: "Marke wird noch verwendet"
```

**Admin-only**, und nur solange kein Artikel die Marke bzw. Kategorie trägt.

---

## Import

Beim JSON-Import können Marken und Kategorien mit übernommen werden ([`import.md`](import.md)). Sie erhalten dabei `original = true` — sie sind kuratierte Stammdaten aus der Voranmeldephase, keine Neuanlage am Annahmetisch.

Unbekannte Namen werden beim Import **angelegt** — anders als unbekannte Verkäufer-Typen, die der Admin zuordnen muss. Der Unterschied ist beabsichtigt: Eine Marke trägt keine Zahlen, ein Typ trägt Provision und Gebühr ([`seller-types.md`](seller-types.md)).

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #stammdaten #marken #kategorien #original-flag
