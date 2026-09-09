using System.Text;
using BAR.Host.Features.Auth;
using BAR.Host.Features.Blocks;
using BAR.Host.Features.Public;
using BAR.Infrastructure;
using BAR.Infrastructure.Persistence;
using BAR.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddExceptionHandler<BAR.Host.DomainExceptionHandler>();
builder.Services.AddProblemDetails();

// JWT-Bearer-Auth + Autorisierungs-Policies (api/cross-cutting.md Abschnitt 2):
// "authenticated" (jedes gueltige Token) ist Default-Policy, "admin" verlangt
// role == admin. Literale Claim-Typen "sub"/"role" statt ASP.NET-Standard-URIs,
// passend zu JwtTokenIssuer.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
            ?? throw new InvalidOperationException("Jwt-Konfiguration fehlt.");
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
            RoleClaimType = "role",
            NameClaimType = "sub"
        };
    });

builder.Services.AddAuthorizationBuilder()
    .SetDefaultPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build())
    .AddPolicy("admin", policy => policy.RequireRole("admin"));

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

app.UseExceptionHandler();

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthEndpoints();
app.MapAuthEndpoints();
app.MapPublicInfoEndpoints();
app.MapBlocksEndpoints();

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

    // Vorab ermittelt: nach einem Verbindungsabbruch in MigrateAsync wuerde
    // dieselbe Abfrage im catch-Block selbst werfen und die Logzeile schlucken.
    var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();
    var pending = pendingMigrations.FirstOrDefault() ?? "unbekannt";

    try
    {
        await dbContext.Database.MigrateAsync();
    }
    catch (Exception ex)
    {
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

    // Generische ADO.NET-Member statt Npgsql-Typen: BAR.Host darf den
    // Provider nicht kennen (R-14), und weder DataSource noch Database
    // enthalten das Passwort (R-15).
    var connection = dbContext.Database.GetDbConnection();
    logger.LogCritical(
        "Datenbank nicht erreichbar: DataSource={DataSource}, Database={Database}",
        connection.DataSource, connection.Database);
    return false;
}
