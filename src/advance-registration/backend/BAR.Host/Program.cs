using BAR.Host.Features.Public;
using BAR.Infrastructure;

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

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors(corsPolicy);

app.MapHealthEndpoints();

app.Run();
