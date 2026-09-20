namespace Bazaar.Api.Features.Public;

public sealed record BootstrapStatusResponse(bool HasAdmin);

public sealed record BootstrapAdminResponse(string AccessToken);
