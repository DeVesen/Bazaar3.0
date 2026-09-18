using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Brands;

public sealed class UpdateBrandHandler(IBrandRepository brandRepository, IBrandArticleLink brandArticleLink)
{
    public async Task Handle(UpdateBrandCommand command)
    {
        var brand = await brandRepository.GetById(command.Id)
            ?? throw new NotFoundException("Marke nicht gefunden", "brand.not_found");

        var trimmedName = command.Name.Trim();
        var oldName = brand.Name;

        if (!string.Equals(oldName, trimmedName, StringComparison.OrdinalIgnoreCase)
            && await brandRepository.ExistsByNameIgnoreCase(trimmedName))
        {
            throw new ConflictException("Marke existiert bereits", "brand.name_taken");
        }

        brand.Rename(trimmedName);
        brand.SetOriginal(command.Original);

        if (!string.Equals(oldName, trimmedName, StringComparison.OrdinalIgnoreCase))
        {
            await brandArticleLink.RenameArticlesReferencingBrand(oldName, trimmedName);
        }

        await brandRepository.Update(brand);
    }
}
