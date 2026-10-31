# Plan: Artikel-Aushang drucken

Spec: [`spec.md`](spec.md) (bestätigt am 2026-10-31) · Basis: `1b9fa13`
Branch (Umsetzung): `docs/feature/artikel-aushang-druck`, im Worktree gemäß CLAUDE.md.
Pfade unten sind relativ zu `src/bazaar-app/`.

## Befunde im Ist-Zustand

| Befund | Folge |
|---|---|
| `GET /api/articles` liefert weder `size` noch `color` (`ArticleListItem`) und ist auf höchstens 200 je Seite begrenzt (`ArticleListQuery.MaxPageSize`). | Der Aushang braucht eine eigene Abfrage über **alle** Treffer mit den fünf Druckfeldern. |
| Filterlogik (Token-Suche, Marke, Kategorie, Status) steckt privat in `ArticleListQuery.GetArticles`. | Filter in eine gemeinsame Methode ziehen, damit Tabelle und Aushang garantiert dieselben Artikel treffen (AC-04). |
| `PrintTexts` hat fünf Felder, der Aushang braucht vier. `Settings` hält zwei Sätze als EF-Complex-Properties; `PrintTextsResponse`/`UpdatePrintTextsCommand` sind auf zwei Sätze festgelegt. | Neuer Record `AushangTexts` mit vier Feldern und ein dritter Satz in Settings, Response und Command. |
| `PrintDocument` ist auf Verkäufer-Belege zugeschnitten (Verkäufer-Block, Kacheln, Statusgruppen, Freitext 3). | Eigene Komponente `ArticleAushang`; Layout-Helfer, Markdown und Kopf/Fuß-Grid werden wiederverwendet. |
| `PrintService.mountRenderAndPrint` ist fest auf `PrintDocument` und `applyMeasurement()` typisiert. | Mount-Logik generisch machen (beliebige Komponente, optionaler Messschritt). |
| Kopf/Fuß sind schon ein 1fr/1fr/1fr-Grid (`print-document.scss`). | Dasselbe Grid für den Aushang, keine neue Aufteilung nötig. |
| `/api/articles/next-number` ist Präzedenzfall für ein Literal neben `/api/articles/{id}`. | `GET /api/articles/print` kollidiert nicht mit `{id}`. |

## Entscheidungen

- **Neuer Endpunkt statt `pageSize=∞`:** `GET /api/articles/print?q&brand&category&status`, `authenticated`, ohne Seiten und ohne `sort`. Antwort: Liste von `{ name, brand, category, size, color, price }`. Er trägt keine Ids, Nummern oder Verkäuferdaten, die der Aushang nicht zeigt.
- **Sortierung im Frontend** (im Modell-Builder, wie bei den anderen Belegen): Kategorie → Marke → Größe → Farbe → Bezeichnung mit `Intl.Collator('de', { numeric: true, sensitivity: 'base' })`. Damit steht 86 vor 104. Texte wie „XL" sortieren alphabetisch dazwischen; leere Größe/Farbe stehen am Ende. Die Regel kommt als Nachtrag in die Spec (Abschnitt „Offen").
- **Eigene Freitext-Struktur:** `AushangTexts(Text1, Text2, Text3, Text4)` = Kopf links, Kopf Mitte, Fuß links, Fuß Mitte. Die Spalten heißen `ArticleAushang_Text1..4` und werden per Migration mit Default `""` angelegt (Muster wie `AddPrintTexts`).
- **Kein Count in Kategorie-Überschriften** (Spec: keine Anzahl).
- **Ein Seitenfluss:** erste Seite und Folgeseiten haben dieselbe Listenhöhe (`innerHeight − header − footer`); `paginateRows` sorgt dafür, dass eine Überschrift nie allein am Seitenende steht.

## Tasks

Reihenfolge ist abhängig: Backend (1–5) vor Frontend-Daten (6), Dokument (7–8) vor Service (9), Service vor Button (10). Task 11 ist unabhängig vom Druck, Task 12 läuft zuletzt. Jeder Task: Test zuerst, dann Code, dann Toolchain-Lauf (`dv-dotnet:toolchain` bzw. `dv-angular:toolchain`).

### Backend

