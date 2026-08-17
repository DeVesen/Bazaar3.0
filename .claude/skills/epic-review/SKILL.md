---
name: epic-review
description: Use when reviewing or continuing to review Bazaar Suite epic/requirements docs (Haupt-App/Bazaar-App/Basar-App or Voranmelde-App/Anmelde-App) against DRY/YAGNI before planning+dev — critical grilling-style Q&A per epic, resumable across sessions. Triggers -- "Epic durchgehen", "Epic besprechen", "weiter mit der <App-Name>", "nochmals die <App-Name>", "/epic-review" — App-Name in beliebiger gängiger Schreibweise/Synonym.
---

# Epic Review

Kritische Requirements-Review-Session über die Epics einer Bazaar-App (Voranmelde-App oder Haupt-App), Epic für Epic, in Implementierungs-Reihenfolge. Ziel: Epics sind inhaltlich production-ready (Doku-Ebene) bevor Planning/Dev beginnt.

**Scope — nur Requirements-Ebene:**
- UI-Beschreibung (Aussehen, Aufbau, Verhalten) UND Backend-Konzept (API-Endpunkte, Fehlerfälle, Datenfluss) je Epic
- Kritischer Blick: DRY (Redundanz zwischen Epics), YAGNI (unnötige Komplexität), Lücken, Widersprüche
- **Kein** Development-Planning, **keine** File-Struktur-Diskussion (das ist App/Suite-Ebene, nicht Epic-Ebene)

**REQUIRED SUB-SKILL:** Use mattpocock-skills:grilling für den Frage-Mechanismus (Design-Tree/Frontier, nummerierte ❓-Fragen mit ➡️-Empfehlung, Runde für Runde, warten auf Antwort). Hier zusätzlich: Fragen-Quelle ist ausschließlich das Epic (+ Stories) selbst und dessen Querbezüge zu bereits reviewten Epics — nicht freie Themen.

## Ablauf

1. **App + Reihenfolge ermitteln** — [docs/requirements/overview.md](../../../docs/requirements/overview.md), Epic-Liste der jeweiligen App in dort gelisteter Reihenfolge. App-Name im User-Prompt ist frei/umgangssprachlich, immer auf einen der zwei Ordner auflösen:

   | Gesagt (Beispiele) | Ordner |
   |---|---|
   | Haupt-App, Bazaar-App, Basar-App, Hauptanwendung | `bazaar-app/` |
   | Voranmelde-App, Anmelde-App, Registrierungs-App | `advance-registration/` |

   Tippfehler/Groß-Kleinschreibung/Bindestrich-Varianten (z. B. „Bazzar-App", „basar app") gelten als dieselbe App — nicht nachfragen, sinngemäß auflösen.
2. **Einstiegspunkt bestimmen** (siehe Resume-Logik unten).
3. **Pro Epic:**
   - Epic.md (+ stories/, falls vorhanden) lesen.
   - Grilling-Runden: unabhängige Fragen der aktuellen Frontier stellen, User antwortet pro Frage (Empfehlung akzeptieren oder eigene Meinung), nächste Runde aus neu aufgemachten Folgefragen — bis Frontier leer.
   - Wirkt eine Antwort auf ein **bereits reviewtes** Epic zurück (z. B. Auth-Änderung betrifft App-Shell) → sofort benennen, nicht stillschweigend liegen lassen.
   - **Abschluss-Zusammenfassung:** alle Entscheidungen des Epics kompakt auflisten, fragen ob der User noch etwas ergänzen will.
   - Bei Zufriedenheit: **persistieren** (Edit der echten epic.md/story-Dateien) + **Status markieren** (siehe unten).
4. Weiter zum nächsten Epic der Reihenfolge (User bestätigen lassen, nicht automatisch durchrauschen).

## Resume-Logik (Status-Marker)

Jedes Epic hat im YAML-Frontmatter ein `status`-Feld (bereits vorhandene Konvention, aktuell durchgehend `draft`).

- **Reviewt:** `status: reviewed` + `reviewed-date: YYYY-MM-DD` im Frontmatter setzen, sobald ein Epic durchgesprochen UND persistiert ist.
- **"weiter mit der `<App>`"** → Epic-Liste der App in overview.md-Reihenfolge durchgehen, beim **ersten Epic ohne `status: reviewed`** einsteigen. Bereits reviewte Epics werden nicht erneut befragt (nur kurz genannt, dass sie übersprungen werden).
- **"nochmals die `<App>`"** → Status-Feld ignorieren, immer beim ersten Epic der App-Liste neu beginnen. Am Ende jedes erneut reviewten Epics wird `reviewed-date` aktualisiert.
- Setup-Epics (`Epic_Projektanlage`, `Epic_App_Shell` bzw. Haupt-App-Äquivalent) zählen mit — auch technische Themen (Docker, Deployment, Skripte) werden gegrillt, nicht nur UI/Backend-Business.

## Quick Reference

| Situation | Aktion |
|---|---|
| User: "Epic X durchgehen" | Direkt bei Epic X einsteigen, Frontier für dieses Epic aufbauen |
| User: "weiter mit der Voranmelde-App" | Ersten Epic ohne `status: reviewed` in overview.md-Reihenfolge suchen |
| User: "nochmals die Voranmelde-App" | Bei Epic 1 der Liste neu beginnen, Status ignorieren |
| Antwort betrifft anderes (auch reviewtes) Epic | Sofort benennen, Änderung nachtragen wenn User zustimmt |
| Epic-Fragen beantwortet, User zufrieden | Zusammenfassung → Rückfrage → persistieren → Status setzen |
