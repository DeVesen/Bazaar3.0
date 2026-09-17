namespace Bazaar.Domain.Ports;

/// <summary>
/// App-wide ID generation port, intended for all future entities needing
/// generated IDs.
/// </summary>
public interface IIdGenerator
{
    string Generate();
}
