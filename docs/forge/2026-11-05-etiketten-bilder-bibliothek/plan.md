# Implementierungs- und Testplan: Bilder-Bibliothek für den Etiketten-Vordruck (Rev. 1)

## Freigabe
- Status: freigegeben
- Freigegeben von: Sven Reichert, 2026-11-05, Rev. 1, Chat (Freigabe mit Defaults der offenen Fragen)

## Änderungen gegenüber Rev. –
- Erste Fassung.

## Kontext
- Work Item: keins (Projekt führt keine Work Items). Ziel: Der Admin lädt auf der Seite „Etiketten-Vordruck" eigene Bilder in eine Bibliothek hoch und wählt sie später erneut als Logo oder Verkäufer-Symbol aus.
- Zusatzanforderung: Bilder hochladen, dauerhaft aufbewahren und als Logo oder Verkäufer-Symbol verwenden – Auftrag im Chat, 2026-11-05.
- Bestand: Spec `docs/forge/2026-11-02-etiketten-vordruck/spec.md` (AC-15: eigenes Bild PNG/JPEG/SVG bis 1 MB; W · Speicherort: eigene Bilder im Backend; AC-17: letzte Werte geräteübergreifend vorbelegt).
- Akzeptanzkriterien (abgeleitet aus dem Auftrag, mit Freigabe bestätigt 2026-11-05):
  - **B-1** Gegeben die Seite „Etiketten-Vordruck", wenn der Admin bei Logo oder Verkäufer-Symbol ein PNG, JPEG oder SVG bis 1 MB hochlädt, dann liegt das Bild in der Bibliothek und ist für dieses Feld gewählt.
  - **B-2** Gegeben ein Bild in der Bibliothek, wenn der Admin die Seite auf einem anderen Gerät öffnet, dann zeigt die Auswahl bei Logo und Verkäufer-Symbol dieses Bild als Vorschaubild mit Namen.
  - **B-3** Gegeben ein Bild in der Bibliothek, wenn der Admin es bei Logo oder Verkäufer-Symbol anklickt, dann zeigt die Etikett-Vorschau dieses Bild im jeweiligen Feld.
  - **B-4** Gegeben eine andere Dateiart oder ein Bild über 1 MB, wenn der Admin es hochlädt, dann erscheint eine Fehlermeldung und die Bibliothek bleibt unverändert (wie AC-15).
  - **B-5** Gegeben ein Bild in der Bibliothek, wenn der Admin es löscht und bestätigt, dann fehlt es in der Auswahl; ein damit bereits gewähltes Logo oder Symbol bleibt im Etikett erhalten.
  - **B-6** Gegeben ein Bild, das inhaltsgleich schon in der Bibliothek liegt, wenn der Admin es erneut hochlädt, dann entsteht kein zweiter Eintrag; das vorhandene Bild wird gewählt.
  - **B-7** Gegeben die Bibliothek ist voll (Höchstzahl, F-2), wenn der Admin ein weiteres Bild hochlädt, dann erscheint eine Fehlermeldung „Bibliothek voll" und nichts wird gespeichert.
  - **B-8** Gegeben ein Kassenpersonal-Konto, wenn es die Bibliotheks-Endpunkte aufruft, dann antwortet das Backend mit 403.

## Delta
- Bilder dauerhaft sammeln – `LabelPrintDefaults` hält je Feld nur den letzten Wert als Data-URL (`Bazaar.Domain/BlankLabels/LabelPrintDefaults.cs:14-17`) – neue Entity `LabelImage` mit Tabelle `LabelImages`, Repository, Handler, Endpunkte.
- Bild-Prüfung – `LabelGraphic.IsValidImageDataUrl` prüft Medientyp und 1 MB (`LabelGraphic.cs:34-49`), privat – Prüfung als öffentliche statische Methode `LabelGraphic.IsValidImageDataUrl(string)` für `LabelImage` mitnutzen.
- Auswahl im Frontend – `GraphicPicker` bietet „Keins", Icons und Dropzone, Upload setzt direkt die Data-URL (`graphic-picker.html`, `blank-labels-page.ts:152-162`) – Picker zeigt zusätzlich die Bibliothek (Vorschaubilder, Löschen); Upload geht über die Bibliothek.
- Datenzugriff Frontend – `BlankLabelsApi` kennt nur Formate und Defaults (`data/blank-labels-api.ts`) – neue Methoden für die Bibliothek; Laden im `BlankLabelsStore`.
- Doku – Entity-Doku `docs/requirements/bazaar-app/entities/etiketten-vordruck.md` kennt nur zwei Tabellen – dritte Tabelle, Epic-/Story-Doku und Glossar nachführen.

