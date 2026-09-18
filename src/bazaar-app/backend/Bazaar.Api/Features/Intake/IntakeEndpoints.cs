using Bazaar.Api.Filters;
using Bazaar.Application.Intake;

namespace Bazaar.Api.Features.Intake;

public static class IntakeEndpoints
{
    public static IEndpointRouteBuilder MapIntakeEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/intake", async (IntakeCommand command, IntakeHandler handler) =>
        {
            var result = await handler.Handle(command);
            return Results.Ok(new IntakeResponseDto(result.ArticleIds, result.IntakeFeePaid));
        })
        .RequireAuthorization()
        .AddEndpointFilter<ValidationFilter<IntakeCommand>>();

        return app;
    }
}

public sealed record IntakeResponseDto(IReadOnlyList<string> ArticleIds, decimal IntakeFeePaid);
