namespace Bazaar.Application.Settings;

/// <summary>
/// <see cref="ScannerPauseMs"/> and <see cref="ReleaseOnClose"/> are bound directly from the JSON
/// request body of PUT /api/settings (full replacement). No Id property — settings is a singleton resource.
/// <see cref="ReleaseOnClose"/> defaults to true so an omitted field keeps today's behaviour.
/// </summary>
public sealed class UpdateSettingsCommand
{
    public int ScannerPauseMs { get; set; }
    public bool ReleaseOnClose { get; set; } = true;
}
