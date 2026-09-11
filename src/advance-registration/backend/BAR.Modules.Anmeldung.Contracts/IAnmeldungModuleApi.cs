using BAR.Modules.Anmeldung.Contracts.Articles;
using BAR.Modules.Anmeldung.Contracts.Blocks;

namespace BAR.Modules.Anmeldung.Contracts;

/// <summary>
/// Einzige Anlaufstelle des Moduls Anmeldung. BAR.Host und alle anderen
/// Module rufen ausschliesslich diese Facade auf (dotnet-modulith-bridge).
/// </summary>
public interface IAnmeldungModuleApi
{
    Task<CreateArticleResultDto> CreateArticleAsync(CreateArticleCommand command, CancellationToken cancellationToken);
    Task<ArticleDto> UpdateArticleAsync(UpdateArticleCommand command, CancellationToken cancellationToken);
    Task DeleteArticleAsync(DeleteArticleCommand command, CancellationToken cancellationToken);
    Task<ArticleListResultDto> GetMyArticlesAsync(GetMyArticlesQuery query, CancellationToken cancellationToken);
    Task<NextNumberResultDto> GetNextNumberAsync(string sellerId, CancellationToken cancellationToken);

    Task<AdminArticleListResultDto> GetAllArticlesAsync(GetAllArticlesQuery query, CancellationToken cancellationToken);
    Task<AdminArticleDto> GetArticleByIdAsync(string articleId, CancellationToken cancellationToken);

    Task<IReadOnlyList<BlockDto>> GetMyBlocksAsync(string sellerId, CancellationToken cancellationToken);
    Task<NextFreeResultDto> GetNextFreeBlockAsync(int blockCount, CancellationToken cancellationToken);
    Task<IReadOnlyList<BlockDto>> GetBlocksForSellerAsync(string sellerId, CancellationToken cancellationToken);
    Task<IReadOnlyList<BlockDto>> ReserveBlocksAsync(ReserveBlocksCommand command, CancellationToken cancellationToken);
    Task DeleteBlockAsync(DeleteBlockCommand command, CancellationToken cancellationToken);

    /// <summary>Fuer Verkaeuferverwaltung: Register/CreateSeller lassen hier vergeben, inkl. Retry-bei-Overlap.</summary>
    Task<IReadOnlyList<BlockDto>> AllocateInitialBlocksAsync(string sellerId, int? blockCount, int? startNumber, CancellationToken cancellationToken);

    /// <summary>Fuer Stammdaten: In-Use-Pruefung beim Loeschen einer Marke/Kategorie.</summary>
    Task<int> CountArticlesWithBrandNameAsync(string brandName, CancellationToken cancellationToken);
    Task<int> CountArticlesWithCategoryNameAsync(string categoryName, CancellationToken cancellationToken);

    /// <summary>Fuer Betrieb: Validierung einer neuen Startnummer in den Einstellungen.</summary>
    Task<bool> ExistsArticleNumberBelowAsync(int number, CancellationToken cancellationToken);

    /// <summary>Fuer Home (Seller-Ansicht, Host-Komposition).</summary>
    Task<int> CountArticlesForSellerAsync(string sellerId, CancellationToken cancellationToken);

    /// <summary>Fuer die Verkaeufer-Liste (Verkaeuferverwaltung): Startnummer + Artikelzahl je Verkaeufer in einem Aufruf statt N+1.</summary>
    Task<IReadOnlyDictionary<string, SellerBlockSummaryDto>> GetBlockSummariesForSellersAsync(IReadOnlyCollection<string> sellerIds, CancellationToken cancellationToken);

    /// <summary>Fuer Export.</summary>
    Task<IReadOnlyList<ExportArticleDto>> GetArticlesForExportAsync(CancellationToken cancellationToken);

    /// <summary>Fuer Home (Admin-Ansicht, Host-Komposition).</summary>
    Task<AnmeldungDashboardStatsDto> GetDashboardStatsAsync(DateTime heatmapSinceUtc, CancellationToken cancellationToken);

    /// <summary>Fuer Verkaeuferverwaltung: Cascade-Delete eines Verkaeufers (best effort, siehe SellerCascadeDeleter).</summary>
    Task DeleteAllForSellerAsync(string sellerId, CancellationToken cancellationToken);
}
