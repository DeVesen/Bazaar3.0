using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Settings.Update;

public sealed class UpdateSettingsCommandHandler(ISettingsRepository settingsRepository, IArticleRepository articles)
{
    public async Task<SettingsResult> HandleAsync(UpdateSettingsCommand command, CancellationToken cancellationToken)
    {
        if (await articles.ExistsNumberBelowAsync(command.StartNumber, cancellationToken))
        {
            throw new ConflictException("settings.start_number_conflict", "Startnummer liegt über bereits vergebenen Artikelnummern");
        }

        var existing = await settingsRepository.GetAsync(cancellationToken);
        Domain.Settings.Settings settings;
        if (existing is null)
        {
            settings = Domain.Settings.Settings.Create(
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

        return new SettingsResult(
            settings.RegistrationDeadline, settings.DropOffFrom, settings.DropOffUntil,
            settings.BazaarFrom, settings.BazaarUntil, settings.DefaultTypeId, settings.InfoText,
            settings.StartNumber, settings.BlockSize, settings.DefaultBlockCount);
    }
}
