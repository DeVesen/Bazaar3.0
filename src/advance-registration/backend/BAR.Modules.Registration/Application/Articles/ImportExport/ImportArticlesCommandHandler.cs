using BAR.Modules.Registration.Contracts.Articles;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.MasterData.Contracts;
using BAR.Modules.MasterData.Contracts.MasterData;
using BAR.SharedKernel;

namespace BAR.Modules.Registration.Application.Articles.ImportExport;

public sealed class ImportArticlesCommandHandler(
    IArticleRepository articles, INumberBlockRepository blocks, IMasterDataModuleApi masterData, IClock clock)
{
    public async Task<ImportArticlesResultDto> HandleAsync(ImportArticlesCommand command, CancellationToken cancellationToken)
    {
        IReadOnlyList<ImportRawRow> rawRows;
        try
        {
            rawRows = ArticleImportFileParser.Parse(command.FileContent, command.FileName);
        }
        catch (FormatException ex)
        {
            throw new ArgumentException(ex.Message, ex);
        }

        var sellerBlocks = await blocks.GetForSellerAsync(command.SellerId, cancellationToken);
        var existingArticles = await articles.GetAllForSellerAsync(command.SellerId, cancellationToken);
        var (actions, errors) = ArticleImportValidator.Validate(rawRows, sellerBlocks, existingArticles);

        if (errors.Count > 0)
        {
            var dtoErrors = errors.Select(e => new ImportRowErrorDto(e.Row, e.ErrorCode, e.Detail)).ToList();
            return new ImportArticlesResultDto(false, 0, 0, 0, dtoErrors);
        }

        await EnsureBrandsAndCategoriesExistAsync(actions, command.IsAdmin, cancellationToken);

        var now = clock.UtcNow;
        var existingByNumber = existingArticles.ToDictionary(a => a.Number);
        var toCreate = new List<Article>();
        var toUpdate = new List<Article>();
        var toDelete = new List<Article>();

        foreach (var action in actions)
        {
            switch (action.Kind)
            {
                case ImportActionKind.Create:
                    toCreate.Add(Article.Create(
                        command.SellerId, action.Number, action.Name!, action.Brand!, action.Category!,
                        action.Price!.Value, action.Size, null, null, now));
                    break;
                case ImportActionKind.Update:
                    var existing = existingByNumber[action.Number];
                    existing.Update(action.Name!, action.Brand!, action.Category!, action.Price!.Value, action.Size, null, null, now);
                    toUpdate.Add(existing);
                    break;
                case ImportActionKind.Delete:
                    toDelete.Add(existingByNumber[action.Number]);
                    break;
                case ImportActionKind.NoOp:
                    break;
            }
        }

        await articles.ApplyImportAsync(toCreate, toUpdate, toDelete, cancellationToken);

        return new ImportArticlesResultDto(true, toCreate.Count, toUpdate.Count, toDelete.Count, []);
    }

    private async Task EnsureBrandsAndCategoriesExistAsync(
        IReadOnlyList<ImportAction> actions, bool isAdmin, CancellationToken cancellationToken)
    {
        var brandNames = actions.Where(a => a.Brand is not null).Select(a => a.Brand!).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        var categoryNames = actions.Where(a => a.Category is not null).Select(a => a.Category!).Distinct(StringComparer.OrdinalIgnoreCase).ToList();

        var existingBrands = await masterData.GetAllBrandNamesAsync(cancellationToken);
        var existingCategories = await masterData.GetAllCategoryNamesAsync(cancellationToken);

        foreach (var name in brandNames.Where(n => !existingBrands.Contains(n, StringComparer.OrdinalIgnoreCase)))
        {
            await masterData.CreateBrandAsync(new CreateBrandCommand(name, isAdmin), cancellationToken);
        }

        foreach (var name in categoryNames.Where(n => !existingCategories.Contains(n, StringComparer.OrdinalIgnoreCase)))
        {
            await masterData.CreateCategoryAsync(new CreateCategoryCommand(name, isAdmin), cancellationToken);
        }
    }
}
