using Bazaar.Domain.BlankLabels;

namespace Bazaar.Domain.Ports;

public interface ILabelImageRepository
{
    /// <summary>Alle Einträge ohne Data-URL, neueste zuerst.</summary>
    Task<IReadOnlyList<LabelImageSummary>> GetSummaries();

    Task<LabelImage?> GetById(string id);

    Task<LabelImage?> FindByHash(string contentHash);

    Task<int> Count();

    /// <summary>
    /// Speichert das Bild und gibt es zurück. Hat ein paralleler Upload denselben Inhalt
    /// (<see cref="LabelImage.ContentHash"/>) zwischen Prüfung und Speichern abgelegt, kommt
    /// stattdessen das vorhandene Bild zurück.
    /// </summary>
    Task<LabelImage> Add(LabelImage image);

    Task Remove(LabelImage image);
}
