using System.Security.Cryptography;
using System.Text;
using Bazaar.Domain.Ports;

namespace Bazaar.Infrastructure.Security;

public sealed class NanoIdGenerator : IIdGenerator
{
    private const string Alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    private const int Length = 8;

    public string Generate()
    {
        var builder = new StringBuilder(Length);
        for (var i = 0; i < Length; i++)
        {
            builder.Append(Alphabet[RandomNumberGenerator.GetInt32(Alphabet.Length)]);
        }

        return builder.ToString();
    }
}
