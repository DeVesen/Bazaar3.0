---
name: suite-plan
description: Use when planning, discussing or changing the merged Bazaar Suite (Suite 2, Zusammenführung von Haupt-App und Voranmelde-App) in the planning hub docs/forge/2026-11-08-suite-zusammenfuehrung — e.g. Fachbereich ausarbeiten, Leitplanken, Entscheidung (E-Nummer) anlegen oder treffen, Glossar- oder Index-Begriff suchen oder ergänzen, neues Teildokument, Roadmap/Etappen, Risiken, Konsistenz-Check, Planungssitzung starten oder abschließen. Not for implementing code.
argument-hint: "[Thema oder Aufgabe, z. B. 'Annahme ausarbeiten' oder 'E5 entscheiden']"
---

# Suite-Plan: Arbeiten im Planungs-Hub

Hub: `docs/forge/2026-11-08-suite-zusammenfuehrung/` (im Folgenden `HUB/`).
Ebene: Projektleitung und Fachplanung, **kein Entwicklungsplan**: keine Klassen, Spalten oder Endpunkt-Details, außer der Nutzer will sie ausdrücklich.

**Arbeitsteilung:** Dieser Skill kennt den **Aufbau** des Plans: wo etwas steht, wie man sucht, lädt und speichert.
Für das **Besprechen von Fachbereichen** (Abläufe, Ausnahmen, Datenflüsse, Übergaben) gibt es den aufsetzenden Skill
**`suite-fachgespraech`**. Er nutzt diesen hier zum Laden und Speichern.

**Gesetzt, nicht Gegenstand der Planung:**
- **Technische Architektur** von Backend und Frontend. Das Backend ist ein **hexagonaler Monolith** mit einer Datenbank (E0, E2, L3). `architektur/` dokumentiert das nur.
- Erlaubt und erwünscht ist die Frage „Backend oder Frontend?“ im fachlichen Sinn: Das Frontend zeigt an und nimmt Eingaben auf, das Backend entscheidet die Regeln und hält die Daten.

## Goldene Regeln

1. **Haupt-App führt bei Unklarheiten** (`HUB/leitplanken.md` L0, E25). Bei Widersprüchen zwischen `docs/requirements/bazaar-app/` und `docs/requirements/advance-registration/` gilt die Haupt-App. Das betrifft Spec, Komponenten, Styleguide „Industry“, Breakpoints, Rechte und Begriffe.
2. **Nur laden, was das Thema braucht:** Grundpaket + Ladeprofil (Ablauf A). Nie einen ganzen Ordner lesen. Nachschlagewerke (`index.md`, Glossare, `entscheidungen.md`) **per Grep** lesen, nicht ganz.
3. **Eine Quelle je Wahrheit:**
   - Entscheidungen nur in `HUB/entscheidungen.md`.
   - Fachbegriffe nur in `HUB/glossar.md`, Technik-Schlagwörter nur in `HUB/glossar-technik.md`.
   - Gemeinsame Regeln nur in `HUB/querschnitt/`.
   - Andere Dokumente verweisen nur darauf („gemäß E5“) und schreiben nichts ab.
4. **Querschnitt vor Fachbereich.** Braucht ein Fachbereich eine Abweichung, wird die Querschnittsregel geändert und eine Entscheidung geloggt. Lokale Sonderwege gibt es nicht.
5. **Soll vs. Ist.** Der Hub beschreibt das Soll der Suite. Ist-Anforderungen stehen in `docs/requirements/<app>/`, der Code-Ist-Stand in `docs/knowledge/`. Dorthin wird verwiesen, nichts wird kopiert.
6. **Begriffe aus dem Glossar verwenden.** Keine neuen Synonyme erfinden. Fehlt ein Begriff, aufnehmen (Ablauf E).
7. **Deutsch, LF-Zeilenenden.** Code-Namen bleiben englisch.
8. **Werkzeuge:** Grep, Glob, Read und Edit statt Shell-Befehlen. So läuft alles gleich unter Windows (PowerShell) und Linux. Pfade immer mit `/`.

