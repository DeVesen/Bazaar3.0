using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Articles.Delete;

public sealed class DeleteArticleCommandHandler(IArticleRepository articles)
{
    public async Task HandleAsync(DeleteArticleCommand command, CancellationToken cancellationToken)
    {
        var article = await articles.GetByIdAsync(command.Id, cancellationToken);
        if (article is null || article.SellerId != command.SellerId)
        {
            throw new NotFoundException("article.not_found", "Artikel wurde nicht gefunden");
        }

        await articles.DeleteAsync(article, cancellationToken);
    }
}
