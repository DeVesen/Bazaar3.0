using Bazaar.Domain.Articles;
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

        await EnsureNumberAvailable(article, command.Number);

        var now = DateTimeOffset.UtcNow;
        article.UpdateDetails(command.Name, command.Brand, command.Category, command.Price, command.Size, command.Color, command.Description, now);
        article.Renumber(command.Number, now);

        await articleRepository.Update(article);
    }

    private async Task EnsureNumberAvailable(Article article, int number)
    {
        if (number == article.Number) return;

        var owner = await articleRepository.GetByNumber(number);
        if (owner is null) return;

        throw new ConflictException($"Artikelnummer {number} ist bereits vergeben.", "article.number_taken");
    }
}
