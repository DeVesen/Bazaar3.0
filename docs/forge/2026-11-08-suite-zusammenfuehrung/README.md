# Planung Bazaar Suite 2 – Einstieg

Status: Planung läuft · Stand: 2026-11-08 · Ebene: Projektleitung / Fachplanung, **kein Entwicklungsplan**
Schlagworte: Einstieg, Landkarte, Ladeprofil, Arbeitsregeln, Planungsstand, Prompt-Vorlage, frischer Agent

Dieser Ordner ist der **Planungs-Hub** für die zusammengeführte Bazaar Suite. Die Planung ist in
kleine, referenzierte Teildokumente zerlegt. So lässt sich jedes Thema einzeln besprechen und
ausarbeiten, auch mit einem frischen Agenten, ohne alles in den Kontext zu laden. Die
**Leitplanken** und der **Querschnitt** halten das Ganze zusammen: ein Guss statt Flickenteppich.

---

## 1. Worum es geht (drei Sätze)

Voranmelde-App und Haupt-App werden zu **einer Suite auf einer gemeinsamen Infrastruktur**
zusammengeführt, bevorzugt in der Cloud, alternativ als Docker-Stack auf eigenem Server.
Verkäufer (privat und Händler) erfassen ihre Artikel online. Das Basar-Team übernimmt sie am
Basar-Tag **durch die Annahme**, und **durch die Rückgabe** gehen sie an die Verkäufer zurück.
Import und Export entfallen. Dazu kommt eine öffentliche Live-Artikelliste mit eigener Last.

Details: [`uebersichtsplan.md`](uebersichtsplan.md)

## 2. Landkarte

```
README.md  ← du bist hier
│
├── uebersichtsplan.md        Gesamtbild für Stakeholder (kurz)
├── leitplanken.md            Ein-Guss-Regeln – gelten für ALLE Teilpläne
├── entscheidungen.md         Entscheidungslog – einzige Quelle für Entscheidungen (E-Nummern)
├── glossar.md                Fachbegriffe der Suite (Soll)
├── glossar-technik.md        Technik-Schlagwörter in Klartext (inkl. verworfener Konzepte)
├── index.md                  Stichwortindex: Stichwort → Hauptstelle (Suche hier starten)
├── roadmap.md                Etappen
├── risiken.md                Risikoliste
│
├── architektur/              WIE es läuft
│   ├── zielbild.md           Bausteine, Container, Datenbank, Lastisolation
│   ├── betrieb.md            Hosting, Backup, Basar-Tag-Konnektivität, Notfall
│   └── migration.md          Weg von zwei Apps zur Suite, Altlasten V1–V10
│
├── querschnitt/              WAS überall gleich sein muss
│   ├── identitaet-rollen.md        Anmeldung, Konten, Rollen, Rechte-Matrix
│   ├── datenmodell.md              Kern-Entitäten, Basar, Datenhoheit
│   ├── artikel-lebenszyklus.md     Zustände, wer darf wann was (Herzstück)
│   ├── nummern.md                  Voranmelde- und Basar-Tag-Nummer, Etikett
│   ├── auswahlfelder-stammdaten.md AutoComplete, Marken, Kategorien, Typen
│   ├── ui-grundlagen.md            PrimeNG, Breakpoints, Shell, Feedback
│   ├── api-konventionen.md         Pfade, Fehler, Paginierung, IDs
│   └── datenschutz.md              DSGVO, Löschkonzept, öffentliche Felder
│
├── fachbereiche/             WAS fachlich passiert
│   ├── voranmeldung.md             Registrierung, Profil, Meine Artikel, Händler
│   ├── annahme.md                  Übergabe Verkäufer → Basar-Team
│   ├── verkauf-kasse.md            Kasse
│   ├── rueckgabe-abrechnung.md     Übergabe zurück, Auszahlung
│   ├── verwaltung.md               Admin: Verkäufer, Stammdaten, Basar, Einstellungen
│   ├── druck-etiketten.md          Etiketten, Belege, Aushang
│   ├── statistik-auswertung.md     Kennzahlen, Dashboards
│   └── oeffentlicher-katalog.md    Live-Liste ohne Anmeldung
│
└── historie/                 frühere Planstände (nur zum Nachvollziehen)
```

## 3. Ladeprofile – was lade ich für welches Thema?

**Immer laden (Grundpaket, klein):** `README.md` → `leitplanken.md` → `glossar.md`.
In `entscheidungen.md` nur die Zeilen der im Teildokument genannten E-Nummern lesen (Grep nach `^\| E5 `).

**Thema unbekannt?** Erst suchen, dann laden:
1. Grep in `index.md` nach dem Stichwort → Hauptstelle.
2. Kein Treffer → Grep nach `^Schlagworte:.*<wort>` über den Hub (jedes Teildokument hat diese Kopfzeile).
3. Immer noch nichts → Grep im Volltext des Hubs. Danach Index und Schlagworte ergänzen.

