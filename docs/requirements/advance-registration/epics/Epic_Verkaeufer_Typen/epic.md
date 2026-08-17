---
id: F-AR-007
status: reviewed
reviewed-date: 2026-08-14
updated: 2026-08-14
---

# Epic: Verkäufer-Typen

## Index
- Überblick — Konzept
- 1. Tabelle — Typen-Liste
- 2. Aktionen — CRUD
- 3. Default-Type — Standardtyp
- 4. Verhalten beim Zuweisen — Konditionsübernahme
- 5. Backend & API — Endpoints
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Stammdaten → Verkäufer-Types
**Sichtbar für:** Admin

Component-Details → [`components/forms/typ-popup.md`](../../components/forms/typ-popup.md)
Entity-Details → [`entities/verkaeufer-typ.md`](../../entities/verkaeufer-typ.md)

**Ziel:** Admin verwaltet Verkäufer-Typen in der Voranmelde-App.

**User Story:** Als Admin möchte ich Verkäufer-Typen definieren, damit ich Verkäufern passende Konditionen zuweisen kann.

**Korrektur:** Die Story lautete ursprünglich „…damit Verkäufer beim Registrieren den passenden Typ wählen können". Das trifft nicht zu — die Selbstregistrierung bietet keine Typwahl, sondern vergibt `defaultTypeId` (siehe Epic_Login Abschnitt 6). Die Typwahl trifft ausschließlich der Admin im Verkäufer-Dialog.

---

## Überblick

Verwaltung der Verkäufer-Typen. Der `defaultTypeId` wird in den Einstellungen festgelegt und auf der Login-Seite für die Konditions-Anzeige verwendet.

---

## 1. Tabelle (`table-types`)

→ Komponente: [Table](../../../../components/table/component.md)

**Spalten:** Bezeichnung · Provision % · Gebühr € · **Verkäufer** (Anzahl zugewiesener) · Aktionen

**Sortierbare Spalten:** Bezeichnung · Provision % · Gebühr € · Verkäufer (Multi-Sort per Shift+Klick)

Die Spalte **Verkäufer** (`sellerCount`) macht vor einer Änderung sichtbar, wie viele Verkäufer sie trifft — Änderungen wirken sofort live (Abschnitt 4) — und ist dieselbe Zahl, die über die Löschsperre entscheidet (AC-3).

---

## 2. Aktionen

**„+ Neu"-Button** (Seitentitel) → öffnet Popup mit:
- „Name"
- „Provision (%)"
- „Gebühr (€)"

**„Edit"-Button** pro Zeile → öffnet Popup mit denselben Feldern vorausgefüllt.

---

## 3. Default-Type

In den Einstellungen (`defaultTypeId`) wird ein Type als Standard für Selbstregistrierung festgelegt.
Dieser Type wird auf der Login-Seite in der Info-Area als „Default-Konditionen" angezeigt.

---

## 4. Verhalten beim Zuweisen

Voranmelde-App zeigt für einen Verkäufer ausschließlich den zugewiesenen Typ — **kein** Override von Provision/Gebühr pro Verkäufer (siehe `entities.md`: individuelle Anpassung ist Haupt-App-exklusiv, erst bei der Abrechnung).

**Wichtig:** Da kein Snapshot-Feld beim Verkäufer existiert, wirkt sich eine Änderung an Provision/Gebühr eines Typs **sofort live auf alle zugewiesenen Verkäufer** aus (Tabellen-Anzeige in Epic_Verkaeufer, „Meine Konditionen" in Epic_Home_Verkaeufer, „Default-Konditionen" auf der Login-Seite falls Default-Typ betroffen).

---

## 5. Backend & API

API-Details → [`api/seller-types.md`](../../api/seller-types.md)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/seller-types` | `admin` | Liste aller Verkäufer-Typen inkl. `sellerCount`. |
| `POST /api/seller-types` | `admin` | Legt neuen Typ an. `409` bei bereits vergebener Bezeichnung. |
| `PUT /api/seller-types/{id}` | `admin` | Aktualisiert Typ (wirkt sofort live, siehe Abschnitt 4). |
| `DELETE /api/seller-types/{id}` | `admin` | Löscht Typ — `409` falls noch zugewiesen oder aktueller Default-Typ. |

**Durchgehend `admin`:** Anders als bei Marken/Kategorien braucht kein Verkäufer diese Liste — der eigene Typ kommt aufgelöst über `GET /api/profile`, die Default-Konditionen der Login-Seite über `GET /api/public/info`.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN „+ Neu" geklickt wird, THEN SHALL das System ein Popup mit Feldern für Name, Provision (%) und Gebühr (€) öffnen.
2. **AC-2** — WHEN ein neuer Typ gespeichert wird, THEN SHALL das System ihn in der Datenbank anlegen und in der Tabelle anzeigen.
3. **AC-3** — IF ein Verkäufer-Typ gelöscht werden soll, der noch Verkäufern zugewiesen ist, THEN SHALL das System eine Fehlermeldung anzeigen und nicht löschen.
4. **AC-4** — IF ein Verkäufer-Typ gelöscht werden soll, der aktuell der `defaultTypeId` in den Einstellungen ist, THEN SHALL das System die Fehlermeldung „Kann nicht gelöscht werden — ist aktuell Standard-Typ in den Einstellungen" anzeigen und nicht löschen.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #verkäufer-typen #admin #stammdaten #voranmeldung #crud