## Entscheidungen
- Auswahl kopiert die Data-URL in `LabelGraphic { kind: 'image' }`; kein Verweis auf die Bibliotheks-Id – `LabelPrintDefaults`, Druck und `LabelCard` bleiben unverändert, und Löschen kann kein gewähltes Logo zerstören (B-5). Kosten: Bild liegt bis zu zweimal in der DB (≤ 1 MB), vertretbar. – folgenreich, ADR-Vorschlag „Bibliothek als Kopierquelle" (siehe Risiken).
- Speicherung als Data-URL in Spalte `text`, dazu `MediaType`, `SizeBytes`, `ContentHash` (SHA-256, hex, eindeutig) und `CreatedAt` – gleiche Darstellung wie `LabelPrintDefaults`, Prüfung bleibt eine Stelle.
- Upload als JSON `{ name, dataUrl }`, kein `multipart/form-data` – Frontend liest Dateien schon als Data-URL (`readFileAsDataUrl`), keine Antiforgery-Sonderregel wie bei `ImportEndpoints` nötig.
- Liste liefert nur Metadaten (`id`, `name`, `mediaType`, `sizeBytes`, `createdAt`); Inhalt einzeln über `GET /api/label-images/{id}` als JSON mit `dataUrl` – Liste bleibt klein; das Bild wird nie als eigenes Dokument ausgeliefert, damit läuft kein SVG-Skript über eine direkte URL (Anzeige weiter nur per `<img [src]>`, siehe `label-graphic-view.ts`).
- Doppelte Bilder per `ContentHash` erkennen und das vorhandene zurückgeben (200 statt 201) – kein Datenmüll bei wiederholtem Hochladen (B-6).
- Id nach Abschnitt 9.5 der App-Spec über `IIdGenerator` – wie `LabelSheetFormat`.
- Alle Endpunkte `RequireAuthorization("admin")` – wie die übrigen Etiketten-Endpunkte (`BlankLabelEndpoints.cs`).
- Höchstzahl und Name als Konstanten in `LabelImage` (`MaxCount`, `NameMaxLength = 50`) – Werte laut F-2/F-3.

## Implementierungsschritte
1. **Schnittstelle:** Endpunkte festlegen und in `docs/requirements/bazaar-app/api/` dokumentieren:
   - `GET /api/label-images` → 200 `LabelImageSummaryDto[]`, neueste zuerst.
   - `GET /api/label-images/{id}` → 200 `{ id, name, dataUrl }` | 404 `label_image.not_found`.
   - `POST /api/label-images` Body `{ name, dataUrl }` → 201 `LabelImageSummaryDto` (neu) | 200 (Duplikat) | 400 Validierung | 409 `label_image.library_full`.
   - `DELETE /api/label-images/{id}` → 204 | 404.
2. **Domain:** `Bazaar.Domain/BlankLabels/LabelImage.cs` (`Create(id, name, dataUrl, createdAt)`, Name trimmen, 1–50 Zeichen, Data-URL über `LabelGraphic.IsValidImageDataUrl`, Hash und Größe berechnen); `LabelGraphic.IsValidImageDataUrl` öffentlich machen; Port `Bazaar.Domain/Ports/ILabelImageRepository.cs` (`GetSummaries`, `GetById`, `FindByHash`, `Count`, `Add`, `Remove`).
3. **Infrastructure:** `LabelImageConfiguration` (Tabelle `LabelImages`, Unique-Index auf `ContentHash`), `DbSet<LabelImage>` in `BazaarDbContext`, `LabelImageRepository` (Summaries per Projektion ohne `DataUrl`; Unique-Verletzung bei parallelem Upload → vorhandenes Bild laden), EF-Migration `AddLabelImages` (Skill `dv-dotnet:dotnet-ef-migrations`).
4. **Application:** `GetLabelImagesHandler`, `GetLabelImageHandler`, `UploadLabelImageCommand` + `UploadLabelImageCommandValidator` + `UploadLabelImageHandler` (Duplikat → vorhandenes, sonst Höchstzahl prüfen → `ConflictException`), `DeleteLabelImageHandler`; `ImportLabelPrintDefaultImagesHandler` (F-6): legt Bilder aus `LabelPrintDefaults` (`Kind == Image`) mit Namen „Logo" bzw. „Verkäufer-Symbol" in die Bibliothek, falls ihr Hash fehlt; idempotent, ohne Höchstzahl-Prüfung (höchstens zwei Bilder). Aufruf einmal beim Start in `Program.cs` nach `MigrateAsync` – Id-Erzeugung nach §9.5 und Hash bleiben in C#, nicht in SQL.
5. **API:** Endpunkte in `BlankLabelEndpoints.cs` (oder `LabelImageEndpoints.cs` im selben Feature-Ordner), DTOs in `Dtos.cs`, Registrierung in `Program.cs` (Repository + vier Handler).
6. **Frontend Daten:** `BlankLabelsApi` um `getImages`, `getImage`, `uploadImage`, `deleteImage` erweitern; `BlankLabelsStore` lädt die Liste beim Öffnen und Inhalte der Vorschaubilder einzeln (Cache je Id).
7. **Frontend Oberfläche:** `GraphicPicker` erhält Input `libraryImages` (Id, Name, Data-URL) und Outputs `imageSelected`, `imageDeleteRequested`; Abschnitt „Bibliothek" mit Vorschaubild-Buttons (PrimeNG `pButton`, Auswahl hervorgehoben wie bei Icons) und Löschen-Button je Bild. `BlankLabelsPage.onImageChosen`: prüfen wie bisher → `uploadImage` → gewähltes Feld setzen; Löschen mit `ConfirmationService` („Bild „…" aus der Bibliothek löschen?"); Fehler 409 → Toast „Bibliothek voll".
8. **Doku-Nachführung:** Entity-Doku (Tabelle `LabelImages`), Epic-/Story-Doku Etiketten-Vordruck, API-Doku, Glossar „Bilder-Bibliothek", Feature-Profil Etiketten-Vordruck.

