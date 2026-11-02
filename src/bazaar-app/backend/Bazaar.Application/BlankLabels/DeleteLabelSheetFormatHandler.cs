using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.BlankLabels;

public sealed class DeleteLabelSheetFormatHandler(ILabelSheetFormatRepository repository)
{
    public async Task Handle(string id)
    {
        var format = await repository.GetById(id)
            ?? throw new NotFoundException("Bogenformat nicht gefunden", LabelSheetFormat.NotFoundErrorCode);
        await repository.Remove(format);
    }
}
