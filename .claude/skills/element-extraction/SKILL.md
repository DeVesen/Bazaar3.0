---
name: element-extraction
description: Use when extracting Components, Entities, or API-Endpoints out of already-reviewed Bazaar Suite epics (Haupt-App/Bazaar-App/Basar-App or Voranmelde-App/Anmelde-App) into a central, app-wide location and consolidating near-duplicates. Triggers -- "Componenten extrahieren", "Entitäten extrahieren", "Api extrahieren", "Api zentral legen", "/element-extraction" — App-Name und Kategorie in beliebiger gängiger Schreibweise/Synonym.
---

# Element Extraction & Consolidation

Strukturierungs-Session **nach** dem inhaltlichen Epic-Review (siehe `epic-review`-Skill). Hier wird nicht mehr fachlich diskutiert, sondern eine der drei Kategorien — **Components**, **Entities** oder **API** — aus allen Epics einer App herausgezogen, zentral abgelegt und wo sinnvoll zusammengeführt.

**Voraussetzung:** Alle Epics der Ziel-App haben `status: reviewed` (via `epic-review`). Läuft eine App noch, erst dort weitermachen.

## App + Kategorie ermitteln

| Gesagt (Beispiele) | Ordner |
|---|---|
| Haupt-App, Bazaar-App, Basar-App, Hauptanwendung | `bazaar-app/` |
| Voranmelde-App, Anmelde-App, Registrierungs-App | `advance-registration/` |

Tippfehler/Schreibvarianten gelten als dieselbe App — sinngemäß auflösen, nicht nachfragen.

Kategorie ist eine von: `components`, `entities`, `api`. Zielverzeichnis immer: `docs/requirements/<app>/<kategorie>/`.

## Ablauf

### 1. Inventur (keine Dateien schreiben)

- Alle `epics/<Epic>/epic.md` + `stories/*.md` der App lesen.
- Referenzierte zentrale Quellen mitlesen:
  - `docs/requirements/entities.md` — App-übergreifendes, kanonisches Datenmodell (bei Entities-Kategorie Pflichtlektüre)
  - `docs/components/*/component.md` — Suite-weite Shared Components (bei Components-Kategorie Pflichtlektüre — nicht duplizieren, nur verlinken)
  - `docs/requirements/<app>/components/`, `.../entities/`, `.../api/` — falls aus früherer Runde bereits vorhanden
- Pro Kategorie sammeln:
  - **Components:** jedes einzelne UI-Element (PrimeNG-Komponente, `<div>`, Popup, Formular-Feld, Panel …), das im Epic-Text explizit auftaucht — bis runter zu atomaren Feldern (Input, Select, Button …), nicht nur ganze Dialoge.
  - **Entities:** jede fachliche Entität in ihrer app-spezifischen Feld-Ausprägung (nur die für diese App relevanten Felder, mit Verweis auf `entities.md` als kanonische Quelle).
  - **API:** jeder Endpoint (Methode + Pfad + Auth-Anforderung + Request/Response-Form) je Epic.
- Ergebnis: vollständige, nach Epic gruppierte Kandidatenliste dem Nutzer vorlegen — **noch nichts persistieren**.

### 2. Walkthrough je Element (Grilling-Stil)

- Ein Element (oder eine klar zusammenhängende Kleingruppe) nach dem anderen, nicht alle auf einmal.
- Kontext zeigen, kategoriespezifisch:
  - **Components:** ASCII-Ausschnitt der Seite/des Dialogs, in dem das Element sitzt — genug Umgebung zur Einordnung, nicht der ganze Screen.
  - **Entities:** gefilterte Feldtabelle (nur app-relevante Felder, Typ, Pflicht, Bemerkung).
  - **API:** Endpoint-Signatur + Beispiel-Request/Response.
