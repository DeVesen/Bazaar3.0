using BAR.Modules.Registration.Contracts;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.MasterData.Application.Catalog.Brands.Delete;

public sealed class DeleteBrandCommandHandler(IBrandRepository brands, IRegistrationModuleApi registration)
{
    public async Task HandleAsync(string id, CancellationToken cancellationToken)
    {
        var brand = await brands.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("master_data.not_found", "Marke wurde nicht gefunden");

        // Article lives in the Registration module (its own schema) - the in-use
        // check is now a Contracts call, no longer a local query.
        var count = await registration.CountArticlesWithBrandNameAsync(brand.Name, cancellationToken);
        if (count > 0)
        {
            throw new ConflictException("brand.in_use", "Marke wird noch verwendet");
        }

        await brands.DeleteAsync(brand, cancellationToken);
    }
}
