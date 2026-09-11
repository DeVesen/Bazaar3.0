using BAR.Modules.Stammdaten.Contracts.MasterData;
using BAR.Modules.Stammdaten.Domain.MasterData;
using BAR.Modules.Stammdaten.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Stammdaten.Application.MasterData.Brands.Create;

public sealed class CreateBrandCommandHandler(IBrandRepository brands)
{
    public async Task<BrandDto> HandleAsync(CreateBrandCommand command, CancellationToken cancellationToken)
    {
        if (await brands.ExistsByNameCaseInsensitiveAsync(command.Name, excludeId: null, cancellationToken))
        {
            throw new ConflictException("master_data.name_taken", $"{command.Name} existiert bereits");
        }

        var brand = Brand.Create(command.Name, original: command.IsAdmin);
        await brands.AddAsync(brand, cancellationToken);

        return new BrandDto(brand.Id, brand.Name, brand.Original, ArticleCount: null);
    }
}
