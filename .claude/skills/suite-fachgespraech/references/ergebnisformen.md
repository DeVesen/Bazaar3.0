# Ergebnisformen

Feste Formen, damit alle Fachbereiche gleich aussehen. Wohin was gehört, steht jeweils dabei.
Pfade relativ zu `docs/forge/2026-11-08-suite-zusammenfuehrung/`.

## 1. Ablauf → Fachbereich-Dokument, Abschnitt „Ziel“

```markdown
### Ablauf ⟨Name⟩

| # | Wer | Tut | Sieht / bedient (Frontend) | Regel (Backend) | Fluss |
|---|---|---|---|---|---|
| 1 | Kassenpersonal | scannt Etikett | Bezeichnung, Größe, Systempreis | Artikel muss Entwurf und vom Verkäufer sein | liest D6 |
| 2 | … | … | … | … | erzeugt D9 |
```

## 2. Ausnahmen → Fachbereich-Dokument, Abschnitt „Ziel“

```markdown
### Ausnahmen

| Fall | Was passiert | Wer entscheidet | Zustand danach |
|---|---|---|---|
| Etikett unleserlich | neue Nummer aus Ausnahme-Bereich, Blanko-Etikett | Kassenpersonal | Im Verkauf |
```

## 3. Datenfluss → nur `querschnitt/datenfluesse.md`, Landkarte

```markdown
| D⟨n⟩ | ⟨Daten⟩ | ⟨von: Fachbereich/Rolle⟩ | ⟨an⟩ | ⟨Auslöser / wann⟩ | ⟨Zustand danach⟩ | ⟨wer darf danach ändern⟩ |
```

Danach in **beiden** beteiligten Fachbereichen die Tabelle „Datenflüsse: rein / raus“ um `D⟨n⟩` ergänzen.

## 4. Zustandswechsel → nur `querschnitt/artikel-lebenszyklus.md`

Neue Zustände oder Rechte werden in die dortigen Tabellen „Zustände“ und „Wer darf was“ eingetragen. Im
Fachbereich steht nur der Verweis.

## 5. Offene Frage → Fachbereich-Dokument, Abschnitt „Offene Fragen“

```markdown
1. ⟨Frage⟩. Optionen: ⟨a⟩ / ⟨b⟩. Empfehlung: ⟨…⟩. Klärt: ⟨Orga / Kassenwart / PO / Vorstand / Datenschutz⟩.
```

Wird daraus eine Entscheidung, kommt sie mit E-Nummer ins Log (Skill `suite-plan`, Ablauf D). Die Frage
verweist dann auf `E⟨n⟩`.

## 6. Kurzprotokoll der Runde → Antwort an den Nutzer (nicht in den Plan)

```markdown
**Fokus:** ⟨…⟩
**Geklärt:** ⟨…⟩
**Neu entschieden:** E⟨n⟩ …
**Geänderte Flüsse:** D⟨n⟩ …
**Offen:** ⟨…⟩ (klärt: ⟨wer⟩)
**Nächste Runde:** ⟨Fachbereich + Fokus⟩
```
