using System.Globalization;
using Bazaar.Domain.Articles;
using Bazaar.Domain.Brands;
using Bazaar.Domain.Categories;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.ArticleImport;

/// <summary>
/// Importiert die Zeilen einer Artikel-Datei als Artikel „Registriert" für einen Verkäufer — alles oder nichts:
/// Datei lesen und Zeilen prüfen außerhalb der Transaktion (das kann bei großen Dateien dauern); die Prüfung auf
/// vergebene Artikelnummern, die Fehlerentscheidung und das Schreiben laufen gemeinsam in einer Transaktion
/// (Muster <c>IntakeHandler</c>), damit zwischen Prüfung und Insert kein langes Zeitfenster für eine parallele
/// Anlage derselben Nummer liegt. Der Import überschreibt nie; jede vergebene Nummer ist ein Fehler.
/// Restrisiko: Legt ein paralleler Vorgang dieselbe Nummer innerhalb der Transaktion an, verletzt der Insert den
/// Unique-Index auf <c>Article.Number</c>; die Transaktion rollt zurück (nichts gespeichert), der Admin sieht 500.
/// </summary>
public sealed class ImportSellerArticlesHandler(
    ISellerRepository sellerRepository,
    IArticleRepository articleRepository,
    IBrandRepository brandRepository,
    ICategoryRepository categoryRepository,
    IArticleTableReader tableReader,
    IIdGenerator idGenerator,
    IUnitOfWork unitOfWork)
{
    /// <summary>
    /// Höchstzahl der Zeilen nach der Kopfzeile. Jedes <c>Add</c> speichert im Bestand einzeln; 20.000 Zeilen
    /// liegen weit über jeder realen Verkäuferliste und bleiben innerhalb der 3 Minuten, die Proxy und Frontend
    /// warten. Leerzeilen zählen mit, weil die Grenze vor dem Zeilenprüfen greift.
    /// </summary>
    public const int MaxDataRows = 20_000;

    public async Task<ImportSellerArticlesResult> Handle(
        string sellerId,
        Stream content,
        string fileName,
        string? locale,
        CancellationToken cancellationToken)
    {
        await EnsureSellerOpen(sellerId);

        var rows = tableReader.ReadRows(content, fileName);
        EnsureRowLimit(rows);
        var parsed = ArticleTableParser.Parse(rows, ResolveCulture(locale));

        await unitOfWork.ExecuteInTransactionAsync(async transactionToken =>
        {
            var takenNumberErrors = await FindTakenNumberErrors(parsed.NumberedRows, transactionToken);
            var errors = parsed.Errors.Concat(takenNumberErrors).OrderBy(error => error.RowNumber).ToList();
            ThrowIfInvalid(errors, parsed.Lines);

            await SaveLines(sellerId, parsed.Lines, transactionToken);
        }, cancellationToken);

        return new ImportSellerArticlesResult(parsed.Lines.Count);
    }

    private static void EnsureRowLimit(IReadOnlyList<IReadOnlyList<object?>> rows)
    {
        if (rows.Count - 1 <= MaxDataRows) return;

        throw new BadRequestException(
            "Die Datei enthält mehr als 20.000 Zeilen nach der Kopfzeile",
            "import.too_many_rows");
    }

    /// <summary>
    /// Der Verkäufer muss existieren und darf nicht abgerechnet sein; der deaktivierte Button im Frontend
    /// allein schützt einen direkten API-Aufruf nicht.
    /// </summary>
    private async Task EnsureSellerOpen(string sellerId)
    {
        var seller = await sellerRepository.GetById(sellerId)
            ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

        if (seller.SettledAt is not null)
        {
            throw new ConflictException("Verkäufer ist bereits abgerechnet", "settlement.locked");
        }
    }

    /// <summary>
    /// Die Browser-Sprache bestimmt das Dezimalzeichen; eine unbekannte oder fehlende Sprache liest wie die invariante Kultur.
    /// </summary>
    private static CultureInfo ResolveCulture(string? locale)
    {
        if (string.IsNullOrWhiteSpace(locale)) return CultureInfo.InvariantCulture;

        try
        {
            return CultureInfo.GetCultureInfo(locale);
        }
        catch (CultureNotFoundException)
        {
            return CultureInfo.InvariantCulture;
        }
    }

    private async Task<IReadOnlyList<ImportRowError>> FindTakenNumberErrors(
        IReadOnlyList<NumberedRow> numberedRows,
        CancellationToken cancellationToken)
    {
        var existing = await articleRepository.GetByNumbers(
            numberedRows.Select(row => row.Number).ToList(),
            cancellationToken);
        var ownerNames = await LoadOwnerNames(existing);
        var ownerByNumber = existing.ToDictionary(article => article.Number, article => ownerNames[article.SellerId]);

        return numberedRows
            .Where(row => ownerByNumber.ContainsKey(row.Number))
            .Select(row => new ImportRowError(
                row.RowNumber,
                row.Number.ToString(CultureInfo.InvariantCulture),
                $"Artikelnummer ist bereits vergeben (Verkäufer: {ownerByNumber[row.Number]})"))
            .ToList();
    }

    private async Task<Dictionary<string, string>> LoadOwnerNames(IReadOnlyList<Article> articles)
    {
        var names = new Dictionary<string, string>();
        foreach (var ownerId in articles.Select(article => article.SellerId).Distinct())
        {
            var owner = await sellerRepository.GetById(ownerId);
            names[ownerId] = owner is null ? "unbekannt" : $"{owner.FirstName} {owner.LastName}";
        }

        return names;
    }

    private static void ThrowIfInvalid(IReadOnlyList<ImportRowError> errors, IReadOnlyList<ImportArticleLine> lines)
    {
        if (errors.Count > 0)
        {
            throw new BadRequestException(ArticleImportErrorMessage.Format(errors), "import.invalid_rows")
            {
                Extensions = { ["errorCount"] = errors.Count },
            };
        }

        if (lines.Count == 0)
        {
            throw new BadRequestException("Datei enthält keine Artikel", "import.no_articles");
        }
    }

    /// <summary>
    /// Schreibt Kategorien, Marken und Artikel; läuft nur innerhalb der Transaktion aus <see cref="Handle"/>.
    /// Die Bestands-Repositories nehmen keinen Token; darum prüft die Schleife ihn vor jedem Artikel, und ein
    /// Client-Abbruch rollt die Transaktion zurück.
    /// </summary>
    private async Task SaveLines(string sellerId, IReadOnlyList<ImportArticleLine> lines, CancellationToken cancellationToken)
    {
        var categories = await EnsureNames(
            (await categoryRepository.GetAll()).Select(category => category.Name),
            lines.Select(line => line.Category),
            name => categoryRepository.Add(Category.Create(idGenerator.Generate(), name, original: false)));
        var brands = await EnsureNames(
            (await brandRepository.GetAll()).Select(brand => brand.Name),
            lines.Select(line => line.Brand),
            name => brandRepository.Add(Brand.Create(idGenerator.Generate(), name, original: false)));

        var now = DateTimeOffset.UtcNow;
        foreach (var line in lines)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var article = Article.Create(
                idGenerator.Generate(),
                line.Number,
                sellerId,
                line.Name,
                brands[line.Brand],
                categories[line.Category],
                line.Price,
                line.Size,
                null,
                null,
                now,
                now);
            await articleRepository.Add(article);
        }
    }

    /// <summary>
    /// Liefert zu jedem gewünschten Namen den vorhandenen Namen (Groß-/Kleinschreibung egal) und legt unbekannte
    /// über <paramref name="createNew"/> an; bei mehreren Schreibweisen in der Datei gewinnt die erste.
    /// </summary>
    private static async Task<Dictionary<string, string>> EnsureNames(
        IEnumerable<string> existingNames,
        IEnumerable<string> wantedNames,
        Func<string, Task> createNew)
    {
        var known = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        foreach (var name in existingNames)
        {
            known[name] = name;
        }

        foreach (var name in wantedNames)
        {
            if (known.ContainsKey(name)) continue;

            await createNew(name);
            known[name] = name;
        }

        return known;
    }
}
