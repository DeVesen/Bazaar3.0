using BAR.Modules.Betrieb.Contracts;
using BAR.Host.Validation;

namespace BAR.Host.Features.Settings;

public static class SettingsEndpoints
{
    public static IEndpointRouteBuilder MapSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/settings", async (IBetriebModuleApi betrieb, CancellationToken ct) =>
            Results.Ok(await betrieb.GetSettingsAsync(ct))
        ).RequireAuthorization("admin");

        app.MapPut("/api/settings", async (UpdateSettingsCommand command, IBetriebModuleApi betrieb, CancellationToken ct) =>
            Results.Ok(await betrieb.UpdateSettingsAsync(command, ct))
        ).AddEndpointFilter<ValidationFilter<UpdateSettingsCommand>>().RequireAuthorization("admin");

        return app;
    }
}
