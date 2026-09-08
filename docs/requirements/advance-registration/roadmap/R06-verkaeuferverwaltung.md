---
id: ROADMAP-R06
status: draft
updated: 2026-09-08
---

# R06 — Verkäuferverwaltung

**Voranmelde-App · Roadmap-Schritt 6 von 12**

## Worum es geht

Der Admin bekommt den zweiten Weg ins System: Er legt Verkäufer selbst an und lädt sie per
Link ein, statt darauf zu warten, dass sie sich registrieren. Er weist Nummernblöcke zu,
pflegt Verkäuferdaten und entfernt Konten.

## Umfang

- [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) vollständig — Liste mit Filter-Panel,
  Anlege-Dialog mit `blockCount`, Bearbeiten-Dialog inklusive `isAdmin`, Löschen
- Einladungs-Flow: `POST /api/sellers/{id}/invite` erzeugt einen 7 Tage gültigen Link;
  ein erneuter Aufruf entwertet den vorherigen. Der Link kopiert sich per Toast-Bestätigung
  in die Zwischenablage ([`spec.md`](../spec.md) §12.2).
- `POST /api/auth/set-password` aus [Epic_Login](../epics/Epic_Login/epic.md): Der Eingeladene
  setzt über den Link sein Passwort und ist danach angemeldet.
- Blockverwaltung durch den Admin: `POST /api/sellers/{id}/blocks` reserviert einen weiteren
  Block, `DELETE .../blocks/{blockId}` entfernt einen Block, solange keine Nummer vergeben ist
- Schutzregeln: `409` beim letzten Admin und bei Selbstlöschung; Löschen eines Verkäufers
  entfernt dessen Artikel, Nummernblöcke und Refresh-Tokens mit

## Nicht in diesem Schritt

- E-Mail-Versand der Einladung — der Link wird im Dialog angezeigt und kopiert
- Profil-Tabs für E-Mail, Passwort, Account löschen — R07
- Artikelübersicht des Admins — R08

## Setzt voraus

[R05](R05-stammdaten.md) — Verkäufer-Typen sind pflegbar und dem Verkäufer beim Anlegen
zuweisbar.

## Fertig, wenn — von Hand prüfbar

1. Als Admin einen Verkäufer mit zwei initialen Blöcken anlegen → er steht in der Liste,
   seine Nummernblöcke sind vergeben.
2. Für diesen Verkäufer einen Einladungs-Link erzeugen, ihn in einem zweiten Browser öffnen,
   ein Passwort setzen → man ist als dieser Verkäufer angemeldet und kann Artikel erfassen.
3. Erneut einen Link erzeugen → der alte Link funktioniert nicht mehr.
4. Beim Verkäufer `isAdmin` setzen → nach dessen erneuter Anmeldung sind die Admin-Einträge
   der Sidebar sichtbar.
5. Einen weiteren Block zuweisen → er erscheint beim Verkäufer unter „Nummernblöcke".
6. Versuch, einen Block mit vergebener Nummer zu löschen → wird abgelehnt; ein leerer Block
   lässt sich löschen.
7. Versuch, das eigene Admin-Konto oder den letzten Admin zu löschen → wird abgelehnt.
8. Einen Verkäufer mit Artikeln löschen → Verkäufer, Artikel und Blöcke sind weg, die Nummern
   des Blocks sind wieder frei.

## Quellen

- [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) · [Epic_Login](../epics/Epic_Login/epic.md) Abschnitt 7
- [`api/sellers.md`](../api/sellers.md) · [`api/auth.md`](../api/auth.md) · [`api/blocks.md`](../api/blocks.md)
- [components/verkaeufer-dialog.md](../components/verkaeufer-dialog.md)
- [`spec.md`](../spec.md) §5 Registrierung & Einladung · §6 Nummernblock-System

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #verkaeufer #admin #einladung
