using BAR.Host.Features.Public;
using BAR.Infrastructure;
using BAR.Infrastructure.Persistence;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddInfrastructure(builder.Configuration);

// CORS: Angular Dev fest, Production-Origin ueber Environment-Variable
// (VPROJ-S02 AC-3, api/cross-cutting.md Abschnitt 8).
const string corsPolicy = "bar-frontend";
var productionOrigin = builder.Configuration["CORS_ALLOWED_ORIGIN"];
builder.Services.AddCors(options => options.AddPolicy(corsPolicy, policy =>
{
    string[] origins = productionOrigin is { Length: > 0 }
        ? ["http://localhost:4200", productionOrigin]
        : ["http://localhost:4200"];

    policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
}));

var app = builder.Build();

await ApplyMigrationsAsync(app);

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(corsPolicy);

app.MapHealthEndpoints();

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var status = report.Status == HealthStatus.Healthy ? "healthy" : "unhealthy";
        await context.Response.WriteAsync($$"""{"status":"{{status}}"}""");
    }
}).AllowAnonymous();

app.Run();

static async Task ApplyMigrationsAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<BarDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    if (!await WaitForDatabaseAsync(dbContext, logger))
    {
        Environment.Exit(1);
        return;
    }

    try
    {
        await dbContext.Database.MigrateAsync();
    }
    catch (Exception ex)
    {
        var pending = (await dbContext.Database.GetPendingMigrationsAsync()).FirstOrDefault() ?? "unbekannt";
        logger.LogCritical(ex, "Migration {Migration} fehlgeschlagen: {Message}", pending, ex.Message);
        Environment.Exit(1);
    }
}

static async Task<bool> WaitForDatabaseAsync(BarDbContext dbContext, ILogger logger)
{
    const int maxAttempts = 10;
    var maxTotalWait = TimeSpan.FromSeconds(60);
    var delay = TimeSpan.FromSeconds(1);
    var elapsed = TimeSpan.Zero;

    for (var attempt = 1; attempt <= maxAttempts; attempt++)
    {
        if (await dbContext.Database.CanConnectAsync())
        {
            return true;
        }

        if (attempt == maxAttempts || elapsed + delay > maxTotalWait)
        {
            break;
        }

        await Task.Delay(delay);
        elapsed += delay;
        delay = TimeSpan.FromSeconds(Math.Min(delay.TotalSeconds * 2, 15));
    }

    var connectionString = new NpgsqlConnectionStringBuilder(dbContext.Database.GetConnectionString());
    logger.LogCritical(
        "Datenbank nicht erreichbar: Host={Host}, Port={Port}, Database={Database}",
        connectionString.Host, connectionString.Port, connectionString.Database);
    return false;
}