## A – Sitzung starten (Orientierung)

1. `HUB/README.md` lesen: Landkarte, Ladeprofile, Arbeitsregeln, Planungsstand.
2. Grundpaket lesen: `HUB/leitplanken.md`, `HUB/glossar.md`.
3. Die Aufgabe einem **Ladeprofil** zuordnen (README §3). Ist das Thema unklar, zuerst Ablauf B.
4. Nur die Dateien des Profils lesen, dazu die im Dokumentkopf unter **„Lesen zusammen mit“** genannten. Mehr nicht.
5. Die im Kopf genannten E-Nummern einzeln in `entscheidungen.md` nachschlagen (Grep `^\| E5 ` bzw. `^\| \*\*E0`).
6. Dem Nutzer kurz melden: welche Dateien geladen sind, welcher Status, welche offenen Fragen und Entscheidungen zum Thema. Dann die Arbeit beginnen.

## B – Suchen (Index-Suche)

In dieser Reihenfolge suchen und beim ersten Treffer aufhören:

| Schritt | Grep | Ergebnis |
|---|---|---|
| 1 | Muster `<wort>` (case-insensitive) in `HUB/index.md` | Zeile mit **Hauptstelle** und weiteren Fundstellen |
| 2 | Muster `^Schlagworte:.*<wort>` (case-insensitive) in `HUB/` mit Glob `**/*.md` | Teildokumente, deren Kopf das Thema nennt |
| 3 | Muster `<wort>` in `HUB/glossar.md` und `HUB/glossar-technik.md` | Definition |
| 4 | Volltext `<wort>` in `HUB/`, ohne `historie/` | jede Erwähnung |
| 5 | Ist-Stand: `docs/requirements/bazaar-app/` (führend), dann `docs/requirements/advance-registration/`, `docs/components/`, `docs/glossary/` | heutige Regel |

- Synonyme mitsuchen, z. B. `Annahme|Intake|Abgabe`.
- Gefunden wurde erst in Schritt 3 oder später? Dann **Index und Schlagworte ergänzen** (Ablauf E), damit die nächste Suche in Schritt 1 trifft.

## C – Thema ausarbeiten

Geht es um einen **Fachbereich oder Datenfluss**, Skill `suite-fachgespraech` verwenden. Er führt das Gespräch und nutzt die
Schritte hier zum Speichern. Für alle anderen Themen gilt:

1. Ablauf A für das Thema durchführen.
2. Offene Fragen des Dokuments mit dem Nutzer klären:
   - Für echte Entscheidungen strukturiert fragen: Optionen, Folgen, Empfehlung.
   - Fakten selbst aus Specs und Code klären, bevor gefragt wird.
3. Ergebnisse ins Teildokument schreiben. Das Schema bleibt fest: *Zweck und Abgrenzung · Heute · Ziel · (nur Fachbereiche: Datenflüsse: rein / raus) · Berührungspunkte · Offene Fragen · Nächste Planungsschritte*.
   - Datenflüsse stehen nur in `HUB/querschnitt/datenfluesse.md` (D-Nummern). Fachbereiche nennen nur die Nummern.
4. Neue oder geänderte Entscheidungen → Ablauf D. Neue Begriffe → Ablauf E.
5. **Berührungspunkte prüfen:** Für jedes dort verlinkte Dokument per Grep prüfen, ob es der Änderung widerspricht.
   - Widerspricht es, und gehört das Dokument nicht zum Auftrag: unter dessen „Offene Fragen“ eintragen: `⚠ prüfen (JJJJ-MM-TT): <Grund>, siehe <Dokument>`.
6. Kopf aktualisieren: `Status` (Skizze → Entwurf → abgestimmt → freigegeben), `Stand`, `Entscheidungen`, `Schlagworte`.

## D – Entscheidung anlegen oder treffen

