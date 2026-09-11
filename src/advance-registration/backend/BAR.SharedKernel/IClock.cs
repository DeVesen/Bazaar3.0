namespace BAR.SharedKernel;

/// <summary>
/// Zeitquelle der Handler in jedem Modul. Liefert ausschliesslich UTC - die
/// Datenbank speichert <c>timestamptz</c>, und Npgsql wirft bei
/// <c>DateTimeKind.Local</c> (entities/overview.md, Abschnitt Zeitstempel und
/// Zeitzone).
/// </summary>
public interface IClock
{
    DateTime UtcNow { get; }
}

public sealed class SystemClock : IClock
{
    public DateTime UtcNow => DateTime.UtcNow;
}
