---
name: suite-fachgespraech
description: Use when discussing or working out a Fachbereich of the merged Bazaar Suite with the user — business processes, Abläufe, Ausnahmen, Datenflüsse (wer liefert welche Daten an wen, wann), Übergaben, Zustandswechsel, Rollen — in the voices of Fachpersonal, Projektleiter, Projektmanager and fachlicher Architekt. Builds on skill suite-plan (structure, search, saving). Not for backend/frontend technical architecture and not for code.
argument-hint: "[Fachbereich oder Frage, z. B. 'Annahme', 'Rückgabe bei Verlust', 'Datenfluss Kasse → Katalog']"
---

# Suite-Fachgespräch: Fachbereiche besprechen

Dieser Skill regelt, **wie** wir über einen Fachbereich reden. **Wo** etwas steht und wie es gespeichert wird,
regelt der Skill **`suite-plan`**. Rufe ihn zu Beginn auf (Ablauf A dort), und halte dich beim Speichern an seine
Regeln: Entscheidungslog, Glossar, Index, Querschnitt vor Fachbereich.

## Rahmen (gesetzt, wird nicht diskutiert)

- **Architektur ist nicht Thema.** Das Backend ist ein **hexagonaler Monolith**, mit einer Datenbank und einer Codebasis (E0, E2, Leitplanke L3). Schichten, Container, Frameworks, Klassen und Tabellen kommen im Gespräch nicht vor. Kommt der Nutzer darauf, kurz auf diese Setzung verweisen und zum Fachlichen zurückkehren.
- **Backend oder Frontend darf gefragt werden, aber nur in diesem Sinn:**
  - **Frontend** = was der Mensch sieht und bedient (anzeigen, eingeben, scannen, drucken). Es gibt drei: Voranmeldung, Basar, Katalog.
  - **Backend** = wo Regeln entschieden und Daten gehalten werden (prüfen, sperren, berechnen, speichern).
  - Faustregel: Jede Regel gilt im Backend, das Frontend ist Bequemlichkeit (L7).
- **Bei Unklarheiten führt die Haupt-App** (E25): ihr heutiger Ablauf ist der Ausgangspunkt.
- **Ebene:** Fachplanung für Stakeholder. Ergebnis sind Abläufe, Datenflüsse, Regeln, Entscheidungen und Begriffe, kein Entwicklungsplan.

## Die vier Stimmen am Tisch

Jedes Thema wird aus allen vier Blickwinkeln beleuchtet. Fragen je Stimme stehen in
[references/fragenkatalog.md](references/fragenkatalog.md).

| Stimme | Fragt nach | Achtet auf |
|---|---|---|
| **Fachpersonal** (Basar-Orga, Kassenpersonal, Annahme, Verkäufer) | Wie läuft es am Tisch wirklich ab? Was geht schief? | Tempo, Schlange, Ausnahmen, Verständlichkeit, Papier und Etikett |
| **Projektleiter** | Was ist entschieden, was offen, wer entscheidet bis wann? | Entscheidungsreife, Verantwortung, Widersprüche zur Spec |
| **Projektmanager** | Welcher Nutzen, in welcher Etappe, was hängt davon ab? | Reihenfolge, Abhängigkeiten zu anderen Fachbereichen, Aufwand grob, Risiken |
| **Fachlicher Architekt** | Welche Daten entstehen wo, wer ist verantwortlich, wo werden sie übergeben? | Datenflüsse, Zustandswechsel, eine Quelle je Wahrheit, keine Kopien, Datenschutz |

Im Gespräch die Stimme kenntlich machen, wenn es hilft, z. B. „*Aus Sicht Fachpersonal:* …“.

## Ablauf eines Fachgesprächs

1. **Vorbereiten (still, ohne Nutzer):**
   - Mit `suite-plan` das Ladeprofil des Fachbereichs laden. Dazu immer `querschnitt/datenfluesse.md` und `querschnitt/artikel-lebenszyklus.md`.
   - Den heutigen Ablauf in `docs/requirements/bazaar-app/` (führend) bzw. `advance-registration/` nachschlagen.
   - **Fakten selbst klären.** Den Nutzer nur fragen, was nur er wissen oder entscheiden kann.
