using BAR.Modules.MasterData.Contracts.MasterData;
using BAR.Modules.MasterData.Domain.Catalog;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.MasterData.Application.Catalog.Categories.Create;

public sealed class CreateCategoryCommandHandler(ICategoryRepository categories)
{
    public async Task<CategoryDto> HandleAsync(CreateCategoryCommand command, CancellationToken cancellationToken)
    {
        if (await categories.ExistsByNameCaseInsensitiveAsync(command.Name, excludeId: null, cancellationToken))
        {
            throw new ConflictException("master_data.name_taken", $"{command.Name} existiert bereits");
        }

        var category = Category.Create(command.Name, original: command.IsAdmin);
        await categories.AddAsync(category, cancellationToken);

        return new CategoryDto(category.Id, category.Name, category.Original, ArticleCount: null);
    }
}
