using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Categories;

public sealed class UpdateCategoryHandler(ICategoryRepository categoryRepository, ICategoryArticleLink categoryArticleLink)
{
    public async Task Handle(UpdateCategoryCommand command)
    {
        var category = await categoryRepository.GetById(command.Id)
            ?? throw new NotFoundException("Kategorie nicht gefunden", "category.not_found");

        var trimmedName = command.Name.Trim();
        var oldName = category.Name;

        if (!string.Equals(oldName, trimmedName, StringComparison.OrdinalIgnoreCase)
            && await categoryRepository.ExistsByNameIgnoreCase(trimmedName))
        {
            throw new ConflictException("Kategorie existiert bereits", "category.name_taken");
        }

        category.Rename(trimmedName);
        category.SetOriginal(command.Original);

        if (!string.Equals(oldName, trimmedName, StringComparison.OrdinalIgnoreCase))
        {
            await categoryArticleLink.RenameArticlesReferencingCategory(oldName, trimmedName);
        }

        await categoryRepository.Update(category);
    }
}
