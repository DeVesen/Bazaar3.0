using Bazaar.Domain.BlankLabels;

namespace Bazaar.Domain.Ports;

public interface ILabelSheetFormatRepository
{
    Task<IReadOnlyList<LabelSheetFormat>> GetAll();

    Task<LabelSheetFormat?> GetById(string id);

    /// <summary>Exakter Vergleich, Groß-/Kleinschreibung zählt (gleicher Name = gleiches Format).</summary>
    Task<LabelSheetFormat?> FindByName(string name);

    /// <summary>
    /// Wirft <c>ConflictException</c> mit <see cref="LabelSheetFormat.NameTakenErrorCode"/>, wenn ein
    /// anderer Admin den Namen zwischen Prüfung und Speichern vergeben hat.
    /// </summary>
    Task Add(LabelSheetFormat format);

    Task Update(LabelSheetFormat format);

    Task Remove(LabelSheetFormat format);
}
