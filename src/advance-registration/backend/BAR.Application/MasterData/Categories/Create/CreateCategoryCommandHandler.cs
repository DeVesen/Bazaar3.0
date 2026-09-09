using BAR.Domain.Exceptions;
using BAR.Domain.MasterData;
using BAR.Domain.Ports;

namespace BAR.Application.MasterData.Categories.Create;

public sealed class CreateCategoryCommandHandler(ICategoryRepository categories)
{
    public async Task<CategoryResult> HandleAsync(CreateCategoryCommand command, CancellationToken cancellationToken)
    {
        if (await categories.ExistsByNameCaseInsensitiveAsync(command.Name, excludeId: null, cancellationToken))
        {
            throw new ConflictException("master_data.name_taken", $"{command.Name} existiert bereits");
        }

        var category = Category.Create(command.Name, original: command.IsAdmin);
        await categories.AddAsync(category, cancellationToken);

        return new CategoryResult(category.Id, category.Name, category.Original, ArticleCount: null);
    }
}
