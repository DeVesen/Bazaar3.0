using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.BlankLabels;

public sealed class GetLabelSheetFormatsHandler(ILabelSheetFormatRepository repository)
{
    public async Task<IReadOnlyList<LabelSheetFormat>> Handle()
    {
        var formats = await repository.GetAll();
        return formats.OrderBy(f => f.Name, StringComparer.OrdinalIgnoreCase).ToList();
    }
}
