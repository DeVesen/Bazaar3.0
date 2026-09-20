namespace Bazaar.Api.Features.Users;

public sealed record UserDto(string Id, string Username, string Role, bool MustChangePassword);
