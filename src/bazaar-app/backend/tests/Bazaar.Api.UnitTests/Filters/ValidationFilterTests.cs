using System.Text.Json;
using Bazaar.Api.Filters;
using Bazaar.Application.Auth;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.DependencyInjection;

namespace Bazaar.Api.UnitTests.Filters;

/// <summary>
/// Verifies the wire-contract-critical detail: FluentValidation's ValidationResult.ToDictionary()
/// keys failures by the raw C# property name ("NewPassword"), but the API contract
/// (docs/requirements/bazaar-app/api/auth.md) requires the camelCase key "newPassword".
/// ValidationFilter remaps this explicitly (System.Text.Json's PropertyNamingPolicy does not
/// touch Dictionary&lt;string, T&gt; keys) — this test proves the actual serialized JSON key.
/// </summary>
public class ValidationFilterTests
{
    [Fact]
    public async Task InvokeAsync_OnValidationFailure_ProducesCamelCaseErrorKey()
    {
        var services = new ServiceCollection();
        services.AddSingleton<IValidator<ChangePasswordCommand>, ChangePasswordCommandValidator>();
        var httpContext = new DefaultHttpContext { RequestServices = services.BuildServiceProvider() };

        var command = new ChangePasswordCommand { CurrentPassword = "irrelevant", NewPassword = "short" };
        var invocationContext = EndpointFilterInvocationContext.Create(httpContext, command);

        var sut = new ValidationFilter<ChangePasswordCommand>();

        var result = await sut.InvokeAsync(invocationContext, _ => ValueTask.FromResult<object?>(null));

        // Results.ValidationProblem(...) returns a ProblemHttpResult at runtime, carrying a
        // ValidationProblemDetails (with its Errors dictionary) as its ProblemDetails.
        var problem = Assert.IsType<ProblemHttpResult>(result);
        var validationProblemDetails = Assert.IsType<HttpValidationProblemDetails>(problem.ProblemDetails);
        var json = JsonSerializer.Serialize(validationProblemDetails.Errors);

        using var document = JsonDocument.Parse(json);
        Assert.True(document.RootElement.TryGetProperty("newPassword", out _),
            $"Expected camelCase key \"newPassword\" in errors, got: {json}");
        Assert.False(document.RootElement.TryGetProperty("NewPassword", out _),
            "Errors dictionary must not carry the raw PascalCase property name.");
    }

    [Theory]
    [InlineData("NewPassword", "newPassword")]
    [InlineData("Username", "username")]
    [InlineData("", "")]
    public void ToCamelCase_lowercases_only_the_first_character(string input, string expected)
    {
        Assert.Equal(expected, ValidationFilter<ChangePasswordCommand>.ToCamelCase(input));
    }
}
