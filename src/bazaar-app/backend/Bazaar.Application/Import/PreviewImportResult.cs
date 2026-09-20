namespace Bazaar.Application.Import;

public sealed class PreviewImportResult(
    int sellerCount,
    int articleCount,
    int newSellers,
    int replacedSellers,
    IReadOnlyList<SkippedSellerDetail> skippedSellers,
    IReadOnlyList<UnknownSellerTypeDetail> unknownSellerTypes,
    int newBrands,
    int newCategories)
{
    public int SellerCount { get; } = sellerCount;

    public int ArticleCount { get; } = articleCount;

    public int NewSellers { get; } = newSellers;

    public int ReplacedSellers { get; } = replacedSellers;

    public IReadOnlyList<SkippedSellerDetail> SkippedSellers { get; } = skippedSellers;

    public IReadOnlyList<UnknownSellerTypeDetail> UnknownSellerTypes { get; } = unknownSellerTypes;

    public int NewBrands { get; } = newBrands;

    public int NewCategories { get; } = newCategories;
}

/// <summary>
/// A file seller that will NOT be replaced by a subsequent import run
/// (api/import.md: "solche mit verkauften Artikeln (soldAt) oder
/// abgerechnetem Stand (settledAt)"). <paramref name="SoldCount"/> is only
/// populated for reason "has_sold_articles" (mirrors api/import.md's
/// example: <c>"soldCount": 7</c>); it is null for reason "settled", where
/// the seller has no sold articles to count.
/// </summary>
public sealed record SkippedSellerDetail(string Id, string Name, string Reason, int? SoldCount);

public sealed record UnknownSellerTypeDetail(string Name, int AffectedSellers);
