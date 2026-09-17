using DomainUser = global::Bazaar.Domain.User.User;

namespace Bazaar.Domain.Ports;

public interface ITokenIssuer
{
    string IssueAccessToken(DomainUser user, DateTime nowUtc);
}
