using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Betrieb.Application.Settings.GetSettings;
using BAR.Modules.Betrieb.Contracts;
using BAR.Modules.Betrieb.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Betrieb.Application.Settings.Update;

public sealed class UpdateSettingsCommandHandler(ISettingsRepository settingsRepository, IAnmeldungModuleApi anmeldung)
{
    public async Task<SettingsDto> HandleAsync(UpdateSettingsCommand command, CancellationToken cancellationToken)
    {
        // Article lebt im Modul Anmeldung (eigenes Schema) - die Pruefung
        // "keine bestehende Artikelnummer unterhalb der neuen Startnummer" ist
        // ein Contracts-Aufruf, keine lokale Abfrage mehr.
        if (await anmeldung.ExistsArticleNumberBelowAsync(command.StartNumber, cancellationToken))
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
