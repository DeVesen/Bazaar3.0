using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.BlankLabels;

public sealed class GetLabelPrintDefaultsHandler(ILabelPrintDefaultsRepository repository)
{
    /// <summary>Ohne gespeicherte Zeile gelten „€", leeres Logo/Symbol und die Vorgabegrößen (erstes Öffnen).</summary>
    public async Task<LabelPrintDefaults> Handle() =>
        await repository.Find() ?? LabelPrintDefaults.CreateInitial();
}
