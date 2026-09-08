namespace BAR.Application.Abstractions;

/// <summary>
/// Zeitquelle der Handler. Liefert ausschliesslich UTC - die Datenbank speichert
/// <c>timestamptz</c>, und Npgsql wirft bei <c>DateTimeKind.Local</c>
/// (entities/overview.md, Abschnitt Zeitstempel und Zeitzone).
/// </summary>
public interface IClock
{
    DateTime UtcNow { get; }
}
