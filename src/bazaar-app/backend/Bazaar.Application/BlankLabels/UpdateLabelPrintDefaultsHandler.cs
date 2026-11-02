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
        existing.Update(command.Logo, command.SellerSymbol, command.CurrencySymbol);
        await repository.Update(existing);
    }

    private async Task AddInitial(UpdateLabelPrintDefaultsCommand command)
    {
        var defaults = LabelPrintDefaults.CreateInitial();
        defaults.Update(command.Logo, command.SellerSymbol, command.CurrencySymbol);
        await repository.Add(defaults);
    }
}
