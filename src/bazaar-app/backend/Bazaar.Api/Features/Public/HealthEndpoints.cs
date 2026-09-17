using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Bazaar.Api.Features.Public;

public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapHealthChecks("/health", new HealthCheckOptions
        {
            ResponseWriter = async (ctx, report) =>
            {
                ctx.Response.ContentType = "application/json";
                var status = report.Status == HealthStatus.Healthy ? "healthy" : "unhealthy";
                await ctx.Response.WriteAsync($$"""{"status":"{{status}}"}""");
            }
        }).AllowAnonymous();

        return app;
    }
}
