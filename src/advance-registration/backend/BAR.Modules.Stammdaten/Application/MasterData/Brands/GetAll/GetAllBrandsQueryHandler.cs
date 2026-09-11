using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Stammdaten.Contracts.MasterData;
using BAR.Modules.Stammdaten.Domain.Ports;

namespace BAR.Modules.Stammdaten.Application.MasterData.Brands.GetAll;

public sealed class GetAllBrandsQueryHandler(IBrandRepository brands, IAnmeldungModuleApi anmeldung)
{
    public async Task<IReadOnlyList<BrandDto>> HandleAsync(bool isAdmin, CancellationToken cancellationToken)
    {
        var all = await brands.GetAllAsync(cancellationToken);
        var result = new List<BrandDto>(all.Count);

        foreach (var brand in all)
        {
            int? count = isAdmin ? await anmeldung.CountArticlesWithBrandNameAsync(brand.Name, cancellationToken) : null;
            result.Add(new BrandDto(brand.Id, brand.Name, brand.Original, count));
        }

        return result;
    }
}
