using BAR.Modules.Registration.Contracts.Articles;
using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.Registration.Domain.Ports.Queries;
using BAR.Modules.SellerManagement.Contracts;

namespace BAR.Modules.Registration.Application.Articles.GetAll;

public sealed class GetAllArticlesQueryHandler(
    IArticleQueries queries, INumberBlockRepository blocks, ISellerManagementModuleApi sellerManagement)
{
    public async Task<AdminArticleListResultDto> HandleAsync(GetAllArticlesQuery query, CancellationToken cancellationToken)
    {
        IReadOnlyCollection<string>? nameMatchSellerIds = null;
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            nameMatchSellerIds = await sellerManagement.FindSellerIdsByNameAsync(query.Search, cancellationToken);
        }

        var page = await queries.SearchAllAsync(
            query.Brand, query.Category, query.Search, query.SellerId, nameMatchSellerIds,
            query.Page, query.PageSize, query.Sort, cancellationToken);

        var sellerIds = page.Items.Select(a => a.SellerId).Distinct().ToList();
        var startNumbers = await GetStartNumbersAsync(sellerIds, cancellationToken);
        var names = await sellerManagement.GetSellerNamesAsync(sellerIds, cancellationToken);

        var items = page.Items.Select(a =>
        {
            var name = names.GetValueOrDefault(a.SellerId);
            var summary = new SellerSummaryDto(
                a.SellerId, startNumbers.GetValueOrDefault(a.SellerId), name?.FirstName ?? "?", name?.LastName ?? "?");

            return new AdminArticleDto(
                a.Id, a.Number, a.Name, a.Brand, a.Category, a.Price,
                a.Size, a.Color, a.Description, a.CreatedAt, a.UpdatedAt, summary);
        }).ToList();

        return new AdminArticleListResultDto(items, page.TotalCount, query.Page, query.PageSize);
    }

    private async Task<IReadOnlyDictionary<string, int>> GetStartNumbersAsync(IReadOnlyList<string> sellerIds, CancellationToken cancellationToken)
    {
        var result = new Dictionary<string, int>();
        foreach (var sellerId in sellerIds)
        {
            var sellerBlocks = await blocks.GetForSellerAsync(sellerId, cancellationToken);
            if (sellerBlocks.Count > 0)
            {
                result[sellerId] = sellerBlocks.Min(b => b.FromNumber);
            }
        }

        return result;
    }
}
