namespace Bazaar.Application.Auth;

/// <summary>
/// Cached in-memory flag for whether an admin user exists, computed once at startup
/// (Program.cs, after migrations) so GET /api/public/bootstrap-status never hits the
/// database per request.
///
/// <see cref="AcquireBootstrapLockAsync"/> additionally serializes the check-and-create
/// in <c>BootstrapAdminHandler</c> within this process: only one bootstrap-admin creation
/// can be in flight at a time, so two concurrent first requests can no longer both pass the
/// "no admin yet" check before either writes. This closes the race for a single-process,
/// single-container deployment (this app's only deployment shape, see CLAUDE.md); it does
/// NOT protect against multiple app instances writing to the same database, since the
/// semaphore is per-process memory, not a distributed lock.
/// </summary>
public sealed class AdminBootstrapState
{
    private readonly SemaphoreSlim _bootstrapLock = new(1, 1);

    public bool HasAdmin { get; private set; }

    public void Initialize(bool hasAdmin) => HasAdmin = hasAdmin;

    public void MarkAdminCreated() => HasAdmin = true;

    /// <summary>
    /// Acquires the process-wide bootstrap-admin lock. Dispose the returned handle to
    /// release it. Does not affect <see cref="HasAdmin"/> reads (e.g. the bootstrap-status
    /// endpoint), which stay lock-free.
    /// </summary>
    public async Task<IDisposable> AcquireBootstrapLockAsync()
    {
        await _bootstrapLock.WaitAsync();
        return new Releaser(_bootstrapLock);
    }

    private sealed class Releaser(SemaphoreSlim semaphore) : IDisposable
    {
        public void Dispose() => semaphore.Release();
    }
}
