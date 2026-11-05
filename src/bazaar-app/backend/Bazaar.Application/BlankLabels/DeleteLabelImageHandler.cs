using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.BlankLabels;

/// <summary>Löscht nur den Bibliothekseintrag; bereits gewählte Logos/Symbole sind Kopien und bleiben.</summary>
public sealed class DeleteLabelImageHandler(ILabelImageRepository repository)
{
    public async Task Handle(string id)
    {
        var image = await repository.GetById(id)
            ?? throw new NotFoundException("Bild nicht gefunden", LabelImage.NotFoundErrorCode);
        await repository.Remove(image);
    }
}
