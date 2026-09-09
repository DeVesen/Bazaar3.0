using BAR.Domain.Ports;

namespace BAR.Application.MasterData.Categories.GetAll;

public sealed class GetAllCategoriesQueryHandler(ICategoryRepository categories)
{
    public async Task<IReadOnlyList<CategoryResult>> HandleAsync(bool isAdmin, CancellationToken cancellationToken)
    {
        var all = await categories.GetAllAsync(cancellationToken);
        var result = new List<CategoryResult>(all.Count);

        foreach (var category in all)
        {
            int? count = isAdmin ? await categories.CountArticlesWithNameAsync(category.Name, cancellationToken) : null;
            result.Add(new CategoryResult(category.Id, category.Name, category.Original, count));
        }

        return result;
    }
}
