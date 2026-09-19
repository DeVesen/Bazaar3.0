using Bazaar.Api.Filters;
using Bazaar.Application.Release;

namespace Bazaar.Api.Features.Release;

public static class ReleaseEndpoints
{
    public static IEndpointRouteBuilder MapReleaseEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/release", async (ReleaseCommand command, ReleaseHandler handler) =>
        {
            var result = await handler.Handle(command);
            return Results.Ok(new ReleaseResponseDto(result.ReleasedCount, result.IntakeFeePaid));
        })
        .RequireAuthorization()
        .AddEndpointFilter<ValidationFilter<ReleaseCommand>>();

        return app;
    }
}

public sealed record ReleaseResponseDto(int ReleasedCount, decimal IntakeFeePaid);
