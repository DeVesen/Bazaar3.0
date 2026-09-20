using Bazaar.Domain.Ports;

namespace Bazaar.Application.Import;

/// <summary>
/// Compares an uploaded import file (docs/requirements/bazaar-app/entities/import-format.md)
/// against the current database state and reports what a subsequent
/// <c>POST /api/import</c> would do — without writing anything
/// (api/import.md: "POST /api/import/preview schreibt nichts"). Parsing and
/// structural validation are ImportFileParser's job; this handler only
/// cross-references the parsed file against the repositories.
/// </summary>
public sealed class PreviewImportHandler(
    ISellerRepository sellerRepository,
    IArticleRepository articleRepository,
    IBrandRepository brandRepository,
    ICategoryRepository categoryRepository,
    ISellerTypeRepository sellerTypeRepository)
{
    public async Task<PreviewImportResult> Handle(Stream fileContent, CancellationToken cancellationToken)
    {
        var file = await ImportFileParser.Parse(fileContent, cancellationToken);

        var sellers = file.Sellers!;
        var sellerCount = sellers.Count;
        var articleCount = sellers.Sum(s => s.Articles!.Count);

        var newSellers = 0;
        var replacedSellers = 0;
        var skippedSellers = new List<SkippedSellerDetail>();

        foreach (var seller in sellers)
        {
            var existing = await sellerRepository.GetById(seller.Id!);
            if (existing is null)
            {
                newSellers++;
                continue;
            }

            var articles = await articleRepository.GetAllBySellerId(existing.Id);
            var soldCount = articles.Count(a => a.SoldAt is not null);

            if (soldCount > 0)
            {
                skippedSellers.Add(new SkippedSellerDetail(
                    existing.Id,
                    $"{existing.FirstName} {existing.LastName}",
                    "has_sold_articles",
                    soldCount));
                continue;
            }

            if (existing.SettledAt is not null)
            {
                skippedSellers.Add(new SkippedSellerDetail(
                    existing.Id,
                    $"{existing.FirstName} {existing.LastName}",
                    "settled",
                    null));
                continue;
            }

            replacedSellers++;
        }

        var knownSellerTypeNames = (await sellerTypeRepository.GetAll())
            .Select(t => t.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var unknownSellerTypes = sellers
            .Select(s => s.SellerType!)
            .Where(name => !knownSellerTypeNames.Contains(name))
            .GroupBy(name => name, StringComparer.OrdinalIgnoreCase)
            .Select(g => new UnknownSellerTypeDetail(g.Key, g.Count()))
            .ToList();

        var newBrands = 0;
        foreach (var brand in file.Brands!)
        {
            if (!await brandRepository.ExistsByNameIgnoreCase(brand))
            {
                newBrands++;
            }
        }

        var newCategories = 0;
        foreach (var category in file.Categories!)
        {
            if (!await categoryRepository.ExistsByNameIgnoreCase(category))
            {
                newCategories++;
            }
        }

        return new PreviewImportResult(
            sellerCount,
            articleCount,
            newSellers,
            replacedSellers,
            skippedSellers,
            unknownSellerTypes,
            newBrands,
            newCategories);
    }
}
