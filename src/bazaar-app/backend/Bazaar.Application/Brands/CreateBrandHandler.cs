using Bazaar.Domain.Brands;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Brands;

public sealed class CreateBrandHandler(IBrandRepository brandRepository, IIdGenerator idGenerator)
{
    public async Task<Brand> Handle(CreateBrandCommand command)
    {
        var trimmedName = command.Name.Trim();
        if (await brandRepository.ExistsByNameIgnoreCase(trimmedName))
        {
            throw new ConflictException("Marke bereits vergeben", "brand.name_taken");
        }

        var brand = Brand.Create(idGenerator.Generate(), trimmedName, command.Original);
        await brandRepository.Add(brand);
        return brand;
    }
}
