using Bazaar.Application.Auth;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence;

/// <summary>
/// Drops and recreates the database from scratch (all migrations reapplied). Dev-only tool,
/// wired in Program.cs behind Environment.IsDevelopment() — never registered/mapped in Production.
///
/// Also resets <see cref="AdminBootstrapState"/> back to "no admin" — that flag is an in-memory
/// singleton computed once at startup (see its own doc comment), so wiping the database alone
/// leaves the running process still believing an admin exists and GET /api/public/bootstrap-status
/// would keep sending the frontend to /login instead of the setup wizard.
/// </summary>
public class DatabaseResetService(BazaarDbContext dbContext, AdminBootstrapState bootstrapState)
{
    public async Task ResetAsync()
    {
        await dbContext.Database.EnsureDeletedAsync();
        await dbContext.Database.MigrateAsync();
        bootstrapState.Initialize(false);
    }
}
