using BAR.Modules.Registration.Contracts.Articles;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.Exceptions;
using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.Operations.Contracts;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Registration.Application.Articles.Create;

public sealed class CreateArticleCommandHandler(
    IArticleRepository articles, INumberBlockRepository blocks, IOperationsModuleApi operations, IClock clock)
{
    public async Task<CreateArticleResultDto> HandleAsync(CreateArticleCommand command, CancellationToken cancellationToken)
    {
        var numbering = await operations.GetNumberingConfigAsync(cancellationToken);

        var sellerBlocks = await blocks.GetForSellerAsync(command.SellerId, cancellationToken);
        var used = await articles.GetUsedNumbersForSellerAsync(command.SellerId, cancellationToken);
        var allBlocks = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);

        ArticleNumberAllocation allocation;
        try
        {
            allocation = ArticleNumberAllocator.AllocateNext(
                sellerBlocks, used, allBlocks, command.SellerId, numbering.StartNumber, numbering.BlockSize, clock.UtcNow);
        }
        catch (NoFreeRangeException)
        {
            throw new ConflictException("article.no_free_number", "Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren");
        }

        if (command.ExpectedNumber.HasValue && command.ExpectedNumber.Value != allocation.Number)
        {
            throw new Registration.Contracts.ArticleNumberConflictException(
                $"Artikelnummer {command.ExpectedNumber} ist inzwischen vergeben — neue Nummer: {allocation.Number}",
                allocation.Number);
        }

        var article = Article.Create(
            command.SellerId, allocation.Number, command.Name, command.Brand, command.Category,
            command.Price, command.Size, command.Color, command.Description, clock.UtcNow);

        await articles.CreateAsync(article, allocation.NewBlock, cancellationToken);

        var nextNumber = await TryPeekNextNumberAsync(command.SellerId, numbering, allocation, cancellationToken);

        return new CreateArticleResultDto(
            article.Id, article.Number, article.SellerId, article.Name, article.Brand, article.Category,
            article.Price, article.Size, article.Color, article.Description,
            article.CreatedAt, article.UpdatedAt, nextNumber);
    }

    private async Task<int?> TryPeekNextNumberAsync(
        string sellerId, NumberingConfigDto numbering, ArticleNumberAllocation justAllocated, CancellationToken cancellationToken)
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
            var next = ArticleNumberAllocator.AllocateNext(sellerBlocks, used, allBlocks, sellerId, numbering.StartNumber, numbering.BlockSize, clock.UtcNow);
            return next.Number;
        }
        catch (NoFreeRangeException)
        {
            return null;
        }
    }
}
