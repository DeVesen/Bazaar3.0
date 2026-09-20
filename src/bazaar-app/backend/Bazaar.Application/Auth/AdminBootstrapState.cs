namespace Bazaar.Application.Auth;

/// <summary>
/// Cached in-memory flag for whether an admin user exists, computed once at startup
/// (Program.cs, after migrations) so GET /api/public/bootstrap-status never hits the
/// database per request. BootstrapAdminHandler re-checks the database directly before
/// creating the admin, closing the race window between two concurrent first requests.
/// </summary>
public sealed class AdminBootstrapState
{
    public bool HasAdmin { get; private set; }

    public void Initialize(bool hasAdmin) => HasAdmin = hasAdmin;

    public void MarkAdminCreated() => HasAdmin = true;
}
