namespace BAR.SharedKernel;

/// <summary>
/// Time source for the handlers in every module. Returns UTC only - the
/// database stores <c>timestamptz</c>, and Npgsql throws on
/// <c>DateTimeKind.Local</c> (entities/overview.md, timestamps and timezone
/// section).
/// </summary>
public interface IClock
{
    DateTime UtcNow { get; }
}

public sealed class SystemClock : IClock
{
    public DateTime UtcNow => DateTime.UtcNow;
}
