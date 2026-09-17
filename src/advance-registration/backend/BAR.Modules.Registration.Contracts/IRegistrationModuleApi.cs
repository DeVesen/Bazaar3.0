using BAR.Modules.Registration.Contracts.Articles;
using BAR.Modules.Registration.Contracts.Blocks;

namespace BAR.Modules.Registration.Contracts;

/// <summary>
/// The single point of contact for the Registration module. BAR.Host and
/// every other module call only this facade (dotnet-modulith-bridge).
/// </summary>
public interface IRegistrationModuleApi
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

    /// <summary>For SellerManagement: Register/CreateSeller have blocks allocated here, including retry-on-overlap.</summary>
    Task<IReadOnlyList<BlockDto>> AllocateInitialBlocksAsync(string sellerId, int? blockCount, int? startNumber, CancellationToken cancellationToken);

    /// <summary>For MasterData: the in-use check when deleting a brand/category.</summary>
    Task<int> CountArticlesWithBrandNameAsync(string brandName, CancellationToken cancellationToken);
    Task<int> CountArticlesWithCategoryNameAsync(string categoryName, CancellationToken cancellationToken);

    /// <summary>For Operations: validating a new start number in the settings.</summary>
    Task<bool> ExistsArticleNumberBelowAsync(int number, CancellationToken cancellationToken);

    /// <summary>For Home (seller view, Host composition).</summary>
    Task<int> CountArticlesForSellerAsync(string sellerId, CancellationToken cancellationToken);

    /// <summary>For the seller list (SellerManagement): start number + article count per seller in one call instead of N+1.</summary>
    Task<IReadOnlyDictionary<string, SellerBlockSummaryDto>> GetBlockSummariesForSellersAsync(IReadOnlyCollection<string> sellerIds, CancellationToken cancellationToken);

    /// <summary>For Export.</summary>
    Task<IReadOnlyList<ExportArticleDto>> GetArticlesForExportAsync(CancellationToken cancellationToken);

    /// <summary>For the seller-facing CSV Export/Vorlage in Meine Artikel.</summary>
    Task<string> GetArticleExportCsvAsync(string sellerId, CancellationToken cancellationToken);
    Task<string> GetArticleTemplateCsvAsync(string sellerId, CancellationToken cancellationToken);

    /// <summary>For the seller-facing CSV/XLSX Import in Meine Artikel.</summary>
    Task<ImportArticlesResultDto> ImportArticlesAsync(ImportArticlesCommand command, CancellationToken cancellationToken);

    /// <summary>For Home (admin view, Host composition).</summary>
    Task<RegistrationDashboardStatsDto> GetDashboardStatsAsync(DateTime heatmapSinceUtc, CancellationToken cancellationToken);

    /// <summary>For SellerManagement: cascading delete of a seller (best effort, see SellerCascadeDeleter).</summary>
    Task DeleteAllForSellerAsync(string sellerId, CancellationToken cancellationToken);
}
