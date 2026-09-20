namespace Bazaar.Application.Settings;

/// <summary>
/// <see cref="ScannerPauseMs"/> is bound directly from the JSON request body of PUT /api/settings.
/// No <see cref="ScannerPauseMs"/>-adjacent Id property — settings is a singleton resource.
/// </summary>
public sealed class UpdateSettingsCommand
{
    public int ScannerPauseMs { get; set; }
}
