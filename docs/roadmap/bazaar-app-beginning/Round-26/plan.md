---
round: Round-26
status: geplant
---

# Plan: Round 26 — Einstellungen: JSON-Import

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-25/plan.md](../Round-25/plan.md): `features/settings/settings.page.ts`
  (hostet bereits `settings-form`, wird hier um einen zweiten Bereich ergänzt).
- [Round-14/plan.md](../Round-14/plan.md): `Seller`/`ISellerRepository`
  (`CreateSellerHandler`-Logik als Vorlage für die Konditions-Belegung).
- [Round-15/plan.md](../Round-15/plan.md): `Article`/`IArticleRepository` —
  Factory-Methode nimmt bisher ausschließlich `IIdGenerator`-erzeugte IDs an,
  wird hier um einen Import-Pfad mit vorgegebener ID ergänzt.
- [Round-11/plan.md](../Round-11/plan.md)/[Round-12/plan.md](../Round-12/plan.md):
  `Brand`/`Category`-Aggregate, `ExistsByNameIgnoreCase`.
- [Round-13/plan.md](../Round-13/plan.md): `ISellerTypeRepository`.

## Implementationsplan

### Backend

#### 1. Aggregate-Erweiterungen für Import

`Article.cs` (Round-15): zweite Factory `CreateFromImport(string id, int
number, ...)` — nimmt die Datei-ID direkt statt `IIdGenerator` zu rufen; alle
Zeitstempel `null`, `SoldManually = false`. `Seller.cs` (Round-14): analog
`CreateFromImport(string id, ...)`.

#### 2. `Bazaar.Application/Import/` — DTOs & Parsing

`ImportFileDto.cs` (Deserialisierungs-Ziel, 1:1 nach
`entities/import-format.md`-Schema), `ImportFileParser.cs` (statische Methode
oder kleiner Service, JSON-Deserialisierung + Schema-Validierung — wirft bei
strukturellen Abweichungen eine eigene `ImportFormatException : DomainException`
mit `ErrorCode = "import.invalid_format"`).

#### 3. `PreviewImportHandler`

Liest die Datei per `ImportFileParser`, dann rein lesende Vergleiche:
- `newSellers`/`replacedSellers`: `await sellerRepo.GetById(sellerId)` je
  Datei-Eintrag, `null` → neu, sonst → geprüft gegen Skip-Kriterium.
- `skippedSellers`: bestehender Seller mit `articleRepo.GetAllBySellerId(id)`
  → `Any(a => a.SoldAt != null)` oder `seller.SettledAt != null`.
- `unknownSellerTypes`: `sellerTypeRepo.GetAll()` einmal laden, Namen aus der
  Datei dagegen abgleichen (case-insensitiv wie sonst im System).
- `newBrands`/`newCategories`: `brandRepo`/`categoryRepo`
  `ExistsByNameIgnoreCase` je Name aus den Arrays.
- Leere `sellers`-Liste in der Datei → Response mit `sellerCount: 0` statt
  Fehler (Frontend erkennt das am Zahlenwert, kein eigener `errorCode`).

#### 4. `RunImportHandler`

Transaktion (`CreateExecutionStrategy`-Muster):

```csharp
foreach (var fileSeller in file.Sellers)
{
    var existing = await sellerRepo.GetById(fileSeller.Id);
    if (existing is not null)
    {
        var articles = await articleRepo.GetAllBySellerId(existing.Id);
        if (existing.SettledAt is not null || articles.Any(a => a.SoldAt is not null))
        {
            result.SkippedSellers++;
            continue;
        }
        await articleRepo.RemoveRange(articles);
        await sellerRepo.Remove(existing.Id);
    }

    var sellerTypeId = ResolveSellerType(fileSeller.SellerType, options.SellerTypeMapping, sellerTypes);
    var seller = Seller.CreateFromImport(fileSeller.Id, ..., sellerTypeId, sellerType.CommissionRate, sellerType.ItemFee);
    await sellerRepo.Add(seller);

    foreach (var fileArticle in fileSeller.Articles)
        await articleRepo.Add(Article.CreateFromImport(fileArticle.Id, fileArticle.Number, seller.Id, ...));
}

if (options.ImportBrands)
    foreach (var name in file.Brands.Where(n => !brandRepo.ExistsByNameIgnoreCase(n)))
        await brandRepo.Add(Brand.Create(idGenerator.Generate(), name, original: true));
// analog Categories
```