## Task-Schnitt
- T1 Backend (Schritte 1–5) – Domain bis API inkl. Migration und Tests – abhängig von: keine.
- T2 Frontend (Schritte 6–7) – API-Client, Store, Picker, Seite inkl. Tests – abhängig von: T1 (Vertrag aus Schritt 1 reicht zum parallelen Start).
- T3 Doku (Schritt 8) – abhängig von: T1, T2.
- Ein Branch, ein Worktree (`C:/wt/Bazaar3.0`, Branch `docs/feature/etiketten-bilder-bibliothek`); T1 und T2 nacheinander, da gemeinsamer Branch (AI-LLM-2003).

## Tests
- B-1 – Integration (API) – `BlankLabelEndpointsTests`: POST mit PNG-Data-URL → 201, GET Liste enthält Eintrag. Unit (Domain) – `LabelImageTests`: gültiges PNG/JPEG/SVG → Hash, Größe, Medientyp gesetzt. Frontend Unit – `blank-labels-page.spec.ts`: gültige Datei → `uploadImage` aufgerufen, Feld auf Data-URL gesetzt.
- B-2 – Integration – GET `/{id}` liefert dieselbe Data-URL wie hochgeladen. Frontend Unit – `graphic-picker.spec.ts`: Bibliotheksbilder werden mit Namen und `<img>` gerendert.
- B-3 – Frontend Unit – `graphic-picker.spec.ts`: Klick auf Bibliotheksbild emittiert `{ kind: 'image', value: dataUrl }`; `blank-labels-page.spec.ts`: Vorschau zeigt das Bild.
- B-4 – Unit (Domain/Validator) – `LabelImageTests`, `UploadLabelImageCommandValidatorTests`: GIF, ungültiges Base64, > 1 MB, Name leer/zu lang → ungültig. Integration – POST → 400, Liste leer. Frontend Unit – falsche Datei → Toast, kein `uploadImage`.
- B-5 – Integration – DELETE → 204, danach GET `/{id}` → 404, `label-print-defaults` unverändert. Unit (Application) – `DeleteLabelImageHandlerTests`: unbekannte Id → `NotFoundException`. Frontend Unit – Bestätigung → `deleteImage`, gewähltes Logo bleibt.
- B-6 – Unit (Application) – `UploadLabelImageHandlerTests`: gleicher Hash → vorhandenes Bild, kein `Add`. Integration – zweiter POST → 200, Liste hat einen Eintrag. Infrastructure – `LabelImageRepositoryTests`: Unique-Index auf `ContentHash`.
- B-7 – Unit (Application) – `UploadLabelImageHandlerTests`: `Count == MaxCount` → `ConflictException` `label_image.library_full`. Integration – 409. Frontend Unit – 409 → Toast „Bibliothek voll".
- F-6 Übernahme – Unit (Application) – `ImportLabelPrintDefaultImagesHandlerTests`: Logo als Bild → ein Eintrag „Logo"; Icon → kein Eintrag; zweiter Lauf → keine Änderung; Logo und Symbol gleich → ein Eintrag.
- B-8 – Integration – alle vier Endpunkte mit Kassen-Token → 403, ohne Token → 401.
- Architektur – `Bazaar.Architecture.Tests` laufen unverändert grün (Schichtregeln für neue Typen).
- Infrastructure – `LabelImageRepositoryTests`: `GetSummaries` lädt keine `DataUrl` (Projektion), Sortierung neueste zuerst.
- E2E: keins automatisiert (Projekt hat keine E2E-Suite); manuelle Prüfung im Browser: hochladen, auf zweitem Browser-Profil sehen, wählen, drucken, löschen.