- Offene Entscheidungen als Q1..Qn stellen, **jede mit einer klaren Empfehlung** — Nutzer entscheidet (Empfehlung annehmen oder eigene Antwort). Mehrdeutige „ja"-Antworten auf Auswahlfragen **immer** nachfragen, nie raten.
- Widersprüche — zwischen Epics, oder gegen die kanonische Quelle (`entities.md`, Suite-Shared-Docs) — sofort als Fund melden (mit Zitat + Korrekturvorschlag), nicht stillschweigend auflösen.
- Nach Bestätigung: Datei **direkt zentral** anlegen unter `docs/requirements/<app>/<kategorie>/<name>.md` (kein epic-lokales Zwischenlager mehr nötig — das war nur in der allerersten Runde ein bewusster Zwischenschritt, um Redundanz sichtbar zu machen).
- Im betroffenen `epic.md` (ggf. Story) einen `Component-Details →` / `Entity-Details →` / `API-Details →`-Verweis auf die zentrale Datei setzen oder aktualisieren.

### 3. Konsolidierung (laufend, nicht erst am Ende)

- Liegen zwei zentrale Dateien nebeneinander und überlappen stark (gleiches Element/Verhalten, nur andere Datenquelle oder Epic) → zu **einer** Datei mit Varianten-Tabelle zusammenführen statt zwei separate zu behalten (Referenzmuster: `advance-registration/components/countdown-timeline-page.md`-Verweis auf `docs/components/countdown/`, oder `advance-registration/components/filter-panel.md`, `home-dashboard.md`).
- **Components zusätzlich:** ist ein Formular-Feld nur eine Instanz eines generischen Bausteins (Input/Select/Button/Checkbox/Datepicker/Confirmdialog/Toast …), diesen Baustein als eigene atomare Datei anlegen (falls noch nicht vorhanden) und aus dem Formular/Dialog nur darauf verlinken statt ihn erneut zu beschreiben (Referenzmuster: `advance-registration/components/input.md`, `select.md`, `button.md`).
- **API zusätzlich:** wiederkehrende Querschnitts-Muster (Fehler-Response-Form, Paginierung, Auth-Header/-Schema, Standard-CRUD-Routen-Namensmuster, Toast/Info-Area-Kopplung an bestimmte Endpoint-Typen) als eigenes Cross-Cutting-Dokument festhalten statt pro Endpoint zu wiederholen.
- Bereits Suite-weit vorhandene Shared Docs (`docs/components/*`) **nicht** duplizieren — nur verlinken. Zeigt sich ein Element als tatsächlich App-übergreifend (identisch in Haupt-App UND Voranmelde-App), gehört es nach `docs/components/` bzw. `docs/requirements/entities.md` statt in die App-lokale Kategorie — im Zweifel fragen, nicht selbst entscheiden.

### 4. Abschluss

- Link-Integritätscheck über den ganzen `docs/`-Baum (relative Pfade ändern sich bei jedem Verschieben/Zusammenführen — nachrechnen, nicht schätzen).
- Kompakte Zusammenfassung: Anzahl Dateien je Kategorie, vorgenommene Konsolidierungen, gefundene Lücken/offene Punkte.
- Nichts committen ohne Rückfrage.

## Sprache & Stil

- Doku auf Deutsch, Code/Pfade/PrimeNG-Namen/API-Routen englisch (Projekt-Konvention).
- DRY/YAGNI-kritisch bleiben, wie beim Epic-Review selbst.
- Empfehlen, nicht entscheiden — bei echten Alternativen nie ungefragt eine PrimeNG-/API-Design-Wahl treffen.

## Quick Reference

| Situation | Aktion |
|---|---|
| Neue Kategorie/App, noch nichts extrahiert | Bei Schritt 1 (Inventur) einsteigen |
| Inventur vorhanden, aber noch nicht alle Elemente besprochen | Bei Schritt 2 fortsetzen, dort wo abgebrochen wurde |
| Zwei zentrale Dateien überlappen stark | Sofort ansprechen, Merge-Vorschlag mit Empfehlung |
| Element ist App-übergreifend identisch | Nachfragen ob es stattdessen nach `docs/components/`/`entities.md` gehört |
| Alle Elemente einer Kategorie durch | Link-Check, Zusammenfassung, dann nächste Kategorie oder nächste App |
