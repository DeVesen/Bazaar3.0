using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.MasterData.Brands.Delete;

public sealed class DeleteBrandCommandHandler(IBrandRepository brands)
{
    public async Task HandleAsync(string id, CancellationToken cancellationToken)
    {
        var brand = await brands.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("master_data.not_found", "Marke wurde nicht gefunden");

        var count = await brands.CountArticlesWithNameAsync(brand.Name, cancellationToken);
        if (count > 0)
        {
            throw new ConflictException("brand.in_use", "Marke wird noch verwendet");
        }

        await brands.DeleteAsync(brand, cancellationToken);
    }
}
