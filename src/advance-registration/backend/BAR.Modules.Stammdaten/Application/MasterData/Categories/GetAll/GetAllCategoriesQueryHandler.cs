using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Stammdaten.Contracts.MasterData;
using BAR.Modules.Stammdaten.Domain.Ports;

namespace BAR.Modules.Stammdaten.Application.MasterData.Categories.GetAll;

public sealed class GetAllCategoriesQueryHandler(ICategoryRepository categories, IAnmeldungModuleApi anmeldung)
{
    public async Task<IReadOnlyList<CategoryDto>> HandleAsync(bool isAdmin, CancellationToken cancellationToken)
    {
        var all = await categories.GetAllAsync(cancellationToken);
        var result = new List<CategoryDto>(all.Count);

        foreach (var category in all)
        {
            int? count = isAdmin ? await anmeldung.CountArticlesWithCategoryNameAsync(category.Name, cancellationToken) : null;
            result.Add(new CategoryDto(category.Id, category.Name, category.Original, count));
        }

        return result;
    }
}
