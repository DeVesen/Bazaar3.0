using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Brands;

public sealed class DeleteBrandHandler(IBrandRepository brandRepository, IBrandArticleLink brandArticleLink)
{
    public async Task Handle(string id)
    {
        var brand = await brandRepository.GetById(id)
            ?? throw new NotFoundException("Marke nicht gefunden", "brand.not_found");

        var articleCount = await brandArticleLink.CountByBrandName(brand.Name);
        if (articleCount > 0)
        {
            throw new ConflictException("Marke wird noch verwendet", "brand.in_use");
        }

        await brandRepository.Remove(brand);
    }
}