**Task 1 — Filter extrahieren, Druck-Abfrage hinzufügen**
- `Bazaar.Domain/Ports/IArticleListQuery.cs`: neue Methode `GetArticlesForPrint(q, brand, category, status)` und Record `ArticlePrintItem(Name, Brand, Category, Size, Color, Price)`.
- `Bazaar.Infrastructure/Persistence/Repositories/ArticleListQuery.cs`: Materialisierung und die vier Filterschritte in eine private Methode ziehen, von `GetArticles` und `GetArticlesForPrint` genutzt; die Zeilen-Row bekommt `Size` und `Color`. `GetArticles` ändert sein Verhalten nicht.
- Tests (`ArticleListQueryTests.cs`): Druck-Abfrage liefert alle Treffer ohne Seitenlimit (z. B. 250 Artikel); Filterparität: für jede Filterkombination dieselbe Artikelmenge wie `GetArticles` über alle Seiten (AC-03, AC-04); Größe/Farbe kommen mit; bestehende Tests bleiben grün.

**Task 2 — Handler und Endpunkt**
- `Bazaar.Application/Articles/GetArticlesForPrintHandler.cs` (reiner Durchreicher wie `GetArticlesHandler`).
- `Bazaar.Api/Features/Articles/ArticleEndpoints.cs`: `MapGet("/api/articles/print", …).RequireAuthorization()`, **vor** `/api/articles/{id}` registrieren; DTO `ArticlePrintItemDto` in `Dtos.cs` (JSON camelCase).
- DI-Registrierung des Handlers (Muster in `Program.cs`, abgesichert durch `DiRegistrationTests`).
- Tests: Handler-Unit-Test; `Bazaar.Api.UnitTests/Features` Endpunkt-Routing (`/print` trifft nicht `{id}`); unauthentifiziert → 401.

**Task 3 — Domain: Freitexte des Aushangs**
- `Bazaar.Domain/Settings/AushangTexts.cs`: `record AushangTexts(Text1..Text4)`, `MaxLength` = `PrintTexts.MaxLength`, `CreateEmpty()`, `All()`.
- `Settings.cs`: Property `ArticleAushang`, Methode `UpdatePrintTexts(abgabeBeleg, verkaeuferUebersicht, articleAushang)` mit derselben Längen-/Null-Prüfung (`EnsureValid…` generisch für beide Typen über `All()`).
- Tests (`SettingsTests.cs`): neue Instanz hat leere Aushang-Texte; zu langer Text (5001) → `ArgumentOutOfRangeException`; Null → `ArgumentNullException`; die anderen beiden Sätze bleiben beim Update unberührt.

**Task 4 — Persistenz und Migration**
- `SettingsConfiguration.cs`: `ComplexProperty(s => s.ArticleAushang, …)` mit vier `IsRequired().HasMaxLength(5000)`-Spalten.
- Migration `AddArticleAushangTexts` (vier `AddColumn` mit `defaultValue: ""`, Muster `AddPrintTexts`), Snapshot und Designer per `dotnet ef`.
- Test (`SettingsRepositoryTests.cs`): Speichern und Laden des dritten Satzes; bestehende Zeile ohne Aushang-Texte lädt mit leeren Texten.

**Task 5 — Application und API der Freitexte**
- `PrintTextsDto.cs`: `AushangTextsDto(Text1..Text4)` mit `From`/`ToDomain`; `PrintTextsResponse` bekommt `ArticleAushang`.
- `UpdatePrintTextsCommand`: Property `ArticleAushang`; Validator: `NotNull` + je Text `NotNull().MaximumLength(5000)`.
- `GetPrintTextsHandler`/`UpdatePrintTextsHandler` reichen den dritten Satz durch.
- Tests: `GetPrintTextsHandlerTests`, `UpdatePrintTextsHandlerTests`, `UpdatePrintTextsCommandValidatorTests` (fehlender Satz, zu langer Text je Feld), Admin-Pflicht für PUT bleibt (Endpunkt unverändert).

### Frontend — Daten

