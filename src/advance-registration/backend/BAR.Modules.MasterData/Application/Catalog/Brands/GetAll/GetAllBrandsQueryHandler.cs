using BAR.Modules.Registration.Contracts;
using BAR.Modules.MasterData.Contracts.MasterData;
using BAR.Modules.MasterData.Domain.Ports;

namespace BAR.Modules.MasterData.Application.Catalog.Brands.GetAll;

public sealed class GetAllBrandsQueryHandler(IBrandRepository brands, IRegistrationModuleApi registration)
{
    public async Task<IReadOnlyList<BrandDto>> HandleAsync(bool isAdmin, CancellationToken cancellationToken)
    {
        var all = await brands.GetAllAsync(cancellationToken);
        var result = new List<BrandDto>(all.Count);

        foreach (var brand in all)
        {
            int? count = isAdmin ? await registration.CountArticlesWithBrandNameAsync(brand.Name, cancellationToken) : null;
            result.Add(new BrandDto(brand.Id, brand.Name, brand.Original, count));
        }

        return result;
    }
}
