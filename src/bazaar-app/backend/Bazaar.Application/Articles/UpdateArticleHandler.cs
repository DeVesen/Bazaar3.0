using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Articles;

public sealed class UpdateArticleHandler(IArticleRepository articleRepository, ISellerRepository sellerRepository)
{
    public async Task Handle(UpdateArticleCommand command)
    {
        var article = await articleRepository.GetById(command.Id)
            ?? throw new NotFoundException("Artikel nicht gefunden", "article.not_found");

        var seller = await sellerRepository.GetById(article.SellerId);
        if (seller?.SettledAt != null)
        {
            throw new ConflictException("Verkäufer ist abgerechnet", "settlement.locked");
        }

        var now = DateTimeOffset.UtcNow;
        article.UpdateDetails(command.Name, command.Brand, command.Category, command.Price, command.Size, command.Color, command.Description, now);

        await articleRepository.Update(article);
    }
}
