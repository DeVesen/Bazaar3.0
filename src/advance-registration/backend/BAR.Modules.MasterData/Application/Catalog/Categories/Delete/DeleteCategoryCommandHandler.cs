using BAR.Modules.Registration.Contracts;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.MasterData.Application.Catalog.Categories.Delete;

public sealed class DeleteCategoryCommandHandler(ICategoryRepository categories, IRegistrationModuleApi registration)
{
    public async Task HandleAsync(string id, CancellationToken cancellationToken)
    {
        var category = await categories.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("master_data.not_found", "Kategorie wurde nicht gefunden");

        var count = await registration.CountArticlesWithCategoryNameAsync(category.Name, cancellationToken);
        if (count > 0)
        {
            throw new ConflictException("category.in_use", "Kategorie wird noch verwendet");
        }

        await categories.DeleteAsync(category, cancellationToken);
    }
}
