using BAR.Modules.Operations.Contracts;
using BAR.Host.Validation;

namespace BAR.Host.Features.Settings;

public static class SettingsEndpoints
{
    public static IEndpointRouteBuilder MapSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/settings", async (IOperationsModuleApi operations, CancellationToken ct) =>
            Results.Ok(await operations.GetSettingsAsync(ct))
        ).RequireAuthorization("admin");

        app.MapPut("/api/settings", async (UpdateSettingsCommand command, IOperationsModuleApi operations, CancellationToken ct) =>
            Results.Ok(await operations.UpdateSettingsAsync(command, ct))
        ).AddEndpointFilter<ValidationFilter<UpdateSettingsCommand>>().RequireAuthorization("admin");

        return app;
    }
}
