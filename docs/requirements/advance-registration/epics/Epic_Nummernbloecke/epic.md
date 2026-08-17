---
id: F-AR-008
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Nummernblöcke

## Index
- Überblick — Konzept
- 1. Block-Anzeige — Darstellung
- 2. Nummernblock-Logik — Vergabe-Regeln
- 3. Hinweis — Admin-Verweis
- 4. Backend & API — Endpoint
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Konto → Nummernblöcke
**Sichtbar für:** Verkäufer (read-only)

Component-Details → [`components/custom/block-liste.md`](../../components/custom/block-liste.md)
Entity-Details → [`entities/nummernblock.md`](../../entities/nummernblock.md)

**Ziel:** Verkäufer sieht seine zugewiesenen Nummernblöcke ein.

**User Story:** Als Verkäufer möchte ich meine zugewiesenen Nummernblöcke einsehen, damit ich weiß, welche Artikelnummern ich vergeben darf.

---

## Überblick

Zeigt dem Verkäufer seine zugewiesenen Nummernblöcke. Nur lesend — keine Möglichkeit, Blöcke zu ändern oder weitere zu beantragen.

---

## 1. Block-Anzeige

Für jeden zugewiesenen Block:

`display: flex; justify-content: space-between; align-items: center; background: #f5f9f6; border: 1px solid #d4e8dc; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px`

