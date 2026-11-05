using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.BlankLabels;

public sealed class UpdateLabelPrintDefaultsHandler(ILabelPrintDefaultsRepository repository)
{
    public async Task Handle(UpdateLabelPrintDefaultsCommand command)
    {
        var existing = await repository.Find();
        if (existing is null)
        {
            await AddInitial(command);
            return;
        }
        Apply(existing, command);
        await repository.Update(existing);
    }

    private async Task AddInitial(UpdateLabelPrintDefaultsCommand command)
    {
        var defaults = LabelPrintDefaults.CreateInitial();
        Apply(defaults, command);
        await repository.Add(defaults);
    }

    private static void Apply(LabelPrintDefaults defaults, UpdateLabelPrintDefaultsCommand command) =>
        defaults.Update(
            command.Logo,
            command.SellerSymbol,
            command.CurrencySymbol,
            command.Sizes!);
}