## Betrieb
- Sichtbarkeit – Picker zeigt Anzahl „n von MaxCount Bildern"; keine eigene Admin-Seite.
- Aufräumen – nur manuell über Löschen; Dev-Reset (`DatabaseResetService`) löscht die Tabelle mit; keine automatische Bereinigung nötig, da keine Verweise bestehen.
- Konsistenzprüfung – entfällt, da `LabelPrintDefaults` Kopien hält; Unique-Index auf `ContentHash` verhindert Doppel.
- Datenmenge – höchstens `MaxCount × 1 MB` (+ Base64-Aufschlag 33 %) in Postgres; bei Default 50 rund 70 MB, für den lokalen Monolithen unkritisch.

## Abhängigkeiten und Übergaben
- Keine anderen Teams. Voranmelde-App nicht betroffen.
- Baut auf dem abgeschlossenen Etiketten-Vordruck (`docs/forge/2026-11-02-etiketten-vordruck/`) auf; dessen Stand ist in `master` (geprüft 2026-11-05, Commit `dddb8e9a`).

## Offene Fragen
- F-1 – Was passiert beim Löschen eines Bildes, das gerade als Logo oder Symbol gewählt ist? – Default: Löschen erlaubt, gewähltes Logo/Symbol bleibt (Kopie), nur aus der Auswahl entfernt. – Status: geklärt (Default bestätigt, 2026-11-05)
- F-2 – Wie viele Bilder darf die Bibliothek höchstens enthalten? – Default: 50. – Status: geklärt (Default bestätigt, 2026-11-05)
- F-3 – Name der Bilder: Dateiname oder eigener Name, später umbenennbar? – Default: Dateiname ohne Endung (gekürzt auf 50 Zeichen), kein Umbenennen in dieser Fassung. – Status: geklärt (Default bestätigt, 2026-11-05)
- F-4 – Eine gemeinsame Bibliothek für Logo und Verkäufer-Symbol oder getrennte Fächer? – Default: gemeinsam. – Status: geklärt (Default bestätigt, 2026-11-05)
- F-5 – Wird ein beim Hochladen gewähltes Bild sofort in die Bibliothek gelegt, oder braucht es einen eigenen Schritt „In Bibliothek speichern"? – Default: sofort in die Bibliothek und gewählt. – Status: geklärt (Default bestätigt, 2026-11-05)
- F-6 – Sollen Bilder, die heute schon als Logo/Symbol gespeichert sind, beim Update in die Bibliothek übernommen werden? – Default: ja, per Migration aus `LabelPrintDefaults` (Duplikat-Regel greift). – Status: geklärt (Default bestätigt, 2026-11-05)
- F-7 – Schutzbedarf der Bilder (Logos, Händler-Bilder) ist nicht eingestuft (AI-CORE-1001). – Default: normal, da keine personenbezogenen Daten erwartet. – Status: geklärt (Schutzbedarf normal, bestätigt 2026-11-05)

## Risiken und Annahmen
- Annahme (abgeleitet): Es gibt keine Spec für die Bibliothek; B-1 bis B-8 sind aus dem Chat-Auftrag abgeleitet. Abweichung von der Projektregel „Planung nur über dv-forge" auf ausdrücklichen Wunsch (Aufruf `plan-implementation`); Spec-Anpassung der Etiketten-Vordruck-Spec (neuer Abschnitt Bibliothek, Vermerk unter „Entscheidungen") ist Teil von Schritt 8.
- Risiko: Das Backend prüft den Bildinhalt nicht (nur Medientyp und Größe); SVG kann Skripte enthalten. Abhilfe: Ausgabe nur als Data-URL in JSON und Anzeige nur per `<img [src]>`, nie als eigenes Dokument oder per `innerHTML`.
- Risiko: Viele Vorschaubilder laden je einen Request; bei 50 Bildern 50 Requests beim Öffnen. Annahme: im lokalen Netz unkritisch; sonst später Thumbnails.
- ADR (mit Freigabe bestätigt 2026-11-05): „Bilder-Bibliothek ist Kopierquelle, keine Referenz" – Ablage nach Projektpraxis in der Spec unter „Entscheidungen", da das Projekt keine ADR-Ablage führt.
