using BAR.Modules.Stammdaten.Contracts.MasterData;
using BAR.Modules.Stammdaten.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Stammdaten.Application.MasterData.Brands.Update;

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

        // Brand.Rename sammelt bei tatsaechlicher Namensaenderung ein BrandRenamed-
        // Event, das StammdatenDbContext beim SaveChanges dispatcht - keine
        // Cascade-SQL mehr hier (Anmeldung haelt eine eigene Namenskopie).
        brand.Rename(command.Name, command.Original);
        await brands.UpdateAsync(brand, cancellationToken);

        return new BrandDto(brand.Id, brand.Name, brand.Original, ArticleCount: null);
    }
}
