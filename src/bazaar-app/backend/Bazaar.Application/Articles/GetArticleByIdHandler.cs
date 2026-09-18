using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Articles;

/// <summary>
/// Backs GET /api/articles/{id} (Round-15 review fix, same reasoning as
/// Round-14's <c>GetSellerByIdHandler</c>): the list DTO from
/// <see cref="GetArticlesHandler"/> only carries the columns the table
/// itself renders (id/number/name/brand/category/price/status/
/// soldManually/sellerId/sellerName) — it has no size/color/description
/// nor the raw releasedAt/soldAt/returnedAt/createdAt timestamps that
/// `artikel-dialog`/`article-status-popup` need to seed their forms. This
/// handler loads the full <see cref="Article"/> aggregate plus the
/// seller's settlement timestamp (needed for the "Verkäufer abgerechnet"
/// lock/banner in both dialogs) in one round-trip.
/// </summary>
public sealed class GetArticleByIdHandler(IArticleRepository articleRepository, ISellerRepository sellerRepository)
{
    public async Task<(Article Article, string SellerName, DateTimeOffset? SellerSettledAt)> Handle(string id)
    {
        var article = await articleRepository.GetById(id)
            ?? throw new NotFoundException("Artikel nicht gefunden", "article.not_found");

        var seller = await sellerRepository.GetById(article.SellerId);
        var sellerName = seller is null ? string.Empty : $"{seller.FirstName} {seller.LastName}";

        return (article, sellerName, seller?.SettledAt);
    }
}
