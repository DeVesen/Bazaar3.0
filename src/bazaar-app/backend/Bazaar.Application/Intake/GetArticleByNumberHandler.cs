using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Intake;

/// <summary>
/// Backs GET /api/articles/by-number/{number} (api/articles.md §2) — used
/// by the cash desk for article recognition and by intake for the
/// number-uniqueness preview, including full-field prefill of a pre-announced,
/// not-yet-released article belonging to the same seller (Epic_Artikelannahme
/// Abschnitt 2, "Sonderfall importierter Verkäufer"). Mirrors
/// Bazaar.Application.Articles.GetArticleByIdHandler's shape: the Api-layer
/// response carries sellerName too, so this loads the seller alongside the
/// article in one round-trip rather than making the Api layer do a second
/// lookup.
/// </summary>
public sealed class GetArticleByNumberHandler(IArticleRepository articleRepository, ISellerRepository sellerRepository)
{
    public async Task<(Article Article, string SellerName)> Handle(int number)
    {
        var article = await articleRepository.GetByNumber(number)
            ?? throw new NotFoundException("Artikel nicht gefunden", "article.number_unknown");

        var seller = await sellerRepository.GetById(article.SellerId);
        var sellerName = seller is null ? string.Empty : $"{seller.FirstName} {seller.LastName}";

        return (article, sellerName);
    }
}
