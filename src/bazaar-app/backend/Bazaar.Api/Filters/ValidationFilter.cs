using FluentValidation;

namespace Bazaar.Api.Filters;

public sealed class ValidationFilter<TRequest> : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var validator = context.HttpContext.RequestServices.GetService<IValidator<TRequest>>();
        if (validator is null)
        {
            return await next(context);
        }

        var request = context.Arguments.OfType<TRequest>().FirstOrDefault();
        if (request is null)
        {
            return await next(context);
        }

        var result = await validator.ValidateAsync(request);
        if (!result.IsValid)
        {
            // FluentValidation's ToDictionary() keys the failures by the raw C#
            // property name (e.g. "NewPassword"). The wire contract requires
            // camelCase keys (e.g. "newPassword") matching the rest of the JSON
            // API, and System.Text.Json's PropertyNamingPolicy does not affect
            // Dictionary<string, T> keys — so it is remapped explicitly here.
            var errors = result.ToDictionary()
                .ToDictionary(kv => ToCamelCase(kv.Key), kv => kv.Value);
            return Results.ValidationProblem(errors);
        }

        return await next(context);
    }

    internal static string ToCamelCase(string propertyName) =>
        propertyName.Length == 0
            ? propertyName
            : char.ToLowerInvariant(propertyName[0]) + propertyName[1..];
}
