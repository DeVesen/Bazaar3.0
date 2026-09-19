using System.Text;
using Bazaar.Api.ExceptionHandling;
using Bazaar.Api.Features.Articles;
using Bazaar.Api.Features.Auth;
using Bazaar.Api.Features.Brands;
using Bazaar.Api.Features.Categories;
using Bazaar.Api.Features.Intake;
using Bazaar.Api.Features.Release;
using Bazaar.Api.Features.Public;
using Bazaar.Api.Features.Sales;
using Bazaar.Api.Features.SellerTypes;
using Bazaar.Api.Features.Sellers;
using Bazaar.Api.Features.Settlement;
using Bazaar.Application.Articles;
using Bazaar.Application.Auth;
using Bazaar.Application.Brands;
using Bazaar.Application.Categories;
using Bazaar.Application.Intake;
using Bazaar.Application.Release;
using Bazaar.Application.Sales;
using Bazaar.Application.SellerTypes;
using Bazaar.Application.Sellers;
using Bazaar.Application.Settlement;
using Bazaar.Domain.Ports;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Bazaar.Infrastructure.Security;
using FluentValidation;
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

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));

// Port implementations: registered here in the composition root (not in the
// Application/Api layer) because SeedAdminHostedService needs them resolvable
// at startup, before the application layer's own DI wiring runs.
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBrandRepository, BrandRepository>();
builder.Services.AddScoped<IBrandArticleLink, BrandArticleLink>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryArticleLink, CategoryArticleLink>();
builder.Services.AddScoped<ISellerTypeRepository, SellerTypeRepository>();
builder.Services.AddScoped<ISellerCountBySellerTypeQuery, SellerCountBySellerTypeQuery>();
builder.Services.AddScoped<ISellerRepository, SellerRepository>();
builder.Services.AddScoped<ISellerSearchQuery, SellerSearchQuery>();
builder.Services.AddScoped<ISellerCardsQuery, SellerCardsQuery>();
builder.Services.AddScoped<IArticlesBySellerQuery, ArticlesBySellerQuery>();
builder.Services.AddScoped<IArticleCountBySellerQuery, ArticleCountBySellerQuery>();
builder.Services.AddScoped<IArticleRepository, ArticleRepository>();
builder.Services.AddScoped<IArticleListQuery, ArticleListQuery>();
builder.Services.AddScoped<ISellerSettlementQuery, SellerSettlementQuery>();
builder.Services.AddScoped<IUnitOfWork, EfUnitOfWork>();
builder.Services.AddScoped<IPasswordHasher, AspNetPasswordHasher>();
builder.Services.AddSingleton<ITokenIssuer, JwtTokenIssuer>();
builder.Services.AddSingleton<IIdGenerator, NanoIdGenerator>();

builder.Services.AddHostedService<SeedAdminHostedService>();

builder.Services.AddScoped<LoginHandler>();
builder.Services.AddScoped<ChangePasswordHandler>();
builder.Services.AddScoped<GetBrandsHandler>();
builder.Services.AddScoped<CreateBrandHandler>();
builder.Services.AddScoped<UpdateBrandHandler>();
builder.Services.AddScoped<DeleteBrandHandler>();
builder.Services.AddScoped<GetCategoriesHandler>();
builder.Services.AddScoped<CreateCategoryHandler>();
builder.Services.AddScoped<UpdateCategoryHandler>();
builder.Services.AddScoped<DeleteCategoryHandler>();
builder.Services.AddScoped<GetSellerTypesHandler>();
builder.Services.AddScoped<CreateSellerTypeHandler>();
builder.Services.AddScoped<UpdateSellerTypeHandler>();
builder.Services.AddScoped<DeleteSellerTypeHandler>();
builder.Services.AddScoped<GetSellerCardsHandler>();
builder.Services.AddScoped<GetSellerByIdHandler>();
builder.Services.AddScoped<SearchSellersHandler>();
builder.Services.AddScoped<CreateSellerHandler>();
builder.Services.AddScoped<UpdateSellerHandler>();
builder.Services.AddScoped<DeleteSellerHandler>();
builder.Services.AddScoped<GetSellerArticlesHandler>();
builder.Services.AddScoped<ResetSellerSettlementHandler>();
builder.Services.AddScoped<GetArticlesHandler>();
builder.Services.AddScoped<GetArticleByIdHandler>();
builder.Services.AddScoped<GetNextArticleNumberHandler>();
builder.Services.AddScoped<UpdateArticleHandler>();
builder.Services.AddScoped<UpdateArticleTimestampsHandler>();
builder.Services.AddScoped<DeleteArticleHandler>();
builder.Services.AddScoped<GetArticleByNumberHandler>();
builder.Services.AddScoped<IntakeHandler>();
builder.Services.AddScoped<ReleaseHandler>();
builder.Services.AddScoped<RecordSaleHandler>();
builder.Services.AddScoped<UndoSaleHandler>();
builder.Services.AddScoped<GetSellerSettlementHandler>();
builder.Services.AddScoped<ReturnArticleHandler>();
builder.Services.AddValidatorsFromAssemblyContaining<LoginCommandValidator>();

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

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("admin", policy => policy.RequireClaim("role", "admin"));
});

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
app.MapAuthEndpoints();
app.MapBrandEndpoints();
app.MapCategoryEndpoints();
app.MapSellerTypeEndpoints();
app.MapSellerEndpoints();
app.MapArticleEndpoints();
app.MapIntakeEndpoints();
app.MapReleaseEndpoints();
app.MapSalesEndpoints();
app.MapSettlementEndpoints();

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
