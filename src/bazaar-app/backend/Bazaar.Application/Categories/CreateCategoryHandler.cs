using Bazaar.Domain.Categories;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Categories;

public sealed class CreateCategoryHandler(ICategoryRepository categoryRepository, IIdGenerator idGenerator)
{
    public async Task<Category> Handle(CreateCategoryCommand command)
    {
        var trimmedName = command.Name.Trim();
        if (await categoryRepository.ExistsByNameIgnoreCase(trimmedName))
        {
            throw new ConflictException("Kategorie existiert bereits", "category.name_taken");
        }

        var category = Category.Create(idGenerator.Generate(), trimmedName, command.Original);
        await categoryRepository.Add(category);
        return category;
    }
}