**Task 6 — API-Clients**
- `features/articles/data/articles-api.ts`: Typ `ArticlePrintItem` und `getForPrint(filters)` (`GET /api/articles/print`, Parameter nur gesetzte Filter).
- `features/settings/data/print-texts-api.ts`: `PrintTextSection` um `'articleAushang'` erweitern; Typ `AushangTextSet = Record<'text1'|'text2'|'text3'|'text4', string>`; `emptyPrintTexts()` mit drittem Satz.
- Tests: `articles-api.spec.ts` (Parameter, URL), `print-texts-api.spec.ts` (Roundtrip mit drittem Satz).

### Frontend — Dokument

**Task 7 — Modell und Sortierung** (`shared/components/print-document/article-aushang.model.ts`)
- Typen `AushangArticle`, `AushangGroup { category, articles }`, `AushangRow` (`group` | `article`), `AushangModel { printedAt, freitexts (4), groups }`.
- `buildArticleAushangModel(input)`: gruppiert nach Kategorie (alphabetisch), sortiert Marke → Größe → Farbe → Bezeichnung (Collator `de`, numeric), leere Werte am Ende; `flattenAushangGroups(groups)` zu Zeilen.
- Tests (`article-aushang.model.spec.ts`): Kategorienreihenfolge (AC-05); Sortierkette inkl. 86 vor 104 (AC-06); gleiche Marke, andere Größe; leere Größe/Farbe zuletzt; keine Kategorie-Anzahl; leere Eingabe → keine Gruppen.

