namespace Bazaar.Domain.Ports;

/// <summary>
/// App-wide ID generation pattern. Not User-specific — Round-10 is the first
/// round with real persistence and establishes this pattern for all future
/// entities.
/// </summary>
public interface IIdGenerator
{
    string Generate();
}
