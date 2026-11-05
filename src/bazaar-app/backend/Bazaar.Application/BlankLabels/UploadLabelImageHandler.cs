using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.BlankLabels;

/// <summary>
/// Legt ein Bild in die Bibliothek. Inhaltsgleiche Bilder (Hash) werden nicht doppelt
/// gespeichert; das vorhandene kommt zurück. Ist die Bibliothek voll, antwortet
/// 409 <c>label_image.library_full</c>.
/// </summary>
public sealed class UploadLabelImageHandler(ILabelImageRepository repository, IIdGenerator idGenerator, TimeProvider timeProvider)
{
    public async Task<UploadLabelImageResult> Handle(UploadLabelImageCommand command)
    {
        var existing = await repository.FindByHash(LabelImage.ComputeContentHash(command.DataUrl));
        if (existing is not null) return new UploadLabelImageResult(existing, Created: false);
        if (await repository.Count() >= LabelImage.MaxCount)
        {
            throw new ConflictException("Bibliothek voll", LabelImage.LibraryFullErrorCode);
        }
        var image = LabelImage.Create(idGenerator.Generate(), command.Name, command.DataUrl, timeProvider.GetUtcNow());
        var stored = await repository.Add(image);
        return new UploadLabelImageResult(stored, Created: ReferenceEquals(stored, image));
    }
}
