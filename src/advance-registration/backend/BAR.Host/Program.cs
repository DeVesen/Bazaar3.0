using System.Text;
using BAR.Host.Features.Articles;
using BAR.Host.Features.Auth;
using BAR.Host.Features.Blocks;
using BAR.Host.Features.Export;
using BAR.Host.Features.Home;
using BAR.Host.Features.MasterData;
using BAR.Host.Features.Profile;
using BAR.Host.Features.Public;
using BAR.Host.Features.Sellers;
using BAR.Host.Features.SellerTypes;
using BAR.Host.Features.Settings;
using BAR.Modules.Registration.Infrastructure;
using BAR.Modules.Operations.Infrastructure;
using BAR.Modules.Export.Infrastructure;
using BAR.Modules.MasterData.Infrastructure;
using BAR.Modules.SellerManagement.Contracts.Security;
using BAR.Modules.SellerManagement.Infrastructure;
using BAR.Modules.SellerManagement.Infrastructure.Persistence;
using BAR.Modules.Registration.Infrastructure.Persistence;
using BAR.Modules.MasterData.Infrastructure.Persistence;
using BAR.Modules.Operations.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

// Each module wires itself up - the host only knows the call
// (dotnet-modulith-bridge). Own schema/DbContext per module.
builder.Services.AddRegistrationModule(builder.Configuration);
builder.Services.AddSellerManagementModule(builder.Configuration);
builder.Services.AddMasterDataModule(builder.Configuration);
builder.Services.AddOperationsModule(builder.Configuration);
builder.Services.AddExportModule();
builder.Services.AddScoped<HomeCompositionService>();

builder.Services.AddExceptionHandler<BAR.Host.DomainExceptionHandler>();
builder.Services.AddProblemDetails();

// Dictionary keys (e.g. field names in ValidationProblem.errors) otherwise
// don't follow the global CamelCase policy for object properties - align
// them explicitly so the frontend (camelCase) can match the keys at all.
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.DictionaryKeyPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

// JWT bearer auth + authorization policies (api/cross-cutting.md section 2):
// "authenticated" (any valid token) is the default policy, "admin" requires
// role == admin. Literal claim types "sub"/"role" instead of ASP.NET standard
// URIs, matching JwtTokenIssuer (SellerManagement module). JwtOptions lives in
// its Contracts project - the host reads the same configuration for token
// VALIDATION, the module itself signs on ISSUANCE.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
            ?? throw new InvalidOperationException("Jwt configuration is missing.");
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

// CORS: Angular dev origin fixed, production origin via environment variable
// (VPROJ-S02 AC-3, api/cross-cutting.md section 8).
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
app.MapProfileEndpoints();
app.MapHomeEndpoints();
app.MapArticlesEndpoints();
app.MapBrandsEndpoints();
app.MapCategoriesEndpoints();
app.MapSellersEndpoints();
app.MapSellerTypesEndpoints();
app.MapExportEndpoints();
app.MapSettingsEndpoints();

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

/// <summary>
/// Each module brings its own migration history (own schema) - the order
/// between the four modules therefore doesn't matter, each one migrates only
/// its own tables.
/// </summary>
static async Task ApplyMigrationsAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    if (!await WaitForDatabaseAsync(scope.ServiceProvider.GetRequiredService<RegistrationDbContext>(), logger))
    {
        Environment.Exit(1);
        return;
    }

    var migrated = await TryMigrateAsync(scope.ServiceProvider.GetRequiredService<RegistrationDbContext>(), logger)
        && await TryMigrateAsync(scope.ServiceProvider.GetRequiredService<SellerManagementDbContext>(), logger)
        && await TryMigrateAsync(scope.ServiceProvider.GetRequiredService<MasterDataDbContext>(), logger)
        && await TryMigrateAsync(scope.ServiceProvider.GetRequiredService<OperationsDbContext>(), logger);

    if (!migrated)
    {
        Environment.Exit(1);
    }
}

static async Task<bool> TryMigrateAsync(DbContext dbContext, ILogger logger)
{
    var pendingMigrations = await dbContext.Database.GetPendingMigrationsAsync();
    var pending = pendingMigrations.FirstOrDefault() ?? "unbekannt";

    try
    {
        await dbContext.Database.MigrateAsync();
        return true;
    }
    catch (Exception ex)
    {
        logger.LogCritical(ex, "Migration {Migration} failed for {Context}: {Message}", pending, dbContext.GetType().Name, ex.Message);
        return false;
    }
}

static async Task<bool> WaitForDatabaseAsync(DbContext dbContext, ILogger logger)
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

    // Generic ADO.NET members instead of Npgsql types: BAR.Host must not know
    // the provider (R-14), and neither DataSource nor Database contain the
    // password (R-15).
    var connection = dbContext.Database.GetDbConnection();
    logger.LogCritical(
        "Database unreachable: DataSource={DataSource}, Database={Database}",
        connection.DataSource, connection.Database);
    return false;
}