| Ich will planen / besprechen … | Zusätzlich laden |
|---|---|
| Gesamtbild, Priorisierung, Stakeholder-Runde | `uebersichtsplan.md`, `roadmap.md`, `risiken.md` |
| Infrastruktur, Hosting, Kosten | `architektur/zielbild.md`, `architektur/betrieb.md` |
| Übergang von heute zur Suite | `architektur/migration.md`, `roadmap.md` |
| Anmeldung, Konten, Rechte | `querschnitt/identitaet-rollen.md` |
| Artikel-Zustände, Sperren | `querschnitt/artikel-lebenszyklus.md`, `querschnitt/nummern.md` |
| Voranmeldung (Verkäufer, Händler) | `fachbereiche/voranmeldung.md`, `querschnitt/artikel-lebenszyklus.md`, `querschnitt/nummern.md` |
| Annahme am Basar-Tag | `fachbereiche/annahme.md`, `querschnitt/artikel-lebenszyklus.md`, `querschnitt/nummern.md`, `fachbereiche/druck-etiketten.md` |
| Kasse | `fachbereiche/verkauf-kasse.md`, `querschnitt/artikel-lebenszyklus.md` |
| Rückgabe und Abrechnung | `fachbereiche/rueckgabe-abrechnung.md`, `querschnitt/artikel-lebenszyklus.md` |
| Admin-Verwaltung, Stammdaten | `fachbereiche/verwaltung.md`, `querschnitt/auswahlfelder-stammdaten.md`, `querschnitt/datenmodell.md` |
| Öffentliche Liste | `fachbereiche/oeffentlicher-katalog.md`, `querschnitt/datenschutz.md`, `architektur/zielbild.md` |
| Oberfläche, Komponenten, Layout | `querschnitt/ui-grundlagen.md`, `querschnitt/auswahlfelder-stammdaten.md` |
| Schnittstellen | `querschnitt/api-konventionen.md`, `querschnitt/identitaet-rollen.md` |

Jedes Teildokument nennt im Kopf selbst, was es voraussetzt (Zeile **„Lesen zusammen mit“**).

## 4. Arbeitsregeln (für Menschen und Agenten)

0. **Bei Unklarheiten führt die Haupt-App** (L0, E25): Spec, Komponenten, Styleguide, Breakpoints, Rechte und Begriffe der Haupt-App gehen vor.
1. **Eine Quelle je Wahrheit.** Entscheidungen stehen nur in `entscheidungen.md`. Begriffe stehen nur in `glossar.md`. Gemeinsame Regeln stehen nur im `querschnitt/`. Teildokumente **verweisen** darauf (z. B. „gemäß E5“) und schreiben nichts ab.
2. **Querschnitt vor Fachbereich.** Braucht ein Fachbereich eine Abweichung von einer Querschnittsregel, wird die **Querschnittsregel** geändert und eine Entscheidung geloggt. Lokale Sonderwege gibt es nicht.
3. **Berührungspunkte pflegen.** Ändert sich ein Teildokument, prüft man dessen Abschnitt „Berührungspunkte“ und markiert die betroffenen Dokumente mit „⚠ prüfen (Datum, Grund)“ unter „Offene Fragen“.
4. **Kopf aktuell halten.** Jedes Teildokument hat den Kopf `Status · Stand · Lesen zusammen mit · Entscheidungen · Schlagworte`. Die Status sind: `Skizze` → `Entwurf` → `abgestimmt` → `freigegeben`.
5. **Gleicher Aufbau.** Jedes Teildokument folgt dem Schema: *Zweck und Abgrenzung · Heute · Ziel · Berührungspunkte · Offene Fragen · Nächste Planungsschritte*.
6. **Länge begrenzen.** Ein Teildokument sollte ungefähr 150 Zeilen nicht überschreiten. Nachschlagewerke (`index.md`, Glossare, `entscheidungen.md`) sind ausgenommen, denn sie werden per Grep gelesen, nicht ganz. Ein größeres Thema wird in ein Unterverzeichnis aufgeteilt (`fachbereiche/annahme/…`), und die Landkarte oben wird ergänzt.
7. **Ist vs. Soll.** Bestehende Anforderungen der heutigen Apps stehen unter `docs/requirements/<app>/`. Der Ist-Stand des Codes steht unter `docs/knowledge/`. Hier steht nur das **Soll der Suite** mit Verweis auf das Ist.
8. **Index pflegen.** Neue Begriffe oder Themen bekommen eine Zeile in `index.md` und gegebenenfalls in einem Glossar. Die `Schlagworte:` des betroffenen Dokuments werden ergänzt.
9. **Neue Entscheidung:** Zeile in `entscheidungen.md` mit nächster freier E-Nummer, Status `offen`. Wird entschieden, ändert sich nur der Status samt Datum. Danach werden die verweisenden Dokumente aktualisiert.

## 5. Planungsstand

| Dokument | Status |
|---|---|
| uebersichtsplan, leitplanken, entscheidungen, glossar, glossar-technik, index | Entwurf |
| architektur/* | Entwurf |
| querschnitt/artikel-lebenszyklus, nummern, identitaet-rollen, ui-grundlagen, datenschutz | Entwurf |
| querschnitt/übrige | Skizze |
| fachbereiche/* | Skizze |
| roadmap, risiken | Entwurf |

## 6. Skill und Prompt-Vorlage für einen frischen Agenten

Der Projekt-Skill **`suite-plan`** (`.claude/skills/suite-plan/`) führt durch Einstieg, Suche, Entscheidungen,
Glossar, neue Teildokumente und den Sitzungsabschluss. Er funktioniert in Claude Code am PC und in der Cloud.
Aufruf: `/suite-plan <Thema oder Aufgabe>`.

> Nutze den Skill `suite-plan`. Lies `docs/forge/2026-11-08-suite-zusammenfuehrung/README.md`, dann das Grundpaket
> (Abschnitt 3) und das Ladeprofil für **⟨Thema⟩**. Lade sonst nichts. Halte die Arbeitsregeln
> aus Abschnitt 4 ein. Ziel dieser Sitzung: **⟨z. B. offene Fragen in fachbereiche/annahme.md
> klären und das Dokument auf Status „Entwurf“ bringen⟩**. Neue oder geänderte Entscheidungen
> nur in `entscheidungen.md` eintragen.
