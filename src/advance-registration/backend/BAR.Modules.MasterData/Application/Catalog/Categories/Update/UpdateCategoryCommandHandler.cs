using BAR.Modules.MasterData.Contracts.MasterData;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.MasterData.Application.Catalog.Categories.Update;

public sealed class UpdateCategoryCommandHandler(ICategoryRepository categories)
{
    public async Task<CategoryDto> HandleAsync(string id, UpdateCategoryCommand command, CancellationToken cancellationToken)
    {
        var category = await categories.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("master_data.not_found", "Kategorie wurde nicht gefunden");

        if (await categories.ExistsByNameCaseInsensitiveAsync(command.Name, id, cancellationToken))
        {
            throw new ConflictException("master_data.name_taken", $"{command.Name} existiert bereits");
        }

        category.Rename(command.Name, command.Original);
        await categories.UpdateAsync(category, cancellationToken);

        return new CategoryDto(category.Id, category.Name, category.Original, ArticleCount: null);
    }
}
