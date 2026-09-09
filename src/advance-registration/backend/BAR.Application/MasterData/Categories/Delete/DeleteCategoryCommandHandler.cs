using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.MasterData.Categories.Delete;

public sealed class DeleteCategoryCommandHandler(ICategoryRepository categories)
{
    public async Task HandleAsync(string id, CancellationToken cancellationToken)
    {
        var category = await categories.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("master_data.not_found", "Kategorie wurde nicht gefunden");

        var count = await categories.CountArticlesWithNameAsync(category.Name, cancellationToken);
        if (count > 0)
        {
            throw new ConflictException("category.in_use", "Kategorie wird noch verwendet");
        }

        await categories.DeleteAsync(category, cancellationToken);
    }
}
