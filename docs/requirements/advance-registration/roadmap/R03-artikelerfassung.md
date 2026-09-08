---
id: ROADMAP-R03
status: draft
updated: 2026-09-08
---

# R03 — „Ich erfasse Artikel"

**Voranmelde-App · Roadmap-Schritt 3 von 12 · Kernnutzen der App**

## Worum es geht

Der eigentliche Zweck der Voranmelde-App wird benutzbar: ein Verkäufer erfasst seine Artikel
vorab. Er legt einen Artikel an, bekommt automatisch die nächste Nummer aus seinem Block,
wählt Marke und Kategorie per AutoComplete — und legt dabei fehlende Marken und Kategorien
direkt selbst an.

Nach diesem Schritt kann ein Verkäufer die App zum ersten Mal so benutzen, wie sie gedacht ist.

## Umfang

- [Epic_Meine_Artikel](../epics/Epic_Meine_Artikel/epic.md), Kernteil:
  Tabelle der eigenen Artikel, Anlege-Dialog, Bearbeiten-Dialog, Löschen mit Rückfrage
- Entität [`artikel`](../entities/artikel.md) samt Migration, inklusive `createdAt`/`updatedAt`
  nach [`spec.md`](../spec.md) §11.4
- Endpoints `GET /api/articles/mine`, `GET /api/articles/next-number`, `POST /api/articles`,
  `PUT /api/articles/{id}`, `DELETE /api/articles/{id}` → [`api/articles.md`](../api/articles.md).
  Die Artikelnummer vergibt **der Server** aus dem Nummernblock des angemeldeten Verkäufers;
  fremde Artikel sind serverseitig gesperrt.
- Entitäten [`marke`](../entities/marke.md) und [`kategorie`](../entities/kategorie.md) samt
  Migration und den Endpoints `GET`/`POST` — beide `authenticated`, mit serverseitig gesetztem
  `original`-Flag aus der Rolle ([`spec.md`](../spec.md) §11.2)
- AutoComplete-Verhalten nach [`spec.md`](../spec.md) §11.3: Dropdown öffnet beim Anklicken,
  unbekannter Wert löst das Popup „‹XYZ› als neue Marke/Kategorie speichern?" aus
- Toast-Bestätigungen nach [`spec.md`](../spec.md) §12.2

## Nicht in diesem Schritt

- Verwaltungsseiten für Marken, Kategorien und Verkäufer-Typen (`PUT`/`DELETE`) — R05
- Filter-Panel, Paginierung, Sortierung, „Speichern + kopieren", automatische
  Blockerweiterung, `expectedNumber`-Konfliktbehandlung — R04
- Artikelübersicht des Admins über alle Verkäufer — R08

## Setzt voraus

[R02](R02-nummer-und-profil.md) — jeder Verkäufer hat einen Nummernblock, aus dem Nummern
vergeben werden können.

## Fertig, wenn — von Hand prüfbar

1. Als Verkäufer einen Artikel anlegen → er erscheint in der Liste, die Artikelnummer stammt
   aus dem eigenen Block und war im Dialog nicht editierbar.
2. Im Marken-Feld einen Namen tippen, den es nicht gibt → Popup fragt nach, nach Bestätigung
   ist die Marke angelegt und dem Artikel zugewiesen.
3. Dieselbe Marke beim nächsten Artikel → sie steht im Dropdown, wird nicht doppelt angelegt.
4. Einen Artikel bearbeiten und speichern → Änderung steht in der Liste.
5. Einen Artikel löschen → Rückfrage, danach ist er weg.
6. Mit einem zweiten Verkäufer-Konto anmelden → dessen Liste ist leer, die Artikel des ersten
   Verkäufers sind nicht sichtbar.
7. Versuch, per direktem API-Aufruf einen fremden Artikel zu ändern → wird abgelehnt.

## Quellen

- [Epic_Meine_Artikel](../epics/Epic_Meine_Artikel/epic.md)
- [`api/articles.md`](../api/articles.md) · [`api/master-data.md`](../api/master-data.md)
- [components/artikel-dialog.md](../components/artikel-dialog.md)
- [`spec.md`](../spec.md) §11.2 `original`-Flag · §11.3 AutoComplete · §11.4 Timestamps · §11.5 IDs

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #artikel #kernnutzen
