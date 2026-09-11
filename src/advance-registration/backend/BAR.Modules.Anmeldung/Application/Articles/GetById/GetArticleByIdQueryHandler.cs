using BAR.Modules.Anmeldung.Contracts.Articles;
using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.Modules.Verkaeuferverwaltung.Contracts;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Anmeldung.Application.Articles.GetById;

public sealed class GetArticleByIdQueryHandler(
    IArticleRepository articles, INumberBlockRepository blocks, IVerkaeuferverwaltungModuleApi verkaeuferverwaltung)
{
    public async Task<AdminArticleDto> HandleAsync(string id, CancellationToken cancellationToken)
    {
        var article = await articles.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("article.not_found", "Artikel wurde nicht gefunden");

        var names = await verkaeuferverwaltung.GetSellerNamesAsync([article.SellerId], cancellationToken);
        var name = names.GetValueOrDefault(article.SellerId)
            ?? throw new NotFoundException("article.not_found", "Artikel wurde nicht gefunden");

        var sellerBlocks = await blocks.GetForSellerAsync(article.SellerId, cancellationToken);
        var startNumber = sellerBlocks.Count > 0 ? sellerBlocks.Min(b => b.FromNumber) : 0;

        return new AdminArticleDto(
            article.Id, article.Number, article.Name, article.Brand, article.Category, article.Price,
            article.Size, article.Color, article.Description, article.CreatedAt, article.UpdatedAt,
            new SellerSummaryDto(name.Id, startNumber, name.FirstName, name.LastName));
    }
}
