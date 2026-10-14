using Bazaar.Api.Filters;
using Bazaar.Application.Settings;

namespace Bazaar.Api.Features.Settings;

public static class SettingsEndpoints
{
    public static IEndpointRouteBuilder MapSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/settings", async (GetSettingsHandler handler) => Results.Ok(await handler.Handle()))
            .RequireAuthorization();

        app.MapPut("/api/settings", async (UpdateSettingsCommand command, UpdateSettingsHandler handler) =>
        {
            await handler.Handle(command);
            return Results.NoContent();
        })
        .RequireAuthorization("admin")
        .AddEndpointFilter<ValidationFilter<UpdateSettingsCommand>>();

        app.MapGet("/api/settings/print-texts", async (GetPrintTextsHandler handler) =>
                Results.Ok(await handler.Handle()))
            .RequireAuthorization();

        app.MapPut("/api/settings/print-texts", async (UpdatePrintTextsCommand command, UpdatePrintTextsHandler handler) =>
        {
            await handler.Handle(command);
            return Results.NoContent();
        })
        .RequireAuthorization("admin")
        .AddEndpointFilter<ValidationFilter<UpdatePrintTextsCommand>>();

        return app;
    }
}
