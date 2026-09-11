using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Stammdaten.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Stammdaten.Application.MasterData.Brands.Delete;

public sealed class DeleteBrandCommandHandler(IBrandRepository brands, IAnmeldungModuleApi anmeldung)
{
    public async Task HandleAsync(string id, CancellationToken cancellationToken)
    {
        var brand = await brands.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("master_data.not_found", "Marke wurde nicht gefunden");

        // Article lebt im Modul Anmeldung (eigenes Schema) - die In-Use-Pruefung
        // ist ein Contracts-Aufruf, keine lokale Abfrage mehr.
        var count = await anmeldung.CountArticlesWithBrandNameAsync(brand.Name, cancellationToken);
        if (count > 0)
        {
            throw new ConflictException("brand.in_use", "Marke wird noch verwendet");
        }

        await brands.DeleteAsync(brand, cancellationToken);
    }
}
