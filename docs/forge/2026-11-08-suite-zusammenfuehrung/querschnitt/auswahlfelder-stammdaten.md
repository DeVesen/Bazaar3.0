# Auswahlfelder und Stammdaten (AutoComplete, Marken, Kategorien, Typen)

Status: Skizze · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [ui-grundlagen](ui-grundlagen.md) · [leitplanken](../leitplanken.md) (L6)
Entscheidungen: E9, E11
Schlagworte: AutoComplete, AutoComplete-Create, Auswahlfeld, Feld-Katalog, Marke, Kategorie, Verkäufer-Typ, Größe, Farbe, Preis, Verkäufer-Suche, original, Original/Neu, Dublette, Zusammenführen, Konditionen

## Zweck und Abgrenzung

Hier steht, wie **gleiche Felder überall gleich funktionieren**: Auswahl- und Suchfelder, Anlegen neuer
Einträge, Pflege der Stammdaten. Die Verwaltungsseiten selbst beschreibt [verwaltung](../fachbereiche/verwaltung.md).

## Heute

- Das **AutoComplete-Verhalten** für Marke und Kategorie ist in beiden Apps fast gleich spezifiziert (`advance-registration/spec.md` §11.3, `bazaar-app/spec.md` §9.3). Es gibt eine geteilte Komponente [`autocomplete-create`](../../../components/autocomplete-create/component.md) (▾-Auswahl, +-Anlegen mit Modal).
- **`original`-Flag:** In beiden Apps vorhanden, mit unterschiedlicher Bedeutung (`docs/requirements/entities.md`).
- **Eindeutigkeit der Namen:** In der Haupt-App unabhängig von Groß- und Kleinschreibung in der DB abgesichert, in der Voranmeldung nur im Code.
- **Verkäufer-Typ:** Wird nur ausgewählt, nie per AutoComplete angelegt (er braucht Konditionen). In der Voranmeldung gelten die Konditionen live, in der Haupt-App als überschreibbare Kopie.
- **Verkäufer-Suche:** geteilte Komponente [`seller-search`](../../../components/seller-search/component.md).

## Ziel

### Feld-Katalog (gilt in allen Frontends)

| Feld | Komponente | Verhalten | Neu anlegen |
|---|---|---|---|
| Marke | `autocomplete-create` | öffnet beim Anklicken, filtert beim Tippen | ja, über das Modal (alle angemeldeten Rollen); Eintrag „Neu“ (`original = false`) |
| Kategorie | `autocomplete-create` | wie Marke | wie Marke |
| Verkäufer-Typ | Select (Dropdown) | nur bestehende Typen | nein (Admin in der Verwaltung) |
| Verkäufer | `seller-search` | Suche nach Name, Kennung, Nummer | Kassenpersonal/Admin: Laufkunde anlegen |
| Größe | Text bzw. offen | – | offen: freie Eingabe oder Liste? |
| Farbe | Text bzw. offen | – | offen |
| Preis | InputNumber/Numpad | Euro, zwei Nachkommastellen, Schrittweite offen | – |

**Regel:** Ein neues Auswahlfeld wird zuerst **hier** eingetragen und dann in den Fachbereichen verwendet.

### Stammdaten-Regeln

- **Suite-weit eine Liste** je Stammdatum. Die Unterscheidung je Basar ist noch offen, siehe [datenmodell](datenmodell.md).
- Namen sind eindeutig ohne Rücksicht auf Groß- und Kleinschreibung (DB-abgesichert).
- **`original` mit der Bedeutung der Haupt-App (E25):** `true` heißt vom Admin angelegt oder bestätigt (Badge „✓ Original“), `false` heißt über das AutoComplete nachträglich angelegt (Badge „Neu“). Der Admin kann Neu-Einträge bestätigen, zusammenführen oder umbenennen. Die abweichende Bedeutung der Voranmelde-App entfällt.
- **Zusammenführen von Dubletten** (z. B. „H&M“ und „H & M“) wird eine Admin-Funktion. Die Artikel ziehen dabei mit.
- **Konditionen:** Der Verkäufer-Typ liefert die Vorlage, sie wird ab der ersten Annahme je Teilnahme eingefroren (E9). Der Admin darf sie je Teilnahme überschreiben.

## Berührungspunkte

- [ui-grundlagen](ui-grundlagen.md): Komponentenregel, Darstellung
- [voranmeldung](../fachbereiche/voranmeldung.md), [annahme](../fachbereiche/annahme.md): Artikeldialog
- [verwaltung](../fachbereiche/verwaltung.md): Pflege, Prüfen, Zusammenführen
- [api-konventionen](api-konventionen.md): Such- und Listen-Endpunkte

## Offene Fragen

1. Größe und Farbe als freie Eingabe oder als gepflegte Liste (Kinderkleidung: 50–176, S–XXL, Schuhgrößen)?
2. Werden Kategorien hierarchisch (z. B. Kleidung › Jacken)? Das wäre für Katalog-Filter nützlich.
3. Werden „Neu“-Einträge sofort im öffentlichen Katalog sichtbar?

## Nächste Planungsschritte

- Feld-Katalog vervollständigen (alle Felder des Artikeldialogs und der Verkäufer-Maske).
