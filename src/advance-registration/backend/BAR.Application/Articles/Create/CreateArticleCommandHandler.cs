using BAR.Application.Abstractions;
using BAR.Domain.Articles;
using BAR.Domain.Exceptions;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;

namespace BAR.Application.Articles.Create;

public sealed class CreateArticleCommandHandler(
    IArticleRepository articles, INumberBlockRepository blocks, ISettingsRepository settingsRepository, IClock clock)
{
    public async Task<CreateArticleResult> HandleAsync(CreateArticleCommand command, CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken)
            ?? throw new ConflictException("article.no_free_number", "Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren");

        var sellerBlocks = await blocks.GetForSellerAsync(command.SellerId, cancellationToken);
        var used = await articles.GetUsedNumbersForSellerAsync(command.SellerId, cancellationToken);
        var allBlocks = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);

        ArticleNumberAllocation allocation;
        try
        {
            allocation = ArticleNumberAllocator.AllocateNext(
                sellerBlocks, used, allBlocks, command.SellerId, settings.StartNumber, settings.BlockSize, clock.UtcNow);
        }
        catch (NoFreeRangeException)
        {
            throw new ConflictException("article.no_free_number", "Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren");
        }

        if (command.ExpectedNumber.HasValue && command.ExpectedNumber.Value != allocation.Number)
        {
            throw new ArticleNumberConflictException(
                $"Artikelnummer {command.ExpectedNumber} ist inzwischen vergeben — neue Nummer: {allocation.Number}",
                allocation.Number);
        }

        var article = Article.Create(
            command.SellerId, allocation.Number, command.Name, command.Brand, command.Category,
            command.Price, command.Size, command.Color, command.Description, clock.UtcNow);

        await articles.CreateAsync(article, allocation.NewBlock, cancellationToken);

        var nextNumber = await TryPeekNextNumberAsync(command.SellerId, settings, allocation, cancellationToken);

        return new CreateArticleResult(
            article.Id, article.Number, article.SellerId, article.Name, article.Brand, article.Category,
            article.Price, article.Size, article.Color, article.Description,
            article.CreatedAt, article.UpdatedAt, nextNumber);
    }

    private async Task<int?> TryPeekNextNumberAsync(
        string sellerId, Domain.Settings.Settings settings, ArticleNumberAllocation justAllocated, CancellationToken cancellationToken)
    {
        var sellerBlocks = (await blocks.GetForSellerAsync(sellerId, cancellationToken)).ToList();
        var allBlocks = (await blocks.GetAllOrderedByFromNumberAsync(cancellationToken)).ToList();
        if (justAllocated.NewBlock is not null)
        {
            sellerBlocks.Add(justAllocated.NewBlock);
            allBlocks.Add(justAllocated.NewBlock);
        }

        var used = (await articles.GetUsedNumbersForSellerAsync(sellerId, cancellationToken)).ToList();
        used.Add(justAllocated.Number);

        try
        {
            var next = ArticleNumberAllocator.AllocateNext(sellerBlocks, used, allBlocks, sellerId, settings.StartNumber, settings.BlockSize, clock.UtcNow);
            return next.Number;
        }
        catch (NoFreeRangeException)
        {
            return null;
        }
    }
}
