using Bazaar.Domain.Ports;

namespace Bazaar.Application.Brands;

public sealed record BrandListItem(string Id, string Name, bool Original, int ArticleCount);

public sealed class GetBrandsHandler(IBrandRepository brandRepository, IBrandArticleLink brandArticleLink)
{
    public async Task<IReadOnlyList<BrandListItem>> Handle()
    {
        var brands = await brandRepository.GetAll();
        var items = new List<BrandListItem>();
        foreach (var brand in brands.OrderBy(b => b.Name, StringComparer.OrdinalIgnoreCase))
        {
            var count = await brandArticleLink.CountByBrandName(brand.Name);
            items.Add(new BrandListItem(brand.Id, brand.Name, brand.Original, count));
        }
        return items;
    }
}
