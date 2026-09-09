using BAR.Application.Public.GetInfo;

namespace BAR.Host.Features.Public;

/// <summary>
/// Oeffentliche Basar-Infos ohne Token (api/public.md Abschnitt 1, Epic_Login
/// AC-12). Der Handler ist null-sicher fuer ein fehlendes Settings-Row (Task
/// 17), der Endpoint liefert daher immer <c>200</c>.
/// </summary>
public static class PublicInfoEndpoints
{
    public static IEndpointRouteBuilder MapPublicInfoEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/public/info", async (GetPublicInfoQueryHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(ct)))
            .AllowAnonymous();

        return app;
    }
}
