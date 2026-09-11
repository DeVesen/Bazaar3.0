using BAR.Modules.Betrieb.Contracts;

namespace BAR.Host.Features.Public;

/// <summary>
/// Oeffentliche Basar-Infos ohne Token (api/public.md Abschnitt 1, Epic_Login
/// AC-12). Der Handler ist null-sicher fuer ein fehlendes Settings-Row, der
/// Endpoint liefert daher immer <c>200</c>.
/// </summary>
public static class PublicInfoEndpoints
{
    public static IEndpointRouteBuilder MapPublicInfoEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/public/info", async (IBetriebModuleApi betrieb, CancellationToken ct) =>
            Results.Ok(await betrieb.GetPublicInfoAsync(ct)))
            .AllowAnonymous();

        return app;
    }
}
