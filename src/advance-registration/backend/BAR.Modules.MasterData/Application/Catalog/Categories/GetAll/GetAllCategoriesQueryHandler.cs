using BAR.Modules.Registration.Contracts;
using BAR.Modules.MasterData.Contracts.MasterData;
using BAR.Modules.MasterData.Domain.Ports;

namespace BAR.Modules.MasterData.Application.Catalog.Categories.GetAll;

public sealed class GetAllCategoriesQueryHandler(ICategoryRepository categories, IRegistrationModuleApi registration)
{
    public async Task<IReadOnlyList<CategoryDto>> HandleAsync(bool isAdmin, CancellationToken cancellationToken)
    {
        var all = await categories.GetAllAsync(cancellationToken);
        var result = new List<CategoryDto>(all.Count);

        foreach (var category in all)
        {
            int? count = isAdmin ? await registration.CountArticlesWithCategoryNameAsync(category.Name, cancellationToken) : null;
            result.Add(new CategoryDto(category.Id, category.Name, category.Original, count));
        }

        return result;
    }
}
