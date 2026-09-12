using BAR.Modules.Registration.Contracts;
using BAR.Modules.Operations.Application.Settings.GetSettings;
using BAR.Modules.Operations.Contracts;
using BAR.Modules.Operations.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Operations.Application.Settings.Update;

public sealed class UpdateSettingsCommandHandler(ISettingsRepository settingsRepository, IRegistrationModuleApi registration)
{
    public async Task<SettingsDto> HandleAsync(UpdateSettingsCommand command, CancellationToken cancellationToken)
    {
        // Article lives in the Registration module (its own schema) - the check
        // "no existing article number below the new start number" is now a
        // Contracts call, no longer a local query.
        if (await registration.ExistsArticleNumberBelowAsync(command.StartNumber, cancellationToken))
        {
            throw new ConflictException("settings.start_number_conflict", "Startnummer liegt über bereits vergebenen Artikelnummern");
        }

        var existing = await settingsRepository.GetAsync(cancellationToken);
        Domain.Settings settings;
        if (existing is null)
        {
            settings = Domain.Settings.Create(
                command.RegistrationDeadline, command.DropOffFrom, command.DropOffUntil,
                command.BazaarFrom, command.BazaarUntil, command.DefaultTypeId, command.InfoText,
                command.StartNumber, command.BlockSize, command.DefaultBlockCount);
        }
        else
        {
            existing.Update(
                command.RegistrationDeadline, command.DropOffFrom, command.DropOffUntil,
                command.BazaarFrom, command.BazaarUntil, command.DefaultTypeId, command.InfoText,
                command.StartNumber, command.BlockSize, command.DefaultBlockCount);
            settings = existing;
        }

        await settingsRepository.SaveAsync(settings, cancellationToken);

        return GetSettingsQueryHandler.Map(settings);
    }
}
