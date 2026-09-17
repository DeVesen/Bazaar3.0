---
round: Round-17
status: geplant
---

# Plan: Round 17 — Artikelannahme: Artikeleingabe & Buchen

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-16/plan.md](../Round-16/plan.md): `shared/components/input-group/`,
  `barcode-scanner/`, `autocomplete-create/`, `scan-feedback/` (alle bisher ohne
  Consumer), `features/intake/intake-wizard/` mit
  `intake-step-two-placeholder`-Komponente (wird jetzt ersetzt), `sellers-api.ts`.
- [Round-15/plan.md](../Round-15/plan.md): `IArticleRepository` (`GetById`,
  `GetMaxNumber`), `artikel-dialog` (mit `p-select`/`p-inputNumber`-Übergangslösung
  — wird in diesem Round umgerüstet).
- [Round-14/plan.md](../Round-14/plan.md): `ISellerRepository`.

## Implementationsplan

### Backend

#### 1. `IArticleRepository` erweitern

`GetByNumber(int number): Task<Article?>` in `Domain/Ports/IArticleRepository.cs`,
Implementierung in `ArticleRepository.cs`.

#### 2. `Bazaar.Application/Intake/`

`IntakeCommand` (`SellerId`, `FeeAmount`, `Articles: IReadOnlyList<IntakeArticleLine>`),
`IntakeCommandValidator` (Liste nicht leer, jede Zeile Pflichtfelder),
`IntakeHandler` — Transaktion über `Database.CreateExecutionStrategy().ExecuteAsync`
(Round-3-Regel für Retry-fähige Transaktionen):

```csharp
foreach (var line in command.Articles)
{
    var existing = await articleRepo.GetByNumber(line.Number);
    if (existing is null) { toCreate.Add(line); continue; }
    if (existing.SellerId == command.SellerId && existing.ReleasedAt is null)
    {
        toUpdate.Add((existing, line));
        continue;
    }
    taken.Add(line.Number);
}
if (taken.Count > 0)
    throw new ConflictException("Artikelnummer(n) vergeben", "article.number_taken")
    { Extensions = { ["takenNumbers"] = taken, ["nextNumber"] = await articleRepo.GetMaxNumber() + 1 } };
```

(`DomainException`-Erweiterung um optionale `Extensions`-Dictionary — kleine
Ergänzung an der Round-2-Basisklasse, da bisherige Fehler ohne Zusatzdaten
auskamen; `DomainExceptionHandler`, Round-2, muss `Extensions` in die
`ProblemDetails` übernehmen.)

`GetArticleByNumberHandler` — einfacher Read, `NotFoundException("...",
"article.number_unknown")` bei Fehlschlag.

#### 3. Api

`IntakeEndpoints.cs` (`Bazaar.Api/Features/Intake/`) — `POST /api/intake`.
`ArticleEndpoints.cs` (Round-15) um `GET /api/articles/by-number/{number}`
ergänzt.

### Frontend

#### 4. Umrüstung Round-15-Artikel-Dialog (zuerst, isolierter Schritt)

`features/articles/components/artikel-dialog/`: Marke-/Kategorie-`p-select`
→ `<app-autocomplete-create>` (Optionen weiterhin aus `brands-api.ts`/
`categories-api.ts`, `entryCreated`-Handler ruft jetzt `POST /api/brands`/
`/categories`). Preis-`p-inputNumber` → `<app-input-group variant="price"
[modes]="['keyboard','numpad']">`. Keine Änderung an Validierung/Sperrlogik/
Backend-Aufrufen.

#### 5. `session-item-popup`

`features/intake/components/session-item-popup/` — kleines Popup, dieselben vier
Felder wie die Artikeleingabe (Bezeichnung/Kategorie/Marke/Preis), rein
In-Memory-Bearbeitung eines Sitzungs-Eintrags, kein HTTP.

#### 6. Schritt-2-Artikeleingabe

