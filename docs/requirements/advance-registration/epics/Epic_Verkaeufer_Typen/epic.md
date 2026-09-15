---
id: F-AR-007
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Verkäufer-Typen

## Index
- Überblick — Konzept
- 1. Tabelle — Typen-Liste
- 2. Filter & Aktionen — Suche, CRUD, Responsive
- 3. Default-Type — Standardtyp
- 4. Verhalten beim Zuweisen — Konditionsübernahme
- 5. Backend & API — Endpoints
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Stammdaten → Verkäufer-Typen
**Sichtbar für:** Admin

Component-Details → [`typ-popup`](../../../../components/typ-popup/component.md)
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

**Leerzustand:** „Noch keine Verkäufer-Typen. Ohne Typ ist keine Registrierung möglich — mit **+ Neu** beginnen." — überschreibt den generischen Text der [`table`](../../../../components/table/component.md) über `emptyText`.

Dies ist die **einzige leere Liste, die die App blockiert**: Ohne gesetzten `defaultTypeId` lehnt die Selbstregistrierung mit `registration.not_enabled` ab, und ein Typ muss dafür erst existieren. Der Text nennt deshalb die Folge und den nächsten Schritt.

Die Spalte **Verkäufer** (`sellerCount`) macht vor einer Änderung sichtbar, wie viele Verkäufer sie trifft — Änderungen wirken sofort live (Abschnitt 4) — und ist dieselbe Zahl, die über die Löschsperre entscheidet (AC-3).

---

## 2. Filter & Aktionen

→ Komponente: [Master-Data-Filter-Toolbar](../../../../components/master-data-filter-toolbar/component.md)

**Freitext-Filter** über der Tabelle filtert live (300 ms Debounce) auf **Bezeichnung**, clientseitig
über die bereits geladene Liste — kein „Suchen"-Button, kein zusätzlicher Server-Request.

**„+ Neu"-Button** steht in derselben Zeile wie der Freitext-Filter (nicht mehr im Tabellen-Header)
→ öffnet Popup mit:
- „Name"
- „Provision (%)"
- „Gebühr (€)"

**„Edit"-Button** pro Zeile → öffnet Popup mit denselben Feldern vorausgefüllt.

**Responsive:** ≥ Tablet (≥ 768 px) Freitext-Feld und „+ Neu"-Button nebeneinander sichtbar.
< Tablet (< 768 px) kollabiert das Freitext-Feld zu einem „Filter"-Button (öffnet Drawer-Overlay von
unten mit demselben Feld), „+ Neu"-Button bleibt daneben sichtbar. Details → Komponenten-Doku.

---

## 3. Default-Type

In den Einstellungen (`defaultTypeId`) wird ein Type als Standard für Selbstregistrierung festgelegt.
Dieser Type wird auf der Login-Seite in der Info-Area als „Default-Konditionen" angezeigt.

---

## 4. Verhalten beim Zuweisen

Voranmelde-App zeigt für einen Verkäufer ausschließlich den zugewiesenen Typ — **kein** Override von Provision/Gebühr pro Verkäufer (siehe `entities/verkaeufer-typ.md`; individuelle Anpassung gibt es erst in der Haupt-App, bei der Abrechnung).

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
5. **AC-5** — WHEN im Freitext-Filter getippt wird, THEN SHALL das System die Tabelle 300 ms nach der letzten Eingabe auf Verkäufer-Typen filtern, deren Bezeichnung den eingegebenen Text enthält (case-insensitive).
6. **AC-6** — WHILE der Viewport < 768 px breit ist, SHALL das System das Freitext-Feld zu einem „Filter"-Button kollabieren; ein Klick öffnet ein Overlay mit demselben Feld. Der „+ Neu"-Button bleibt außerhalb des Overlays sichtbar.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #verkäufer-typen #admin #stammdaten #voranmeldung #crud
