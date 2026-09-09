using BAR.Application.Articles.GetAll;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Articles.GetById;

public sealed class GetArticleByIdQueryHandler(IArticleRepository articles, ISellerRepository sellers, INumberBlockRepository blocks)
{
    public async Task<AdminArticleResult> HandleAsync(string id, CancellationToken cancellationToken)
    {
        var article = await articles.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("article.not_found", "Artikel wurde nicht gefunden");

        var seller = await sellers.GetByIdAsync(article.SellerId, cancellationToken)
            ?? throw new NotFoundException("article.not_found", "Artikel wurde nicht gefunden");

        var sellerBlocks = await blocks.GetForSellerAsync(seller.Id, cancellationToken);
        var startNumber = sellerBlocks.Count > 0 ? sellerBlocks.Min(b => b.FromNumber) : 0;

        return new AdminArticleResult(
            article.Id, article.Number, article.Name, article.Brand, article.Category, article.Price,
            article.Size, article.Color, article.Description, article.CreatedAt, article.UpdatedAt,
            new SellerSummary(seller.Id, startNumber, seller.FirstName, seller.LastName));
    }
}
