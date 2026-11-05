using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.BlankLabels;

public sealed class GetLabelImagesHandler(ILabelImageRepository repository)
{
    /// <summary>Neueste zuerst, ohne Bildinhalt.</summary>
    public Task<IReadOnlyList<LabelImageSummary>> Handle() => repository.GetSummaries();
}
