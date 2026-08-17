---
id: F-AR-006
code: VERK-VA
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Verkäufer (Admin)

## Index
- Überblick — Konzept
- 1. Filter-Panel — Filteroptionen
- 2. Tabelle — Verkäuferliste
- 3. Dialog: Neuen Verkäufer anlegen — Anlage
- 4. Dialog: Verkäufer bearbeiten — Bearbeitung
- 5. Dialog-Größe — Layout
- 6. Backend & API — Endpoints
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Verwaltung → Verkäufer
**Sichtbar für:** Admin

**Ziel:** Admin verwaltet Verkäufer-Registrierungen in der Voranmelde-App.

Entity-Details → [`entities/verkaeufer.md`](../../entities/verkaeufer.md)

**User Story:** Als Admin möchte ich Verkäufer-Registrierungen verwalten und Nummernblöcke zuweisen, damit jeder Verkäufer eindeutige Artikelnummern hat.

---

## Überblick

Admin-Übersicht aller Verkäufer mit Anlage-, Bearbeitungs- und Einladungs-Funktionen.

---

## 1. Filter-Panel

Details → [`verkaeufer-dialog`](../../components/verkaeufer-dialog.md) (deckt Filter-Panel + Dialoge in einer Datei ab).

**„+ Neu"-Button** befindet sich ausschließlich im Seitentitel (Page-Header) — nicht in der Filter-Toolbar.

Filterbereich:
- Freitext-Suche (Name, Ort, E-Mail) — `p-iconfield` mit Such-Icon

---

## 2. Tabelle (`table-admin-verkaeufer`)

→ Komponente: [Table](../../../../components/table/component.md)

**Sortierbare Spalten:** Nr. · Vorname · Nachname · PLZ · Ort · Typ · Provision · Gebühr · Artikel (Multi-Sort per Shift+Klick)

**Provision/Gebühr** sind read-only, vom gewählten Verkäufer-**Typ** abgeleitete Anzeigewerte — kein individueller Override in der Voranmelde-App (siehe `entities/verkaeufer-typ.md`; eigene Konditionsfelder pro Verkäufer gibt es erst in der Haupt-App, dort bei der Abrechnung anpassbar).

**Spalte „Nr."** zeigt die `fromNumber` des **ersten** Nummernblocks des Verkäufers — kein eigenes Entity-Feld. Eine zweite fortlaufende Nummernwelt neben den Artikelnummern wäre nur verwechslungsanfällig, und am Basar-Tag wird ohnehin nach „Verkäufer 101" gesucht. Leer, solange kein Block zugewiesen ist.

**„+ Neu"-Button** (Seitentitel) → öffnet Dialog „Neuen Verkäufer anlegen".
**Edit-Button** pro Zeile → öffnet Dialog „Verkäufer bearbeiten".
**Löschen-Button** pro Zeile → `p-confirmdialog`, danach `DELETE /api/sellers/{id}` (löscht Verkäufer samt Artikeln und Nummernblöcken). Nicht verfügbar für den eigenen Account und für den letzten verbliebenen Admin.

---

## 3. Dialog: Neuen Verkäufer anlegen

Enthält Panel 01–03 (Personendaten, Kontakt, Konditionen) sowie **Nummernblock-Initialfeld**.

**Panel-Styling** (alle drei Panels): `background: #f5f9f6; border: 1px solid #d4e8dc; border-radius: 8px; padding: 15px 16px`. Panel-Titel: 11 px, 700, uppercase, `#3a7057`.

### Panel 01 — Personendaten

| Feld | Pflicht | PrimeNG |
|---|---|---|
| Vorname | ✅ | `pInputText`, `pAutoFocus` (Fokus beim Öffnen des Dialogs) |
| Nachname | ✅ | `pInputText` |

Layout: `[Vorname 50%] [Nachname 50%]` / `[Anschrift 100%]` / `[PLZ 50%] [Ort 50%]`.

### Panel 02 — Kontakt

| Feld | Pflicht | PrimeNG |
|---|---|---|
| Anschrift | ❌ | `pInputText` |
| PLZ | ✅ | `pInputText` |
| Ort | ✅ | `pInputText` |
| Telefon | ✅ | `pInputText` |
| E-Mail (= Login) | ✅ | `pInputText` |

Layout: `[Telefon 50%] [E-Mail 50%]`.

### Panel 03 — Konditionen

| Feld | Pflicht | PrimeNG |
|---|---|---|
| Verkäufer-Typ | ✅ | `p-select` (nur bestehende Typen — kein Inline-Anlegen wie bei Marke/Kategorie: ein Typ braucht zwingend Provision+Gebühr, das `autocomplete-create`-Anlegen-Modal hat aber nur ein Namensfeld. Neue Typen ausschließlich über Epic_Verkaeufer_Typen.) |

