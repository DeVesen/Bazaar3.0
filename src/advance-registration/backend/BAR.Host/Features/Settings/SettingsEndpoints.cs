using BAR.Application.Settings.GetSettings;
using BAR.Application.Settings.Update;
using BAR.Host.Validation;

namespace BAR.Host.Features.Settings;

public static class SettingsEndpoints
{
    public static IEndpointRouteBuilder MapSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/settings", async (GetSettingsQueryHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(ct))
        ).RequireAuthorization("admin");

        app.MapPut("/api/settings", async (UpdateSettingsCommand command, UpdateSettingsCommandHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(command, ct))
        ).AddEndpointFilter<ValidationFilter<UpdateSettingsCommand>>().RequireAuthorization("admin");

        return app;
    }
}
