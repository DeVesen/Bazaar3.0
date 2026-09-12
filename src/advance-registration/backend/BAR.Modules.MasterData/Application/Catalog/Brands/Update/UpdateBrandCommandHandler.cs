using BAR.Modules.MasterData.Contracts.MasterData;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.MasterData.Application.Catalog.Brands.Update;

public sealed class UpdateBrandCommandHandler(IBrandRepository brands)
{
    public async Task<BrandDto> HandleAsync(string id, UpdateBrandCommand command, CancellationToken cancellationToken)
    {
        var brand = await brands.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("master_data.not_found", "Marke wurde nicht gefunden");

        if (await brands.ExistsByNameCaseInsensitiveAsync(command.Name, id, cancellationToken))
        {
            throw new ConflictException("master_data.name_taken", $"{command.Name} existiert bereits");
        }

        // When the name actually changes, Brand.Rename raises a BrandRenamed
        // event that MasterDataDbContext dispatches on SaveChanges - no more
        // cascade SQL here (Registration keeps its own copy of the name).
        brand.Rename(command.Name, command.Original);
        await brands.UpdateAsync(brand, cancellationToken);

        return new BrandDto(brand.Id, brand.Name, brand.Original, ArticleCount: null);
    }
}
