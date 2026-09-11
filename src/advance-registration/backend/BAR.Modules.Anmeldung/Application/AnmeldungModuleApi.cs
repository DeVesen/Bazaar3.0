using BAR.Modules.Anmeldung.Application.Articles.Create;
using BAR.Modules.Anmeldung.Application.Articles.Delete;
using BAR.Modules.Anmeldung.Application.Articles.GetAll;
using BAR.Modules.Anmeldung.Application.Articles.GetById;
using BAR.Modules.Anmeldung.Application.Articles.GetMine;
using BAR.Modules.Anmeldung.Application.Articles.GetNextNumber;
using BAR.Modules.Anmeldung.Application.Articles.Update;
using BAR.Modules.Anmeldung.Application.Blocks;
using BAR.Modules.Anmeldung.Application.Blocks.Delete;
using BAR.Modules.Anmeldung.Application.Blocks.GetForSeller;
using BAR.Modules.Anmeldung.Application.Blocks.GetMine;
using BAR.Modules.Anmeldung.Application.Blocks.NextFree;
using BAR.Modules.Anmeldung.Application.Blocks.Reserve;
using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Anmeldung.Contracts.Articles;
using BAR.Modules.Anmeldung.Contracts.Blocks;
using BAR.Modules.Anmeldung.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Modules.Anmeldung.Application;

/// <summary>
/// Loest die einzelnen Use-Case-Handler ueber <see cref="IServiceProvider"/>
/// erst beim Methodenaufruf auf, nicht im Konstruktor: Anmeldung und Betrieb
/// (bzw. Verkaeuferverwaltung, Stammdaten) rufen sich wechselseitig ueber
/// Contracts an (siehe dotnet-modulith-bridge, "bidirektionale
/// Contracts-Abhaengigkeit"). Wuerde diese Facade wie ein gewoehnlicher
/// Service alle Handler im Konstruktor verlangen, entstuende ein
/// DI-Konstruktionszyklus (A→B→A), obwohl zur Laufzeit kein Anwendungsfall
/// tatsaechlich rekursiv sich selbst aufruft - die Handler-Aufloesung wird
/// darum bewusst auf den Zeitpunkt des Aufrufs verschoben.
/// </summary>
public sealed class AnmeldungModuleApi(
    IServiceProvider serviceProvider,
    IArticleRepository articles,
    INumberBlockRepository blocks) : IAnmeldungModuleApi
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

    public async Task<AnmeldungDashboardStatsDto> GetDashboardStatsAsync(DateTime heatmapSinceUtc, CancellationToken cancellationToken)
    {
        var all = await articles.GetAllForExportAsync(cancellationToken);

        var counts = all
            .SelectMany(a => new[] { a.CreatedAt.Date, a.UpdatedAt.Date })
            .Where(d => d >= heatmapSinceUtc.Date)
            .GroupBy(d => d)
            .Select(g => new HeatmapEntryDto(DateOnly.FromDateTime(g.Key), g.Count()))
            .OrderBy(e => e.Date)
            .ToList();

        return new AnmeldungDashboardStatsDto(all.Count, counts);
    }

    public Task DeleteAllForSellerAsync(string sellerId, CancellationToken cancellationToken) =>
        Task.WhenAll(
            articles.DeleteAllForSellerAsync(sellerId, cancellationToken),
            blocks.DeleteAllForSellerAsync(sellerId, cancellationToken));
}
