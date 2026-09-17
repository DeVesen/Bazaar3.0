using BAR.Modules.Registration.Application.Articles.Create;
using BAR.Modules.Registration.Application.Articles.Delete;
using BAR.Modules.Registration.Application.Articles.GetAll;
using BAR.Modules.Registration.Application.Articles.GetById;
using BAR.Modules.Registration.Application.Articles.GetMine;
using BAR.Modules.Registration.Application.Articles.GetNextNumber;
using BAR.Modules.Registration.Application.Articles.ImportExport;
using BAR.Modules.Registration.Application.Articles.Update;
using BAR.Modules.Registration.Application.Blocks;
using BAR.Modules.Registration.Application.Blocks.Delete;
using BAR.Modules.Registration.Application.Blocks.GetForSeller;
using BAR.Modules.Registration.Application.Blocks.GetMine;
using BAR.Modules.Registration.Application.Blocks.NextFree;
using BAR.Modules.Registration.Application.Blocks.Reserve;
using BAR.Modules.Registration.Contracts;
using BAR.Modules.Registration.Contracts.Articles;
using BAR.Modules.Registration.Contracts.Blocks;
using BAR.Modules.Registration.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Modules.Registration.Application;

/// <summary>
/// Resolves the individual use-case handlers via <see cref="IServiceProvider"/>
/// only at method-call time, not in the constructor: Registration and
/// Operations (as well as SellerManagement, MasterData) call each other
/// mutually via Contracts (see dotnet-modulith-bridge, "bidirectional
/// Contracts dependency"). If this facade required all handlers in the
/// constructor like an ordinary service, a DI construction cycle (A→B→A)
/// would result, even though at runtime no use case actually calls itself
/// recursively - handler resolution is therefore deliberately deferred to
/// the point of the call.
/// </summary>
public sealed class RegistrationModuleApi(
    IServiceProvider serviceProvider,
    IArticleRepository articles,
    INumberBlockRepository blocks) : IRegistrationModuleApi
{
    private T Resolve<T>() where T : notnull => serviceProvider.GetRequiredService<T>();

    public Task<CreateArticleResultDto> CreateArticleAsync(CreateArticleCommand command, CancellationToken cancellationToken) =>
        Resolve<CreateArticleCommandHandler>().HandleAsync(command, cancellationToken);

    public Task<ArticleDto> UpdateArticleAsync(UpdateArticleCommand command, CancellationToken cancellationToken) =>
        Resolve<UpdateArticleCommandHandler>().HandleAsync(command, cancellationToken);

    public Task DeleteArticleAsync(DeleteArticleCommand command, CancellationToken cancellationToken) =>
        Resolve<DeleteArticleCommandHandler>().HandleAsync(command, cancellationToken);

    public Task<ArticleListResultDto> GetMyArticlesAsync(GetMyArticlesQuery query, CancellationToken cancellationToken) =>
        Resolve<GetMyArticlesQueryHandler>().HandleAsync(query, cancellationToken);

    public Task<NextNumberResultDto> GetNextNumberAsync(string sellerId, CancellationToken cancellationToken) =>
        Resolve<GetNextNumberQueryHandler>().HandleAsync(sellerId, cancellationToken);

    public Task<AdminArticleListResultDto> GetAllArticlesAsync(GetAllArticlesQuery query, CancellationToken cancellationToken) =>
        Resolve<GetAllArticlesQueryHandler>().HandleAsync(query, cancellationToken);

    public Task<AdminArticleDto> GetArticleByIdAsync(string articleId, CancellationToken cancellationToken) =>
        Resolve<GetArticleByIdQueryHandler>().HandleAsync(articleId, cancellationToken);

    public Task<IReadOnlyList<BlockDto>> GetMyBlocksAsync(string sellerId, CancellationToken cancellationToken) =>
        Resolve<GetMyBlocksQueryHandler>().HandleAsync(sellerId, cancellationToken);

    public Task<NextFreeResultDto> GetNextFreeBlockAsync(int blockCount, CancellationToken cancellationToken) =>
        Resolve<GetNextFreeQueryHandler>().HandleAsync(blockCount, cancellationToken);

    public Task<IReadOnlyList<BlockDto>> GetBlocksForSellerAsync(string sellerId, CancellationToken cancellationToken) =>
        Resolve<GetBlocksForSellerQueryHandler>().HandleAsync(sellerId, cancellationToken);

    public Task<IReadOnlyList<BlockDto>> ReserveBlocksAsync(ReserveBlocksCommand command, CancellationToken cancellationToken) =>
        Resolve<ReserveBlocksCommandHandler>().HandleAsync(command, cancellationToken);

    public Task DeleteBlockAsync(DeleteBlockCommand command, CancellationToken cancellationToken) =>
        Resolve<DeleteBlockCommandHandler>().HandleAsync(command, cancellationToken);

    public async Task<IReadOnlyList<BlockDto>> AllocateInitialBlocksAsync(string sellerId, int? blockCount, int? startNumber, CancellationToken cancellationToken)
    {
        var newBlocks = await Resolve<AllocateInitialBlocksService>().HandleAsync(sellerId, blockCount, startNumber, cancellationToken);
        return newBlocks.Select(b => new BlockDto(b.Id, b.SellerId, b.FromNumber, b.ToNumber, b.ToNumber - b.FromNumber + 1, 0, b.AssignedAt)).ToList();
    }

    public Task<int> CountArticlesWithBrandNameAsync(string brandName, CancellationToken cancellationToken) =>
        articles.CountWithBrandNameAsync(brandName, cancellationToken);

    public Task<int> CountArticlesWithCategoryNameAsync(string categoryName, CancellationToken cancellationToken) =>
        articles.CountWithCategoryNameAsync(categoryName, cancellationToken);

    public Task<bool> ExistsArticleNumberBelowAsync(int number, CancellationToken cancellationToken) =>
        articles.ExistsNumberBelowAsync(number, cancellationToken);

    public Task<int> CountArticlesForSellerAsync(string sellerId, CancellationToken cancellationToken) =>
        articles.CountForSellerAsync(sellerId, cancellationToken);

    public async Task<IReadOnlyDictionary<string, SellerBlockSummaryDto>> GetBlockSummariesForSellersAsync(
        IReadOnlyCollection<string> sellerIds, CancellationToken cancellationToken)
    {
        var result = new Dictionary<string, SellerBlockSummaryDto>();
        foreach (var sellerId in sellerIds)
        {
            var sellerBlocks = await blocks.GetForSellerAsync(sellerId, cancellationToken);
            var startNumber = sellerBlocks.Count > 0 ? sellerBlocks.Min(b => b.FromNumber) : (int?)null;
            var articleCount = await articles.CountForSellerAsync(sellerId, cancellationToken);
            result[sellerId] = new SellerBlockSummaryDto(startNumber, articleCount);
        }

        return result;
    }

    public async Task<IReadOnlyList<ExportArticleDto>> GetArticlesForExportAsync(CancellationToken cancellationToken)
    {
        var all = await articles.GetAllForExportAsync(cancellationToken);
        return all.Select(a => new ExportArticleDto(
            a.SellerId, a.Id, a.Number, a.Name, a.Brand, a.Category, a.Price, a.Size, a.Color, a.Description)).ToList();
    }

    public Task<string> GetArticleExportCsvAsync(string sellerId, CancellationToken cancellationToken) =>
        Resolve<GetArticleExportCsvQueryHandler>().HandleAsync(sellerId, cancellationToken);

    public Task<string> GetArticleTemplateCsvAsync(string sellerId, CancellationToken cancellationToken) =>
        Resolve<GetArticleTemplateCsvQueryHandler>().HandleAsync(sellerId, cancellationToken);

    public Task<ImportArticlesResultDto> ImportArticlesAsync(ImportArticlesCommand command, CancellationToken cancellationToken) =>
        Resolve<ImportArticlesCommandHandler>().HandleAsync(command, cancellationToken);

    public async Task<RegistrationDashboardStatsDto> GetDashboardStatsAsync(DateTime heatmapSinceUtc, CancellationToken cancellationToken)
    {
        var all = await articles.GetAllForExportAsync(cancellationToken);

        var counts = all
            .SelectMany(a => new[] { a.CreatedAt.Date, a.UpdatedAt.Date })
            .Where(d => d >= heatmapSinceUtc.Date)
            .GroupBy(d => d)
            .Select(g => new HeatmapEntryDto(DateOnly.FromDateTime(g.Key), g.Count()))
            .OrderBy(e => e.Date)
            .ToList();

        return new RegistrationDashboardStatsDto(all.Count, counts);
    }

    public async Task DeleteAllForSellerAsync(string sellerId, CancellationToken cancellationToken)
    {
        // Sequential, not Task.WhenAll: both repositories share the same
        // RegistrationDbContext/connection, which isn't thread-safe - running
        // both deletes concurrently throws NpgsqlOperationInProgressException.
        await articles.DeleteAllForSellerAsync(sellerId, cancellationToken);
        await blocks.DeleteAllForSellerAsync(sellerId, cancellationToken);
    }
}
