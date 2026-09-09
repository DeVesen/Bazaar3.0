using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.MasterData.Categories.Update;

public sealed class UpdateCategoryCommandHandler(ICategoryRepository categories)
{
    public async Task<CategoryResult> HandleAsync(UpdateCategoryCommand command, CancellationToken cancellationToken)
    {
        var category = await categories.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException("master_data.not_found", "Kategorie wurde nicht gefunden");

        if (await categories.ExistsByNameCaseInsensitiveAsync(command.Name, command.Id, cancellationToken))
        {
            throw new ConflictException("master_data.name_taken", $"{command.Name} existiert bereits");
        }

        var oldName = category.Name;
        category.Rename(command.Name, command.Original);
        await categories.UpdateAsync(category, oldName == command.Name ? null : oldName, cancellationToken);

        return new CategoryResult(category.Id, category.Name, category.Original, ArticleCount: null);
    }
}
