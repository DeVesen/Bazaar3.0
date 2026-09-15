namespace BAR.Modules.SellerManagement.Application.Auth.BootstrapAdmin;

/// <summary>
/// Whether an admin exists, computed once at process startup
/// (<c>Program.cs</c>) from <c>ISellerRepository.CountAdminsAsync</c> and
/// never re-queried per request. Deliberately does not re-check the database
/// later - the only way this changes at runtime is
/// <see cref="MarkAdminCreated"/>, called by the bootstrap handler right
/// after it creates the first admin, so the newly-locked
/// <c>/bootstrap-admin</c> route reflects reality without a restart.
/// </summary>
public sealed class AdminBootstrapState
{
    private volatile bool _hasAdmin;

    public bool HasAdmin => _hasAdmin;

    public void Initialize(bool hasAdmin) => _hasAdmin = hasAdmin;

    public void MarkAdminCreated() => _hasAdmin = true;
}
