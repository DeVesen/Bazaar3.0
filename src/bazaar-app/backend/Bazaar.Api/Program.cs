using System.Text;
using Bazaar.Api.ExceptionHandling;
using Bazaar.Api.Features.Public;
using Bazaar.Api.Security;
using Bazaar.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddExceptionHandler<DomainExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddDbContext<BazaarDbContext>((sp, options) =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("ConnectionStrings__DefaultConnection is missing.");
    options.UseNpgsql(connectionString, npgsql => npgsql.EnableRetryOnFailure(3));
});

builder.Services.AddHealthChecks().AddDbContextCheck<BazaarDbContext>();

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
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.SigningKey)),
        };
    });

builder.Services.AddAuthorization();

// CORS: dev-only, Angular dev origin fixed. No policy object exists in
// Production at all (AC-6) - not just unused.
const string corsPolicy = "bazaar-dev";
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(o => o.AddPolicy(corsPolicy, p =>
        p.WithOrigins("http://localhost:4200").AllowAnyHeader().AllowAnyMethod()));
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors(corsPolicy);
}

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthEndpoints();

await ApplyMigrationsAsync(app);

app.Run();

static async Task<bool> WaitForDatabaseAsync(BazaarDbContext dbContext, ILogger logger)
{
    var delay = TimeSpan.FromSeconds(1);
    const int maxAttempts = 10;
    var deadline = DateTime.UtcNow.AddSeconds(60);

    for (var attempt = 1; attempt <= maxAttempts && DateTime.UtcNow < deadline; attempt++)
    {
        try
        {
            if (await dbContext.Database.CanConnectAsync())
            {
                return true;
            }
        }
        catch (Exception ex)
        {
            var connection = dbContext.Database.GetDbConnection();
            logger.LogWarning(ex, "Attempt {Attempt}/{MaxAttempts}: cannot reach database {DataSource}/{Database}",
                attempt, maxAttempts, connection.DataSource, connection.Database);
        }

        await Task.Delay(delay);
        delay = TimeSpan.FromSeconds(Math.Min(delay.TotalSeconds * 2, 15));
    }

    return false;
}

static async Task ApplyMigrationsAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<BazaarDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    if (!await WaitForDatabaseAsync(dbContext, logger))
    {
        Environment.Exit(1);
        return;
    }

    var pending = (await dbContext.Database.GetPendingMigrationsAsync()).FirstOrDefault() ?? "unbekannt";
    try
    {
        await dbContext.Database.MigrateAsync();
    }
    catch (Exception ex)
    {
        logger.LogCritical(ex, "Migration {Migration} failed: {Message}", pending, ex.Message);
        Environment.Exit(1);
    }
}
