using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.MasterData.Brands.Update;

public sealed class UpdateBrandCommandHandler(IBrandRepository brands)
{
    public async Task<BrandResult> HandleAsync(UpdateBrandCommand command, CancellationToken cancellationToken)
    {
        var brand = await brands.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new NotFoundException("master_data.not_found", "Marke wurde nicht gefunden");

        if (await brands.ExistsByNameCaseInsensitiveAsync(command.Name, command.Id, cancellationToken))
        {
            throw new ConflictException("master_data.name_taken", $"{command.Name} existiert bereits");
        }

        var oldName = brand.Name;
        brand.Rename(command.Name, command.Original);
        await brands.UpdateAsync(brand, oldName == command.Name ? null : oldName, cancellationToken);

        return new BrandResult(brand.Id, brand.Name, brand.Original, ArticleCount: null);
    }
}