**Task 8 — Komponente `ArticleAushang`** (`shared/components/print-document/article-aushang.ts|html|scss`)
- Layout-Helfer in `print-document.layout.ts`: `aushangListHeightMm()` = `innerHeight − headerMm − footerMm`; Seiten über `listCapacityRows` + `paginateRows` mit `isHeading` für Kategorie-Zeilen.
- Template: pro Seite `<header>` (Text 1 links, Text 2 zentriert, Datum rechts `dd.MM.yyyy, HH:mm`), Tabelle mit wiederholtem Kopf (Bezeichnung, Marke, Farbe, Größe, Preis rechtsbündig mit `formatCurrency`), `<footer>` (Text 3 links, Text 4 zentriert, „Seite x von y" rechts). Markdown über `renderPrintMarkdown`.
- Styles: Kopf-/Fußgrid und Tabellen-Basis aus `print-document.scss` wiederverwenden (gemeinsame Partial oder Klassen, kein Kopieren); `ViewEncapsulation.None` wie `PrintDocument`.
- Tests (`article-aushang.spec.ts`): Datum rechts im Kopf, jede Seite (AC-09); „Seite x von y" (AC-10); vier Freitexte in der richtigen Position und Ausrichtung (AC-11); Markdown formatiert, Link/Bild/HTML entschärft (AC-12); mehrseitig mit wiederholtem Tabellenkopf und ohne einsame Überschrift am Seitenende (AC-15); Spalten ohne Artikelnummer, keine Summen/Kacheln (AC-07, AC-08). Layout-Test (`print-document.layout.spec.ts`) für `aushangListHeightMm`.

### Frontend — Druck und Bedienung

**Task 9 — PrintService**
- `core/print/print.service.ts`: `mountRenderAndPrint` generisch machen (`ComponentRef<T>`, optionaler `beforePrint`-Callback statt fest verdrahtetem `applyMeasurement`); die drei bestehenden Aufrufer ändern ihr Verhalten nicht.
- Neue Methode `printArticleAushang(filters)`: `forkJoin` aus `ArticlesApi.getForPrint` und `PrintTextsApi.get().articleAushang`, Modell bauen, mounten, drucken. Fehlertext parametrisieren (`'Artikel konnten nicht geladen werden'`); Importe über die bestehenden, begründeten `eslint-disable boundaries`-Ausnahmen.
- Tests (`print.service.spec.ts`): Aufruf lädt mit den übergebenen Filtern, öffnet den Druckdialog; Ladefehler → Toast, kein `window.print()` (AC-16); die bestehenden Tests laufen unverändert grün.

**Task 10 — Button auf der Artikel-Seite**
- `articles-page.html/.ts`: Button „Drucken" (PrimeNG `p-button`, `pi pi-print`) in der Filterleiste (Toolbar-`end`-Template, nach den Selects); `disabled`, wenn `totalCount() === 0`; Klick ruft `printService.printArticleAushang({ q, brand, category, status })` aus `filters()`. Für beide Rollen sichtbar, keine Rollenprüfung.
- Tests (`articles-page.spec.ts`): Button sichtbar für Admin und Kassenpersonal (AC-01); deaktiviert bei leerem Ergebnis (AC-02); übergibt aktive Filter an den Service, nicht die Tabellenseite (AC-03, AC-04).

**Task 11 — Einstellungen: vier Freitexte**
- `print-texts-form.ts/.html`: dritter Abschnitt „Artikel-Aushang" mit vier Feldern (Kopfzeile links/Mitte, Fußzeile links/Mitte) und eigenem Platzhinweis; Felder pro Abschnitt konfigurierbar statt fest fünf; `hasUnsavedChanges`/`discardChanges` berücksichtigen den dritten Satz.
- Tests (`print-texts-form.spec.ts`, `settings-page.spec.ts`): vier Felder sichtbar und speicherbar (AC-13); nur Admin über die vorhandene Route-Guard (AC-14); Ungespeichert-Erkennung für den neuen Satz.

### Doku und Abschluss

**Task 12 — Doku nachführen** (Regel „Doku-Nachführung", ein Lauf)
- `docs/requirements/bazaar-app/epics/Epic_Artikel/epic.md`: Überblick, Abschnitt Filter-Panel (Drucken-Button), Endpoint-Tabelle (`GET /api/articles/print`), EARS-Kriterien aus der Spec.
- `docs/requirements/bazaar-app/epics/Epic_Druckfunktionen/epic.md`: „Zwei Druckdokumente" → drei, Artikel-Aushang ergänzen.
- `docs/requirements/bazaar-app/components/print-document.md` (+ `overview.md`): Auslöser-Tabelle, Layout und Freitexte des Aushangs.
- `docs/requirements/bazaar-app/api/articles.md` (neuer Endpunkt, Filterparität) und `epics/Epic_Einstellungen/epic.md` (dritter Freitext-Satz, `PUT/GET /api/settings/print-texts`); `api/cross-cutting.md` nur prüfen, falls dort Freitexte erwähnt sind.
- `docs/glossary/frontend-terms.md`: „Artikel-Aushang"; Profile unter `docs/knowledge` (Feature `bazaar-app-settlement` bleibt, neues Feature-Profil oder Ergänzung an der Artikel-/Druck-Stelle, nach `dv-working-capturing`).
- Spec: Nachtrag zur Größen-Sortierregel („Offen"-Abschnitt auflösen) und Vermerk im Abschnitt „Entscheidungen".

## Prüfung am Ende

1. Backend: Build, Unit- und Architekturtests (`dv-dotnet:toolchain`); Migration gegen die Postgres-Integrationstests.
2. Frontend: Lint, Unit-Tests, Build (`dv-angular:toolchain`).
3. Im laufenden System: Filter „Im Verkauf" setzen, „Drucken" klicken, Vorschau prüfen (Gruppen, Reihenfolge, Spalten, Kopf/Fuß, Mehrseitigkeit mit > 200 Artikeln); „Als PDF speichern" einmal Desktop, einmal schmales Fenster (Tablet-Layout). Ausdruck selbst kann ich nicht physisch prüfen; die Vorschau schon.
4. AC-Abgleich: jede der 17 ACs ist einem Test aus Task 1–11 zugeordnet (AC-01/02 Task 10, AC-03/04 Task 1+10, AC-05/06 Task 7, AC-07–12/15/17 Task 8, AC-13/14 Task 11, AC-16 Task 9).

## Risiken

- **Spalten-Layout:** fünf schmale Spalten bei langen Bezeichnungen; Zeilen haben feste Höhe, lange Texte werden abgeschnitten (wie im Beleg). Falls das beim echten Test stört, ist die Zeilenhöhe die Stellschraube.
- **Sehr viele Artikel:** Dokument wird komplett im DOM gerendert; für einen Basar (Größenordnung mehrere tausend Zeilen) ist das ok, wird in der Vorschau-Prüfung mit einem großen Datensatz geprüft.
- **API-Kompatibilität:** `PUT /api/settings/print-texts` verlangt jetzt den dritten Satz; Frontend und Backend werden gemeinsam ausgeliefert (Monolith), ein alter Client bekäme 400.
