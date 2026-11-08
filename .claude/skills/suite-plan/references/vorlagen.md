# Vorlagen für den Planungs-Hub

Pfade relativ zu `docs/forge/2026-11-08-suite-zusammenfuehrung/`. Platzhalter in `⟨…⟩`.

## Teildokument

```markdown
# ⟨Titel⟩

Status: Skizze · Stand: ⟨JJJJ-MM-TT⟩ · Teil von: [README](⟨../⟩README.md)
Lesen zusammen mit: [leitplanken](⟨../⟩leitplanken.md) (⟨L…⟩) · [⟨nachbar⟩](⟨pfad⟩)
Entscheidungen: ⟨E…, E…⟩
Schlagworte: ⟨Stichwort, Synonym, englischer Code-Name, …⟩

## Zweck und Abgrenzung

⟨Was gehört hierher, was nicht (mit Verweis, wo es stattdessen steht).⟩

## Heute

⟨Ist-Stand mit Verweisen auf docs/requirements/bazaar-app/ (führend), docs/requirements/advance-registration/, docs/knowledge/, Code-Pfade.⟩

## Ziel

⟨Soll der Suite. Regeln aus Querschnitt nur verlinken, nicht wiederholen.⟩

## Berührungspunkte

- [⟨dokument⟩](⟨pfad⟩): ⟨worin⟩

## Offene Fragen

1. ⟨Frage⟩

## Nächste Planungsschritte

- ⟨Schritt⟩
```

## Entscheidung (Zeile in `entscheidungen.md`)

```markdown
| E⟨n⟩ | ⟨Frage⟩ | offen | ⟨Optionen kurz⟩; Empfehlung: ⟨…⟩ | ⟨PO / Vorstand / Orga / Datenschutz⟩ | [⟨dokument⟩](⟨pfad⟩) |
```

Entschieden:

```markdown
| E⟨n⟩ | ⟨Frage⟩ | **entschieden** ⟨JJJJ-MM-TT⟩, ⟨wer⟩ | **⟨Ergebnis⟩** (⟨Begründung in einem Satz⟩) | ⟨wer⟩ | [⟨dokument⟩](⟨pfad⟩) |
```

Revisionshinweis (Abschnitt unten in `entscheidungen.md`):

```markdown
- **⟨JJJJ-MM-TT⟩:** E⟨n⟩ ⟨neu / entschieden / revidiert⟩. ⟨Was folgt daraus, welche E-Nummern sind betroffen.⟩
```

## Fachbegriff (Zeile in `glossar.md`, passende Rubrik)

```markdown
| ⟨Begriff⟩ | `⟨CodeName⟩` | ⟨Bedeutung in einem Satz⟩ | ⟨abgelöster Begriff oder –⟩ |
```

## Technik-Schlagwort (Zeile in `glossar-technik.md`, alphabetisch)

```markdown
| **⟨Begriff⟩** | ⟨Klartext für Nicht-Techniker, ein Satz⟩ | [⟨dokument⟩](⟨pfad⟩) | ⟨gilt / optional / Empfehlung / verworfen⟩ |
```

## Stichwort (Zeile in `index.md`, alphabetisch)

```markdown
| ⟨Stichwort⟩ | ⟨Synonyme, englische Code-Namen⟩ | ⟨pfad/hauptstelle.md⟩ | ⟨weitere Pfade, E…, L…, V…⟩ |
```

## Prüfvermerk in einem Nachbardokument (unter „Offene Fragen“)

```markdown
1. ⚠ prüfen (⟨JJJJ-MM-TT⟩): ⟨Grund⟩, siehe [⟨dokument⟩](⟨pfad⟩)
```
