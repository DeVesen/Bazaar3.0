using Bazaar.Domain.Users;

namespace Bazaar.Domain.Ports;

public interface ITokenIssuer
{
    string IssueAccessToken(User user, DateTime nowUtc);
}
