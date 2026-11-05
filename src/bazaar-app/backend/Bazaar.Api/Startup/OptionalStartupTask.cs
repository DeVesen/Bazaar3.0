namespace Bazaar.Api.Startup;

/// <summary>
/// Führt eine Komfortfunktion beim Start aus. Ein Fehler wird protokolliert, bricht den
/// App-Start aber nicht ab: der Basar-Betrieb darf davon nicht abhängen.
/// </summary>
internal static class OptionalStartupTask
{
    public static async Task RunAsync(Func<Task> task, ILogger logger, string name)
    {
        try
        {
            await task();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Startaufgabe {Task} fehlgeschlagen, Start wird fortgesetzt: {Message}", name, ex.Message);
        }
    }
}