`features/intake/components/intake-article-entry/` ersetzt
`intake-step-two-placeholder` aus Round-16 (gleicher Einhängepunkt im Wizard,
Datei wird ausgetauscht). 2-Spalten-Grid wie spec.md, `input-group` für
Artikelnummer (`modes=['keyboard','camera','numpad']`) — bindet
`barcode-scanner`/`scan-feedback` aus Round-16 erstmals live ein.

Artikelnummer-Prüfung: `(blur)`/`Enter` → `articles-api.ts`s
`getByNumber(number)`. Response-Verzweigung wie spec.md (404/200-eigener Seller-
unreleased/200-sonst).

#### 7. Sitzungsliste + Payment-Panel

`features/intake/components/intake-session-list/` — Signal-Array, Löschen pro
Zeile, Klick öffnet `session-item-popup`. Gebühr als `computed(() =>
items().length * seller.feePerItem)`. „Speichern" öffnet
`shared/components/payment-panel/` (**neu gebaut in diesem Round**, erster
Consumer — `@Input() totalLabel`/`totalAmount`/`confirmLabel`, `@Output()
confirmed`/`cancelled`, intern `p-inputnumber` + optionaler Numpad-Modus-Button
nach demselben Muster wie `input-group`s Preis-Variante, aber eigenständige
Komponente da eigene Rückgeld-Berechnung).

`confirmed` → `intake-api.ts`s `bookIntake(sellerId, feeAmount, articles)` →
`POST /api/intake`. `409 article.number_taken` → Sitzungsliste bleibt, betroffene
Zeilen markiert (`takenNumbers`-Abgleich gegen `items()`), Artikelnummer-Feld mit
`nextNumber` vorbefüllt. Erfolg → `printService.printIntakeReceipt(...)`
(`core/print/print.service.ts`, neu, Methode vorerst `console.log`-Stub),
Wizard-Reset zurück zur Such-Ansicht (Round-16).

### 8. Verifikation

- `dotnet test` — `IntakeHandler`: alle-neu-Fall, Konflikt-Fall (zwei Artikel mit
  gleicher Nummer aus verschiedenen Requests simuliert), Gebührenabweichung
  (`400`), vorangemeldeter-Artikel-Zweig (Artikel vorab per Repository mit
  `SellerId`+`ReleasedAt=null` angelegt, dann via Intake „nachgebucht").
- `ng test` — `payment-panel` Rückgeld-Berechnung (`change = received - total`,
  Button-Disabled unterhalb `total`), `intake-session-list` Doppel-Eintrag-
  Verhinderung (falls spezifiziert — Sitzungsliste erlaubt laut spec.md
  Mehrfach-Nummern nicht explizit ausgeschlossen, aber `by-number`-Check verhindert
  serverseitig ohnehin Duplikate über zwei Sitzungen hinweg).
- `ng serve`: kompletter Wizard-Durchlauf — Verkäufer suchen/anlegen → Artikel
  scannen (USB-Emulation per Tastatur reicht) → Kamera-Modus manuell testen
  (Laptop-Webcam, beliebigen QR-Code zeigen, Countdown/Ton prüfen) → Buchen →
  `GET /api/sellers/{id}/articles` (Round-14) zeigt die neuen Artikel mit
  `releasedAt` gesetzt.
- Nummernkonflikt provozieren (zwei Browser-Tabs, gleiche freie Nummer in beiden
  Sitzungen eintragen, zuerst Tab A buchen, dann Tab B) → Tab B zeigt `409` mit
  Korrekturvorschlag.

## Reihenfolge

Backend 1 → 2 → 3. Frontend 4 unabhängig, kann zuerst oder parallel laufen. 5 vor
6 (Popup wird von der Artikeleingabe-Komponente referenziert). 6 nach Backend 3
(braucht `by-number`). 7 nach 5/6. 8 abschließend.
