using BAR.Domain.Ports;

namespace BAR.Application.MasterData.Brands.GetAll;

public sealed class GetAllBrandsQueryHandler(IBrandRepository brands)
{
    public async Task<IReadOnlyList<BrandResult>> HandleAsync(bool isAdmin, CancellationToken cancellationToken)
    {
        var all = await brands.GetAllAsync(cancellationToken);
        var result = new List<BrandResult>(all.Count);

        foreach (var brand in all)
        {
            int? count = isAdmin ? await brands.CountArticlesWithNameAsync(brand.Name, cancellationToken) : null;
            result.Add(new BrandResult(brand.Id, brand.Name, brand.Original, count));
        }

        return result;
    }
}