`ResolveSellerType` wirft `409 import.unmapped_seller_type` wenn weder direkte
Übereinstimmung noch Eintrag in `sellerTypeMapping` existiert.

#### 5. Api

`ImportEndpoints.cs` (`Bazaar.Api/Features/Import/`) — zwei
`multipart/form-data`-Routen, `IFormFile file` + (bei `/import`) `IFormFile
options` bzw. `[FromForm] string optionsJson` (ASP.NET Minimal API nimmt
gemischte Multipart-Felder über `[FromForm]`-DTO oder manuelles
`HttpRequest.Form`-Parsing — Entscheidung: eigenes kleines Binding über
`HttpRequest.Form.Files["file"]` + `JsonSerializer.Deserialize<ImportOptionsDto>
(HttpRequest.Form["options"])`, da Minimal API keinen eingebauten Support für
gemischte Datei+JSON-Multipart-Bodies hat).

### Frontend

#### 6. `import-panel`

`features/settings/components/import-panel/import-panel.ts` — Zustand
`signal<'empty'|'preview'|'running'|'done'>('empty')`. `p-fileupload
mode="basic"` `(onSelect)` → Datei im Speicher halten (`File`-Objekt, **nicht**
sofort verwerfen — wird für den zweiten Upload gebraucht) +
`import-api.ts`s `preview(file)`.

Vorschau-Template: Zahlen, übersprungene Liste, je unbekanntem Typ ein
`p-select` (bindet in ein `Record<string, string>`-Signal
`sellerTypeMapping`), zwei `p-checkbox` (`importBrands`/`importCategories`,
Default `true`). „Import bestätigen" `[disabled]` wenn
`unknownSellerTypes().some(t => !sellerTypeMapping()[t.name])` oder
`sellerCount() === 0`.

„Import bestätigen" → Zustand `'running'`, `import-api.ts`s `run(file,
{sellerTypeMapping, importBrands, importCategories})` → Erfolg: Toast, Zustand
`'done'` → nach kurzer Zeit zurück zu `'empty'` (Datei-Referenz verwerfen).

`400 import.invalid_format` bei der Vorschau → Fehlermeldung statt
Vorschau-Block, Datei-Picker bleibt bedienbar für einen neuen Versuch.

### 7. Verifikation

- `dotnet test` — `PreviewImportHandler`: Schema-Fehler, leere Datei,
  Skip-Erkennung (Fixture-Seller mit `SoldAt`-Artikel). `RunImportHandler`:
  kompletter Upsert-Zyklus (Seller existiert nicht → neu; existiert, keine
  Sperre → ersetzt; existiert, verkauft → übersprungen), `409` bei fehlender
  Typ-Zuordnung, Stammdaten-Checkbox `false` → keine neuen Brands/Categories
  trotz unbekannter Namen in der Datei.
- `ng serve`: Testdatei nach `entities/import-format.md`-Schema von Hand
  erstellen (kein echter Voranmelde-App-Export verfügbar in diesem
  Entwicklungsstand) → Vorschau zeigt korrekte Zahlen → bestätigen → `/sellers`
  und `/articles` zeigen importierte Datensätze mit `id` exakt wie in der Datei.
  Zweiten Import derselben Datei (jetzt „ersetzt" statt „neu") → Artikel bleiben
  identisch (gleiche IDs, neu angelegt statt aktualisiert — Nachweis über
  `updatedAt`-Zeitstempel-Wechsel).

## Reihenfolge

Backend 1 → 2 → 3 → 4 → 5 sequenziell (3 und 4 teilen sich `ImportFileParser`
aus 2). Frontend 6 nach 5. 7 abschließend.
