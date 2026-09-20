using Bazaar.Domain.Articles;
using Bazaar.Domain.Brands;
using Bazaar.Domain.Categories;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Bazaar.Domain.SellerTypes;

namespace Bazaar.Application.Import;

/// <summary>
/// Executes the actual import (api/import.md section 2) after the admin has
/// reviewed <see cref="PreviewImportHandler"/>'s response and resolved any
/// unmapped seller types. A file seller whose id already exists is deleted
/// (together with all its articles) and recreated in the same transaction —
/// unless it or one of its articles is sold/settled, in which case it is
/// skipped untouched. The skip criterion deliberately mirrors
/// PreviewImportHandler's exactly, so preview and run always agree on which
/// sellers get replaced.
/// </summary>
public sealed class RunImportHandler(
    ISellerRepository sellerRepository,
    IArticleRepository articleRepository,
    IBrandRepository brandRepository,
    ICategoryRepository categoryRepository,
    ISellerTypeRepository sellerTypeRepository,
    IIdGenerator idGenerator,
    IUnitOfWork unitOfWork)
{
    public async Task<RunImportResult> Handle(Stream fileContent, ImportOptionsCommand options, CancellationToken cancellationToken)
    {
        var file = await ImportFileParser.Parse(fileContent, cancellationToken);

        // Fail fast, before the transaction (mirrors IntakeHandler's
        // fee-check-before-transaction pattern): every distinct sellerType
        // name in the file must either match an existing SellerType name
        // (case-insensitively) or have an entry in options.SellerTypeMapping.
        var sellerTypes = await sellerTypeRepository.GetAll();
        var knownSellerTypeNames = sellerTypes
            .Select(t => t.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var unmappedName = file.Sellers!
            .Select(s => s.SellerType!)
            .FirstOrDefault(name =>
                !knownSellerTypeNames.Contains(name) &&
                !options.SellerTypeMapping.ContainsKey(name));

        if (unmappedName is not null)
        {
            throw new ConflictException(
                $"Verkäufer-Typ \"{unmappedName}\" ist nicht zugeordnet",
                "import.unmapped_seller_type");
        }

        var importedSellers = 0;
        var importedArticles = 0;
        var skippedSellers = 0;
        var importedBrands = 0;
        var importedCategories = 0;

        await unitOfWork.ExecuteInTransactionAsync(async _ =>
        {
            importedSellers = 0;
            importedArticles = 0;
            skippedSellers = 0;
            importedBrands = 0;
            importedCategories = 0;

            var now = DateTimeOffset.UtcNow;

            foreach (var fileSeller in file.Sellers!)
            {
                var existing = await sellerRepository.GetById(fileSeller.Id!);
                if (existing is not null)
                {
                    var articles = await articleRepository.GetAllBySellerId(existing.Id);

                    if (existing.SettledAt is not null || articles.Any(a => a.SoldAt is not null))
                    {
                        skippedSellers++;
                        continue;
                    }

                    foreach (var article in articles)
                    {
                        await articleRepository.Remove(article);
                    }

                    await sellerRepository.Remove(existing);
                }

                var sellerType = ResolveSellerType(fileSeller.SellerType!, sellerTypes, options.SellerTypeMapping);

                var seller = Seller.CreateFromImport(
                    fileSeller.Id!,
                    fileSeller.FirstName!,
                    fileSeller.LastName!,
                    fileSeller.Address,
                    fileSeller.PostalCode,
                    fileSeller.City,
                    fileSeller.Phone,
                    fileSeller.Email!,
                    sellerType.Id,
                    sellerType.CommissionRate,
                    sellerType.ItemFee);

                await sellerRepository.Add(seller);
                importedSellers++;

                foreach (var fileArticle in fileSeller.Articles!)
                {
                    var article = Article.CreateFromImport(
                        fileArticle.Id!,
                        fileArticle.Number,
                        seller.Id,
                        fileArticle.Name!,
                        fileArticle.Brand!,
                        fileArticle.Category!,
                        fileArticle.Price,
                        fileArticle.Size,
                        fileArticle.Color,
                        fileArticle.Description,
                        now,
                        now);

                    await articleRepository.Add(article);
                    importedArticles++;
                }
            }

            if (options.ImportBrands)
            {
                foreach (var name in file.Brands!)
                {
                    if (!await brandRepository.ExistsByNameIgnoreCase(name))
                    {
                        await brandRepository.Add(Brand.Create(idGenerator.Generate(), name, original: true));
                        importedBrands++;
                    }
                }
            }

            if (options.ImportCategories)
            {
                foreach (var name in file.Categories!)
                {
                    if (!await categoryRepository.ExistsByNameIgnoreCase(name))
                    {
                        await categoryRepository.Add(Category.Create(idGenerator.Generate(), name, original: true));
                        importedCategories++;
                    }
                }
            }
        }, cancellationToken);

        return new RunImportResult(importedSellers, importedArticles, skippedSellers, importedBrands, importedCategories);
    }

    /// <summary>
    /// Resolves a file sellerType name to the real SellerType — directly by
    /// name (case-insensitive) or, failing that, via
    /// <paramref name="sellerTypeMapping"/>'s file-name-to-id entry. The
    /// pre-transaction check already guarantees one of these succeeds; the
    /// exceptions here are defensive only (api/import.md's 409 contract).
    /// </summary>
    private static SellerType ResolveSellerType(
        string fileSellerTypeName,
        IReadOnlyList<SellerType> sellerTypes,
        Dictionary<string, string> sellerTypeMapping)
    {
        var direct = sellerTypes.FirstOrDefault(t =>
            string.Equals(t.Name, fileSellerTypeName, StringComparison.OrdinalIgnoreCase));
        if (direct is not null)
        {
            return direct;
        }

        if (sellerTypeMapping.TryGetValue(fileSellerTypeName, out var mappedId))
        {
            var mapped = sellerTypes.FirstOrDefault(t => t.Id == mappedId);
            if (mapped is not null)
            {
                return mapped;
            }
        }

        throw new ConflictException(
            $"Verkäufer-Typ \"{fileSellerTypeName}\" ist nicht zugeordnet",
            "import.unmapped_seller_type");
    }
}
