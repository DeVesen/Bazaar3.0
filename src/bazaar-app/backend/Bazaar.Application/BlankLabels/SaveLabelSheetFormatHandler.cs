using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.BlankLabels;

/// <summary>
/// Legt ein Bogenformat an oder ersetzt eines mit exakt gleichem Namen. Ohne
/// <c>Overwrite</c> antwortet ein vergebener Name mit 409 <c>label_sheet_format.name_taken</c>,
/// auch wenn ein anderer Admin ihn inzwischen gespeichert hat; die Seite fragt dann „Überschreiben?".
/// </summary>
public sealed class SaveLabelSheetFormatHandler(ILabelSheetFormatRepository repository, IIdGenerator idGenerator)
{
    public async Task<LabelSheetFormat> Handle(SaveLabelSheetFormatCommand command)
    {
        var name = LabelSheetFormat.NormalizeName(command.Name);
        var existing = await repository.FindByName(name);
        if (existing is null) return await AddNew(name, command.ToGeometry());
        if (!command.Overwrite) throw new ConflictException("Bogenformat existiert bereits", LabelSheetFormat.NameTakenErrorCode);
        return await Overwrite(existing, command.ToGeometry());
    }

    private async Task<LabelSheetFormat> AddNew(string name, LabelSheetGeometry geometry)
    {
        var format = LabelSheetFormat.Create(idGenerator.Generate(), name, geometry);
        await repository.Add(format);
        return format;
    }

    private async Task<LabelSheetFormat> Overwrite(LabelSheetFormat existing, LabelSheetGeometry geometry)
    {
        existing.ReplaceGeometry(geometry);
        await repository.Update(existing);
        return existing;
    }
}