Darunter read-only Anzeige: „Provision: X % · Gebühr: Y € pro Stück" — abgeleitet vom gewählten Typ, kein eigenes Eingabefeld (`p-inputnumber` locale DE, `minFractionDigits="2"`, `[readonly]="true"`).

### Nummernblock-Initialfeld

| Feld | Beschreibung |
|---|---|
| **Startnummer** | Erste Artikelnummer (Standard: nächste freie Nummer) |
| **Anzahl initialer Blöcke** | Anzahl zusammenhängender Blöcke beim Anlegen (Standard: `defaultBlockCount`) |

Nach dem Anlegen: Admin kann optional sofort den **Einladungs-Link** kopieren (Details → Panel 05).

---

## 4. Dialog: Verkäufer bearbeiten

Enthält Panel 01–03 + zwei zusätzliche Panels:

### Panel 04 — Nummernblöcke (nur beim Bearbeiten)

**Bestehende Blöcke:**
Für jeden Block: Bereich (Nr. X–Y) · Anzahl Nummern · Anzahl bereits vergebener Nummern.

| Element | Stil |
|---|---|
| Bereich (z. B. „101 – 110") | 700, 14 px, grün |
| Zähler | 12 px, muted |
| Löschen-Button | Nur wenn 0 Nummern vergeben; `secondary outlined small`, Icon 🗑; Klick öffnet `p-confirmdialog` (Muster wie Epic_Meine_Artikel) vor dem tatsächlichen Löschen |
| Badge „Voll — nicht löschbar" | warn; wenn ≥ 1 Nummer vergeben |

**Neue Blöcke reservieren** (unterhalb der Block-Liste):
- Trennlinie (border-top 1 px), pt 12 px, mt 14 px
- Label (12 px, muted): „Zusätzliche Blöcke reservieren:"
- 2-Spalten-Grid: `p-inputnumber` „Anzahl Blöcke" + `p-inputnumber` „Startnummer (Vorschlag)"
- **Vorschlag-Berechnung:** System schlägt automatisch nächste freie Startnummer vor — die ab der `Anzahl Blöcke × BlockSize` Nummern lückenlos frei sind.
  - Beispiel: BlockSize=10, Anzahl=2 → benötigt 20 freie Nummern; 1–10 und 21–30 belegt → Vorschlag: 31
  - Berechnet **serverseitig** über `GET /api/blocks/next-free?blockCount=<n>` — das Frontend kennt die Blöcke anderer Verkäufer nicht. Wird beim Öffnen des Panels und bei jeder Änderung von „Anzahl Blöcke" neu gerufen.
- Hinweistext (12 px, muted): Berechnungsregel
- **„✓ Reservieren"-Button** (`p-button severity="primary" size="small"`): Prüft vor dem Speichern ob Nummern frei sind — bei Konflikt: Fehlermeldung; bei Erfolg: Block reserviert

### Panel 05 — Sonstiges

```
[ p-checkbox ]  Dieser Verkäufer hat Admin-Rechte
```
`p-checkbox` + `<label>` nebeneinander, gap 10 px, 14 px.

```
[ 📋 Einladungs-Link generieren ]  ← p-button secondary outlined small
```
Klick → Link in Zwischenablage + Toast „✓ Einladungs-Link kopiert!".

**Toggle-Schalter „Admin-Rechte":** Gibt nach Login die vollständige Admin-Ansicht frei. Nur für Admins sichtbar.

**Einladungs-Link-Mechanismus:** Admin legt den Verkäufer ohne Passwort an. Der Link enthält ein einmaliges Token (`inviteToken`, gültig 7 Tage — `inviteTokenExpiresAt`) und öffnet eine öffentliche „Passwort festlegen"-Seite (kein bestehendes Passwort nötig). Nach dem Setzen ist der Verkäufer regulär eingeloggt.

---

## 5. Dialog-Größe

Admin-Seller-Dialog: Größe `lg` (max 940 px). Responsive: `≥ 768 px` → 80 % Breite / 90 % Höhe; `< 768 px` → 100 % / 100 %, kein `border-radius` (Standard-Modal-Regel, siehe Epic_App_Shell VSHELL-S02).

**Footer:** `[ Abbrechen ]` (`p-button secondary outlined`) `[ Speichern ]` (`p-button primary`).

**Erfolg/Fehler:** Speichern erfolgreich → Toast „✓ Verkäufer gespeichert". Speichern fehlgeschlagen → eingegebene Werte bleiben erhalten, Fehlermeldung „Verkäufer konnte nicht gespeichert werden" in einer Error-InfoArea.

---

## 6. Backend & API

API-Details → [`api/sellers.md`](../../api/sellers.md) · Nummernblock-Routen → [`api/blocks.md`](../../api/blocks.md)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/sellers` | `admin` | Liste aller Verkäufer, paginiert, Freitext-Filter (Vorname, Nachname, Ort, E-Mail). |
| `POST /api/sellers` | `admin` | Legt Verkäufer an (ohne Passwort) + `blockCount` initiale Nummernblöcke. |
| `PUT /api/sellers/{id}` | `admin` | Aktualisiert Verkäufer-Daten inkl. `isAdmin`. |
| `DELETE /api/sellers/{id}` | `admin` | Löscht Verkäufer + Artikel + Nummernblöcke. `409` beim letzten Admin und bei Selbstlöschung. |
| `POST /api/sellers/{id}/invite` | `admin` | Generiert `inviteToken` (7 Tage gültig) und gibt den fertigen Einladungs-Link zurück. Erneuter Aufruf entwertet das alte Token. |
| `POST /api/sellers/{id}/blocks` | `admin` | Reserviert neuen Nummernblock (Panel 04). |
| `DELETE /api/sellers/{id}/blocks/{blockId}` | `admin` | Löscht Block, nur wenn keine Nummer vergeben ist. |

**`DELETE /api/sellers/{id}` ist neu** — Epic_Profil Abschnitt 4 setzt voraus, dass ein Admin fremde (auch Admin-)Accounts über diese Seite löschen kann; ein Endpoint dafür fehlte. Die Verkäufer-Tabelle bekommt dafür einen Löschen-Button pro Zeile (Bestätigung über `p-confirmdialog`).

**Rückwirkung auf Epic_Login:** neuer öffentlicher Endpoint `POST /api/auth/set-password` (Token aus Invite-Link → setzt Passwort, loggt danach ein) — dort nachgetragen.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN die Verkäufer-Seite geöffnet wird, THEN SHALL das System alle registrierten Verkäufer in einer Tabelle anzeigen.
2. **AC-2** — WHEN einem Verkäufer ein Nummernblock zugewiesen wird, THEN SHALL das System sicherstellen, dass dieser Block keinem anderen Verkäufer gleichzeitig zugewiesen ist.
3. **AC-3** — WHEN ein Verkäufer-Datensatz bearbeitet wird, THEN SHALL das System die Änderungen in der Datenbank speichern und die Tabelle aktualisieren.
4. **AC-4** — IF ein Pflichtfeld aus Panel 01–03 beim Speichern leer ist, THEN SHALL das System eine Fehlermeldung unter dem Feld anzeigen und nicht speichern.
5. **AC-5** — WHEN Admin im Bearbeiten-Dialog (Panel 04) „✓ Reservieren" klickt und die vorgeschlagenen Nummern frei sind, THEN SHALL das System den neuen Block anlegen und in der Blockliste anzeigen.
6. **AC-6** — IF sich die zu reservierenden Nummern (Panel 04) mit einem bestehenden Block überschneiden, THEN SHALL das System eine Fehlermeldung „Nummernbereich überschneidet sich mit bestehendem Block" anzeigen und nicht speichern.
7. **AC-7** — WHEN Admin einen Block ohne vergebene Nummern löschen möchte, THEN SHALL das System den Löschen-Button anzeigen und den Block nach Bestätigung entfernen (wieder frei für andere Zuweisungen).
8. **AC-8** — IF ein Block mindestens eine vergebene Nummer enthält, THEN SHALL das System statt des Löschen-Buttons das Badge „Voll — nicht löschbar" anzeigen und ein Löschen verhindern.
9. **AC-9** — WHEN Admin „Einladungs-Link generieren" klickt, THEN SHALL das System einen Link mit einmaligem, 7 Tage gültigem Token erzeugen und in die Zwischenablage kopieren.
10. **AC-10** — WHEN ein Verkäufer erfolgreich gespeichert wird, THEN SHALL das System einen Toast „✓ Verkäufer gespeichert" anzeigen.
11. **AC-11** — IF das Speichern fehlschlägt, THEN SHALL das System die eingegebenen Werte erhalten und „Verkäufer konnte nicht gespeichert werden" in einer Error-InfoArea anzeigen.
12. **AC-12** — WHEN Admin den Löschen-Button einer Verkäufer-Zeile bestätigt, THEN SHALL das System den Verkäufer samt seinen Artikeln löschen, anschließend seine Nummernblöcke freigeben und seine Refresh-Token-Zeilen löschen (der Zugang ist damit sofort tot).
13. **AC-13** — IF der zu löschende Verkäufer der letzte Account mit Admin-Rechten ist, THEN SHALL das System die Meldung „Der letzte Admin kann nicht gelöscht werden" anzeigen und nicht löschen.
14. **AC-14** — IF Admin den eigenen Account über die Verkäufer-Tabelle löschen möchte, THEN SHALL das System die Aktion ablehnen und auf die Profil-Seite verweisen.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #verkäufer #admin #registrierung #nummernblock #voranmeldung
