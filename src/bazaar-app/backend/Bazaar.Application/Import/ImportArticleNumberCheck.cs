using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Import;

/// <summary>
/// Article numbers are unique system-wide (IX_Articles_Number). Before the
/// import writes anything, this check finds every file number that would
/// collide — twice in the file itself, or already owned by an article that
/// survives the import (a seller not in the file, or a file seller that gets
/// skipped as sold/settled) — and reports them as one readable 409 instead of
/// letting the unique index abort the transaction with a 500. Articles of a
/// seller that gets replaced are deleted first and therefore never collide.
/// The skip criterion mirrors RunImportHandler/PreviewImportHandler exactly.
/// </summary>
internal static class ImportArticleNumberCheck
{
    private const int MaxListedConflicts = 10;

    public static async Task EnsureNoConflicts(
        IReadOnlyList<ImportSellerDto> fileSellers,
        ISellerRepository sellerRepository,
        IArticleRepository articleRepository,
        CancellationToken cancellationToken)
    {
        var conflicts = new List<string>();

        var fileArticles = fileSellers
            .SelectMany(s => s.Articles!.Select(a => (a.Number, SellerName: FullName(s.FirstName, s.LastName))))
            .ToList();

        foreach (var group in fileArticles.GroupBy(a => a.Number).Where(g => g.Count() > 1).OrderBy(g => g.Key))
        {
            var names = string.Join(", ", group.Select(a => a.SellerName).Distinct());
            conflicts.Add($"{group.Key} kommt in der Datei mehrfach vor ({names})");
        }

        var fileSellerIds = fileSellers.Select(s => s.Id!).ToHashSet();
        var survivingOwnerNames = new Dictionary<string, string?>();

        var existingArticles = await articleRepository.GetByNumbers(
            fileArticles.Select(a => a.Number).Distinct().ToList(),
            cancellationToken);

        foreach (var existing in existingArticles.OrderBy(a => a.Number))
        {
            if (!survivingOwnerNames.TryGetValue(existing.SellerId, out var ownerName))
            {
                ownerName = await SurvivingOwnerName(existing.SellerId, fileSellerIds, sellerRepository, articleRepository);
                survivingOwnerNames[existing.SellerId] = ownerName;
            }

            if (ownerName is not null)
            {
                conflicts.Add($"{existing.Number} ist bereits vergeben an {ownerName}");
            }
        }

        if (conflicts.Count == 0)
        {
            return;
        }

        var listed = string.Join("; ", conflicts.Take(MaxListedConflicts));
        var more = conflicts.Count > MaxListedConflicts ? $" (und {conflicts.Count - MaxListedConflicts} weitere)" : "";

        throw new ConflictException(
            $"Import nicht möglich, Artikelnummern kollidieren: {listed}{more}",
            "import.article_number_conflict");
    }

    /// <summary>
    /// Returns the owner's display name if its articles survive the import,
    /// or null if the owner is a file seller that gets replaced (its articles
    /// are deleted before the new ones are added).
    /// </summary>
    private static async Task<string?> SurvivingOwnerName(
        string sellerId,
        IReadOnlySet<string> fileSellerIds,
        ISellerRepository sellerRepository,
        IArticleRepository articleRepository)
    {
        var owner = await sellerRepository.GetById(sellerId);
        var ownerName = owner is null ? $"Verkäufer {sellerId}" : FullName(owner.FirstName, owner.LastName);

        if (!fileSellerIds.Contains(sellerId) || owner is null)
        {
            return ownerName;
        }

        var ownerArticles = await articleRepository.GetAllBySellerId(sellerId);
        var isSkipped = owner.SettledAt is not null || ownerArticles.Any(a => a.SoldAt is not null);

        return isSkipped ? $"{ownerName} (wird nicht ersetzt, da verkauft/abgerechnet)" : null;
    }

    private static string FullName(string? firstName, string? lastName) => $"{firstName} {lastName}".Trim();
}
