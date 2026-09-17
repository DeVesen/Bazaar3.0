namespace Bazaar.Domain.Ports;

public interface IPasswordHasher
{
    string Hash(string plain);

    bool Verify(string hash, string plain);
}