- **Neu:** nächste freie E-Nummer per Grep `^\| \*?\*?E[0-9]+` ermitteln. Zeile nach der Vorlage in [references/vorlagen.md](references/vorlagen.md) mit Status `offen` oder `empfohlen` anfügen.
- **Treffen:** nur der Nutzer bzw. PO entscheidet. Status → `entschieden JJJJ-MM-TT, <wer>`, Ergebnis eintragen, unten einen **Revisionshinweis** ergänzen.
- **Ableiten:** Folgt eine Entscheidung zwingend aus einer anderen (z. B. aus E25 „Haupt-App führt“), Status `entschieden JJJJ-MM-TT durch E25` setzen und den Nutzer darauf hinweisen.
- **Revidieren:** alte Zeile mit `revidiert (Datum, durch E…)` markieren, nie löschen.
- Danach alle Dokumente nachziehen, die die E-Nummer nennen (Grep `E5\b` in `HUB/`).

## E – Begriff, Index oder Schlagwort aufnehmen

| Art | Ziel | Vorlage |
|---|---|---|
| Fachbegriff (Annahme, Basar-Tag-Nummer …) | `HUB/glossar.md`, passende Rubrik | references/vorlagen.md |
| Technik- oder Buzzword (CDN, Hexagonal …) | `HUB/glossar-technik.md`, alphabetisch, mit Status gilt/optional/verworfen | references/vorlagen.md |
| Stichwort zum Wiederfinden | `HUB/index.md`, alphabetisch, eine Zeile, Synonyme mitschreiben | references/vorlagen.md |
| Thema eines Dokuments | `Schlagworte:` im Kopf des Dokuments | – |

Weicht ein heutiger Begriff ab, gilt der Begriff der Haupt-App (E25). Den abgelösten Begriff unter „Löst ab“ vermerken.

## F – Neues Teildokument oder Aufteilen

- Ein neues Thema oder ein Dokument über etwa 150 Zeilen wird aufgeteilt, z. B. `fachbereiche/annahme/` mit `README.md` als Einstieg.
- Vorlage: [references/vorlagen.md](references/vorlagen.md), Abschnitt „Teildokument“.
- Danach nachziehen: Landkarte und gegebenenfalls Ladeprofil in `HUB/README.md`, Zeilen in `HUB/index.md`, Verweise in den Berührungspunkten der Nachbarn.

## G – Konsistenz-Check

Auf Wunsch oder vor dem Abschluss größerer Änderungen: Checkliste und Grep-Muster in
[references/konsistenz-check.md](references/konsistenz-check.md).

## H – Sitzung abschließen

1. `Stand` der geänderten Dokumente setzen und den Planungsstand in `HUB/README.md` §5 nachziehen.
2. Kurze Zusammenfassung an den Nutzer:
   - geändert
   - neu entschieden
   - offen geblieben
   - Vorschlag für die nächste Sitzung (Thema + Ladeprofil)
3. **Commit nur, wenn der Nutzer es will oder die Umgebung es verlangt.** Regeln aus `CLAUDE.md`:
   - Planungssitzungen laufen im aktuellen Checkout auf dem aktuellen Branch, ohne Worktree.
   - Vorher Branch und `git status` prüfen.
   - In einem Schritt mit Pfadangabe committen: `git commit -- <pfade>`.
   - Conventional Commits auf Deutsch, z. B. `docs(plan): Annahme ausgearbeitet, E3 entschieden`.

## Anti-Muster

- Den ganzen Hub oder `historie/` „zur Sicherheit“ lesen.
- Eine Entscheidung nur im Fachbereich festhalten, ohne Eintrag in `entscheidungen.md`.
- Eine Regel der Voranmelde-App übernehmen, obwohl die Haupt-App es anders regelt.
- Einen Begriff neu erfinden statt den aus dem Glossar zu verwenden.
- Implementierungsdetails in den Plan schreiben oder die gesetzte Architektur (hexagonaler Monolith) neu diskutieren.
- Einen Datenfluss im Fachbereich ausformulieren statt in `datenfluesse.md`.
- Querschnittsregeln in einem Fachbereich wiederholen statt darauf zu verweisen.
