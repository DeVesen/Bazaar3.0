namespace BAR.Modules.Operations.Contracts;

public interface IOperationsModuleApi
{
    Task<SettingsDto?> GetSettingsAsync(CancellationToken cancellationToken);
    Task<SettingsDto> UpdateSettingsAsync(UpdateSettingsCommand command, CancellationToken cancellationToken);

    /// <summary>Anonymous, composed internally with MasterData (the default type's conditions).</summary>
    Task<PublicInfoDto> GetPublicInfoAsync(CancellationToken cancellationToken);

    /// <summary>For Registration: the numbering-range parameters for block allocation.</summary>
    Task<NumberingConfigDto> GetNumberingConfigAsync(CancellationToken cancellationToken);

    /// <summary>For Home (Host composition).</summary>
    Task<BazaarScheduleDto?> GetBazaarScheduleAsync(CancellationToken cancellationToken);

    /// <summary>For MasterData: may a seller type be deleted, or is it currently the default?</summary>
    Task<bool> IsDefaultSellerTypeAsync(string sellerTypeId, CancellationToken cancellationToken);
}
