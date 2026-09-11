using BAR.Modules.Anmeldung.Contracts.Articles;
using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Anmeldung.Application.Articles.Update;

public sealed class UpdateArticleCommandHandler(IArticleRepository articles, IClock clock)
{
    public async Task<ArticleDto> HandleAsync(UpdateArticleCommand command, CancellationToken cancellationToken)
    {
        var article = await articles.GetByIdAsync(command.Id, cancellationToken);
        if (article is null || article.SellerId != command.SellerId)
        {
            throw new NotFoundException("article.not_found", "Artikel wurde nicht gefunden");
        }

        article.Update(command.Name, command.Brand, command.Category, command.Price, command.Size, command.Color, command.Description, clock.UtcNow);
        await articles.UpdateAsync(article, cancellationToken);

        return new ArticleDto(
            article.Id, article.Number, article.SellerId, article.Name, article.Brand, article.Category,
            article.Price, article.Size, article.Color, article.Description, article.CreatedAt, article.UpdatedAt);
    }
}
