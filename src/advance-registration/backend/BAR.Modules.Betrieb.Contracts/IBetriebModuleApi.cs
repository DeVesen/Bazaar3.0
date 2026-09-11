namespace BAR.Modules.Betrieb.Contracts;

public interface IBetriebModuleApi
{
    Task<SettingsDto?> GetSettingsAsync(CancellationToken cancellationToken);
    Task<SettingsDto> UpdateSettingsAsync(UpdateSettingsCommand command, CancellationToken cancellationToken);

    /// <summary>Anonym, komponiert intern mit Stammdaten (Konditionen des Default-Typs).</summary>
    Task<PublicInfoDto> GetPublicInfoAsync(CancellationToken cancellationToken);

    /// <summary>Fuer Anmeldung: Nummernkreis-Parameter fuer die Blockvergabe.</summary>
    Task<NumberingConfigDto> GetNumberingConfigAsync(CancellationToken cancellationToken);

    /// <summary>Fuer Home (Host-Komposition).</summary>
    Task<BazaarScheduleDto?> GetBazaarScheduleAsync(CancellationToken cancellationToken);

    /// <summary>Fuer Stammdaten: darf ein Verkaeufer-Typ geloescht werden, oder ist er aktuell Default?</summary>
    Task<bool> IsDefaultSellerTypeAsync(string sellerTypeId, CancellationToken cancellationToken);
}
