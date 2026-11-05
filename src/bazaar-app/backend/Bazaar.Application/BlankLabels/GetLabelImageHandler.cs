using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.BlankLabels;

public sealed class GetLabelImageHandler(ILabelImageRepository repository)
{
    public async Task<LabelImage> Handle(string id) =>
        await repository.GetById(id)
            ?? throw new NotFoundException("Bild nicht gefunden", LabelImage.NotFoundErrorCode);
}
