using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Categories;

public sealed class DeleteCategoryHandler(ICategoryRepository categoryRepository, ICategoryArticleLink categoryArticleLink)
{
    public async Task Handle(string id)
    {
        var category = await categoryRepository.GetById(id)
            ?? throw new NotFoundException("Kategorie nicht gefunden", "category.not_found");

        var articleCount = await categoryArticleLink.CountByCategoryName(category.Name);
        if (articleCount > 0)
        {
            throw new ConflictException("Kategorie wird noch verwendet", "category.in_use");
        }

        await categoryRepository.Remove(category);
    }
}
