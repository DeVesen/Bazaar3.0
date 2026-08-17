---
name: epic-review
description: Use when reviewing or continuing to review Bazaar Suite epic/requirements docs (Haupt-App/Bazaar-App/Basar-App or Voranmelde-App/Anmelde-App) against DRY/YAGNI before planning+dev — critical grilling-style Q&A per epic, resumable across sessions. Triggers -- "Epic durchgehen", "Epic besprechen", "weiter mit der <App-Name>", "nochmals die <App-Name>", "/epic-review" — App-Name in beliebiger gängiger Schreibweise/Synonym.
---

# Epic Review

Kritische Requirements-Review-Session über die Epics einer Bazaar-App (Voranmelde-App oder Haupt-App), Epic für Epic, in Implementierungs-Reihenfolge. Ziel: Epics sind inhaltlich production-ready (Doku-Ebene) bevor Planning/Dev beginnt.

**Scope — nur Requirements-Ebene:**
- UI-Beschreibung (Aussehen, Aufbau, Verhalten) UND Backend-Konzept (API-Endpunkte, Fehlerfälle, Datenfluss) je Epic
- Kritischer Blick: DRY (Redundanz zwischen Epics), YAGNI (unnötige Komplexität), Lücken, Widersprüche
- Normative Sprache und Auflösungstiefe (siehe unten) — beides ist Pflicht-Prüfdimension je Epic, nicht optional
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

## Pflicht-Prüfdimensionen je Epic

Zusätzlich zu DRY/YAGNI wird jedes Epic gegen diese zwei Punkte geprüft. Treffer → Frage in die aktuelle Frontier aufnehmen, nicht stillschweigend nachbessern.

### 1. Normative Sprache

Jede Anforderung und jedes Akzeptanzkriterium ist verbindlich und binär prüfbar.

- Akzeptanzkriterien in EARS-Form mit `SHALL` (`WHEN … THEN SHALL das System …`, `IF … THEN SHALL …`, `WHILE … SHALL …`)
- Beschreibungstext im Indikativ oder mit „muss"

Verbotene Formulierungen — jede ist ein Zeichen für eine **nicht getroffene Entscheidung**:

| Verboten | Warum |
|---|---|
| sollte, könnte, kann optional | Lässt dem Implementierer die Wahl |
| wäre schön, idealerweise, möglichst, nach Möglichkeit | Wunsch statt Anforderung — entweder verbindlich oder in „Abgrenzung" |
| ggf., bei Bedarf, in der Regel, normalerweise | Versteckt eine unspezifizierte Fallunterscheidung — beide Zweige benennen |
| performant, benutzerfreundlich, sinnvoll, angemessen | Nicht binär prüfbar — messbares Kriterium nennen oder streichen |

Fließtext ist ausdrücklich erlaubt und erwünscht. Geprüft wird die **Verbindlichkeit**, nicht die Form.

### 2. Auflösungstiefe bei Fallback-Logik

Jede Regel mit Fallback — Vergabe, Suche, Retry, Konfliktauflösung, Defaulting, Eskalation — steht als **nummerierte Kaskade**, nie als Ein-Satz-Regel. Der Ein-Satz-Fassung fehlt die Information, wo der Implementierer aufhören darf.

Die Kaskade nennt:
1. Jede Stufe in Auswertungsreihenfolge mit ihrer Vorbedingung
2. Was die Stufe bei Erfolg tut und dass sie die Kaskade beendet
3. Die **letzte** Stufe — Fehler-/Verweigerungsfall — plus die exakte Bedingung, unter der sie erreichbar ist

Wenn eine naheliegende Fehl-Lesart im Fehlerfall landen würde, wird explizit dazugeschrieben, welcher Zustand ihn **nicht** auslöst. Danach ein Akzeptanzkriterium auf genau den Zweig, den eine Abkürzungs-Implementierung falsch machen würde — nicht nur Happy Path und Fehlerfall.

**Review-Frage, die in jedem Epic gestellt wird:** „Enthält dieses Epic eine Regel mit Fallback-Verhalten, die nicht als Kaskade ausformuliert ist?"

**Zusatzprüfung:** Ist ein Fehlerfall spezifiziert, dessen Auslösebedingung mit den vorhandenen Parametern nie eintreten kann, ist entweder ein Parameter oder das Kriterium falsch — beides ansprechen.

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
| Regel mit Fallback als Ein-Satz-Regel gefunden | Kaskade einfordern (Prüfdimension 2), inkl. Bedingung für den Fehlerfall |
| „sollte" / „idealerweise" / „ggf." im Epic gefunden | Als offene Entscheidung behandeln, Frage in die Frontier, danach verbindlich umformulieren |
| Fehlerfall ohne erreichbare Auslösebedingung | Ansprechen: fehlender Parameter oder überflüssiges Kriterium |
