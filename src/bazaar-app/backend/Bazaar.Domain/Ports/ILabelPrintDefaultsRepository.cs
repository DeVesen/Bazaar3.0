using Bazaar.Domain.BlankLabels;

namespace Bazaar.Domain.Ports;

public interface ILabelPrintDefaultsRepository
{
    /// <summary>Die eine Zeile mit den gemerkten Werten; <c>null</c>, solange noch nie gedruckt wurde.</summary>
    Task<LabelPrintDefaults?> Find();

    Task Add(LabelPrintDefaults defaults);

    Task Update(LabelPrintDefaults defaults);
}
