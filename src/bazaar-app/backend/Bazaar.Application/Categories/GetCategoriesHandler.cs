using Bazaar.Domain.Ports;

namespace Bazaar.Application.Categories;

public sealed record CategoryListItem(string Id, string Name, bool Original, int ArticleCount);

public sealed class GetCategoriesHandler(ICategoryRepository categoryRepository, ICategoryArticleLink categoryArticleLink)
{
    public async Task<IReadOnlyList<CategoryListItem>> Handle()
    {
        var categories = await categoryRepository.GetAll();
        var items = new List<CategoryListItem>();
        foreach (var category in categories.OrderBy(c => c.Name, StringComparer.OrdinalIgnoreCase))
        {
            var count = await categoryArticleLink.CountByCategoryName(category.Name);
            items.Add(new CategoryListItem(category.Id, category.Name, category.Original, count));
        }
        return items;
    }
}
