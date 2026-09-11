using BAR.Modules.Anmeldung.Domain.Articles;
using BAR.Modules.Anmeldung.Domain.NumberBlocks;

namespace BAR.Modules.Anmeldung.Domain.Ports;

public interface IArticleRepository
{
    Task<Article?> GetByIdAsync(string id, CancellationToken cancellationToken);
    Task<IReadOnlyList<int>> GetUsedNumbersForSellerAsync(string sellerId, CancellationToken cancellationToken);
    Task<int> CountInRangeForSellerAsync(string sellerId, int fromNumber, int toNumber, CancellationToken cancellationToken);
    Task<int> CountForSellerAsync(string sellerId, CancellationToken cancellationToken);
    Task<bool> ExistsNumberBelowAsync(int number, CancellationToken cancellationToken);
    Task<int> CountWithBrandNameAsync(string brandName, CancellationToken cancellationToken);
    Task<int> CountWithCategoryNameAsync(string categoryName, CancellationToken cancellationToken);
    Task RenameBrandAsync(string oldName, string newName, CancellationToken cancellationToken);
    Task RenameCategoryAsync(string oldName, string newName, CancellationToken cancellationToken);
    Task<IReadOnlyList<Article>> GetAllForExportAsync(CancellationToken cancellationToken);
    Task CreateAsync(Article article, NumberBlock? newBlock, CancellationToken cancellationToken);
    Task UpdateAsync(Article article, CancellationToken cancellationToken);
    Task DeleteAsync(Article article, CancellationToken cancellationToken);
    Task DeleteAllForSellerAsync(string sellerId, CancellationToken cancellationToken);
}
