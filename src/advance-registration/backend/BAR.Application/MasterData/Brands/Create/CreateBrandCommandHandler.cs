using BAR.Domain.Exceptions;
using BAR.Domain.MasterData;
using BAR.Domain.Ports;

namespace BAR.Application.MasterData.Brands.Create;

public sealed class CreateBrandCommandHandler(IBrandRepository brands)
{
    public async Task<BrandResult> HandleAsync(CreateBrandCommand command, CancellationToken cancellationToken)
    {
        if (await brands.ExistsByNameCaseInsensitiveAsync(command.Name, excludeId: null, cancellationToken))
        {
            throw new ConflictException("master_data.name_taken", $"{command.Name} existiert bereits");
        }

        var brand = Brand.Create(command.Name, original: command.IsAdmin);
        await brands.AddAsync(brand, cancellationToken);

        return new BrandResult(brand.Id, brand.Name, brand.Original, ArticleCount: null);
    }
}