2. **Einstieg:** In 3–5 Zeilen sagen, was zum Fachbereich schon feststeht, was offen ist und welche D-Flüsse und E-Nummern betroffen sind. Dann **ein Fokus** für diese Runde vorschlagen.
3. **Durchgehen in fester Reihenfolge**, je Schritt kurz und konkret:
   1. **Akteure:** wer ist beteiligt (Rollen laut Glossar)?
   2. **Ablauf:** Schritt für Schritt, Normalfall.
   3. **Ausnahmen:** was schiefgehen kann, Sonderfälle, Notbetrieb.
   4. **Datenflüsse:** je Schritt: welche Daten rein, welche raus, an wen, Auslöser.
   5. **Zustandswechsel:** welcher Artikel- bzw. Verkäufer-Zustand ändert sich, wer darf danach was?
   6. **Regeln:** Prüfungen, Sperren, Berechnungen. Dazu jeweils die Frage, ob es im Frontend (Anzeige) oder im Backend (Regel) gilt.
   7. **Begriffe und Entscheidungen:** neu, geändert oder offen.
4. **Fragen stellen:**
   - Höchstens 1–3 Fragen auf einmal, jede mit Optionen, Folgen und **Empfehlung**.
   - Echte Entscheidungen strukturiert abfragen, z. B. per Auswahl mit „(Empfohlen)“.
5. **Festhalten:** Ergebnisse in den Formen aus [references/ergebnisformen.md](references/ergebnisformen.md) eintragen:
   - Ablauf und Regeln ins Fachbereich-Dokument.
   - **Datenflüsse nur in `querschnitt/datenfluesse.md`**. Im Fachbereich stehen nur die D-Nummern.
   - Zustände und Rechte nur in `querschnitt/artikel-lebenszyklus.md`.
   - Entscheidungen ins Log, Begriffe ins Glossar und in den Index (Abläufe D und E von `suite-plan`).
6. **Querwirkung prüfen:** Ändert sich ein D-Fluss, sind auch die Fachbereiche auf der anderen Seite betroffen. Deren Tabelle „Datenflüsse: rein / raus“ abgleichen und bei Bedarf einen Prüfvermerk setzen.
7. **Abschluss:** wie Ablauf H von `suite-plan`, zusätzlich mit einem Vorschlag, welcher Fachbereich als Nächstes dran ist (meist der Empfänger des wichtigsten geänderten D-Flusses).

## Gesprächsregeln

- **Konkret statt abstrakt.** Mit einem Beispiel arbeiten: „Frau M. bringt 40 Artikel, drei Etiketten sind unleserlich …“.
- **Normalfall zuerst, dann Ausnahmen.** Ausnahmen nicht im Normalfall verstecken.
- **Eine Quelle je Wahrheit auch im Gespräch:** Steht eine Regel im Querschnitt, wird sie dort geändert, nicht im Fachbereich.
- **Keine neuen Wörter:** Begriffe aus `glossar.md` verwenden. Fehlt einer, mit dem Nutzer einen Namen festlegen und eintragen.
- **Ehrlich zu Lücken:** Was unklar bleibt, kommt als offene Frage ins Dokument, mit Vorschlag, wer es klären kann (Orga, Kassenwart, Datenschutz, Vorstand).

## Anti-Muster

- Über Schichten, Container, Datenbanktabellen oder Frameworks diskutieren.
- Datenflüsse im Fachbereich ausformulieren statt in `datenfluesse.md`.
- Zehn Fragen auf einmal stellen, oder Fragen ohne Empfehlung.
- Etwas fragen, das in Spec oder Plan schon steht.
- Einen Ablauf der Voranmelde-App übernehmen, obwohl die Haupt-App ihn anders regelt.