| Element | Stil |
|---|---|
| Bereich (z. B. „101 – 110") | 700, 14 px, `--primary` (grün) |
| Zähler (z. B. „10 Nummern · 3 vergeben") | 12 px, muted |

---

## 2. Nummernblock-Logik

- **Startpunkt:** konfigurierbar (`startNumber` in Epic_Einstellungen)
- **Blockgröße:** konfigurierbar (`blockSize` in Epic_Einstellungen)
- Jeder Verkäufer erhält beim Anlegen einen oder mehrere **zusammenhängende** Blöcke
- **Automatische Erweiterung:** Ist der aktuelle Block aufgebraucht und ein neuer Artikel wird angelegt → automatisch nächster freier Block zugewiesen (kanonische Regel — Epic_Meine_Artikel verweist hierher statt sie zu wiederholen)
- Verkäufer kann Blöcke nur **einsehen** — kein Ändern, kein Beantragen

**Vergabe-Kaskade** (verbindliche Auswertungsreihenfolge, jede Stufe beendet bei Erfolg die Kaskade):

1. Freie Nummer in einem bereits zugewiesenen Block vorhanden → kleinste davon vergeben. Kein neuer Block. Fertig.
2. Sonst: global freien Bereich der Größe `blockSize` suchen → als neuen Block dem Verkäufer zuweisen und dessen erste Nummer vergeben. Fertig.
3. Nur wenn Stufe 2 keinen freien Bereich findet → Fehlermeldung „Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren". **Notfall-Pfad**, siehe unten.

**Stufe 3 ist ein Notfall-Pfad.** Es gibt bewusst keine konfigurierbare Obergrenze
des Nummernkreises — ein Block ist über Startnummer und Länge `blockSize` bestimmt,
ein globales Ende wird nicht gepflegt. Die Vergabe läuft ab `startNumber` aufwärts,
ein freier Bereich existiert daher praktisch immer. Stufe 3 wird implementiert und
getestet, ist aber kein fachlicher Regelfall: keine Warnung „Nummern gehen zur
Neige", kein Kontingent-Konzept. Erscheint die Meldung im Test oder Betrieb, ist
zuerst Stufe 2 zu prüfen (AC-5) — nicht der Nummernkreis.

**Stufe 3 ist über keinen anderen Weg erreichbar.** Ein aufgebrauchter Block des
Verkäufers allein löst sie **nicht** aus — dafür existiert Stufe 2. Stufe 2 vergibt
genau **einen** Block (`defaultBlockCount` gilt nur für Erstanlage und
Selbstregistrierung) und der neue Block muss nicht an die bestehenden anschließen.

Technische Auflösung → [`api/blocks.md`](../../api/blocks.md) Abschnitt 5.

---

## 3. Hinweis

Weitere Blöcke können nur vom Admin im Verkäufer-Bearbeiten-Dialog zugewiesen werden. Die komplette Admin-Verwaltung (Anlegen, Reservieren, Löschen, Überschneidungsprüfung) ist **ausschließlich** dort spezifiziert — nicht in diesem Epic.
Details → [Epic_Verkaeufer](../Epic_Verkaeufer/epic.md) Abschnitt 4 (Panel-04 Nummernblöcke).

---

## 4. Backend & API

API-Details → [`api/blocks.md`](../../api/blocks.md) (kanonische Stelle für **alle** Nummernblock-Routen, auch die Admin-Routen unter `/api/sellers/{id}/blocks`)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/blocks/mine` | `authenticated` | Gibt alle Nummernblöcke des eingeloggten Verkäufers zurück, je mit `numberCount` und `usedCount` für die Anzeige „10 Nummern · 3 vergeben". |

Rein lesend — es existiert bewusst kein Endpoint, über den ein Verkäufer Blöcke ändern oder beantragen könnte.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN der Verkäufer die Seite „Konto → Nummernblöcke" öffnet, THEN SHALL das System alle ihm zugewiesenen Blöcke mit Bereich (z. B. „101–110") und Zähler (z. B. „10 Nummern · 3 vergeben") anzeigen.
2. **AC-2** — IF dem Verkäufer noch kein Block zugewiesen ist, THEN SHALL das System einen Hinweistext „Noch keine Nummernblöcke zugewiesen" anzeigen.
3. **AC-3** — WHILE der Verkäufer die Seite betrachtet, SHALL das System keine Bearbeitungs- oder Lösch-Aktionen anbieten (rein lesend).
4. **AC-4** — WHEN der aktuelle Block eines Verkäufers aufgebraucht ist und ein neuer Artikel angelegt wird, THEN SHALL das System automatisch den nächsten freien Block zuweisen und in dieser Ansicht anzeigen.
5. **AC-5** — IF alle Blöcke eines Verkäufers aufgebraucht sind UND global ein freier Nummernbereich der Größe `blockSize` existiert, THEN SHALL das System beim Anlegen eines Artikels einen neuen Block zuweisen und SHALL NICHT die Meldung „Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren" ausgeben.
6. **AC-6** — WHEN das System einen Block über die automatische Erweiterung zuweist, THEN SHALL es genau einen Block der Größe `blockSize` zuweisen, unabhängig von `defaultBlockCount`.
7. **AC-7** — WHERE ein über die automatische Erweiterung zugewiesener Block nicht an die bestehenden Blöcke des Verkäufers anschließt, SHALL das System ihn dennoch zuweisen und in dieser Ansicht als eigenen Bereich aufsteigend nach Startnummer einsortiert anzeigen.
8. **AC-8** — WHEN ein Block zugewiesen werden soll — auf **jedem** Vergabeweg: Selbstregistrierung, Admin-Anlage, Reservierung, automatische Erweiterung — THEN SHALL das System vor dem Speichern prüfen, dass der **gesamte** Bereich von der Startnummer bis `Startnummer + blockSize - 1` frei ist, und SHALL die Vergabe ablehnen, wenn er sich mit einem bestehenden Block irgendeines Verkäufers auch nur teilweise überschneidet.
9. **AC-9** — WHEN mehrere zusammenhängende Blöcke in einem Vorgang zugewiesen werden sollen, THEN SHALL das System prüfen, dass der Gesamtbereich `Anzahl Blöcke × blockSize` **lückenlos** frei ist, und SHALL nicht jeden Block einzeln platzieren.
10. **AC-10** — WHEN die Startnummer aus einem vorher abgerufenen Vorschlag stammt, THEN SHALL das System die Freiheitsprüfung unmittelbar vor dem Speichern erneut ausführen, damit ein zwischenzeitlich durch einen parallelen Vorgang belegter Bereich nicht doppelt vergeben wird.
11. **AC-11** — IF zwei Vergaben denselben Bereich parallel beanspruchen, THEN SHALL das System höchstens eine davon speichern und die andere als Konflikt behandeln — nicht als technischen Fehler.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #nummernblöcke #verkäufer #artikelnummern #zuweisung #stammdaten
