using BAR.Modules.Registration.Contracts;
using BAR.SharedKernel.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace BAR.Host;

/// <summary>
/// The single place that maps a DomainException to ProblemDetails
/// (api/cross-cutting.md section 3). Handlers and the domain throw exceptions,
/// they do not build HTTP responses. Knows only
/// <see cref="ArticleNumberConflictException"/> (Registration.Contracts) from the
/// modules, for the extra <c>nextNumber</c> field - everything else is handled
/// generically via the SharedKernel hierarchy, so the Host never needs to know
/// about a module-internal detail.
/// </summary>
public sealed class DomainExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is ArgumentException argumentException)
        {
            var badRequest = new ProblemDetails
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "One or more validation errors occurred.",
                Detail = argumentException.Message
            };

            httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
            await httpContext.Response.WriteAsJsonAsync(badRequest, options: null, contentType: "application/problem+json", cancellationToken);
            return true;
        }

        if (exception is not DomainException domainException)
        {
            return false;
        }

        var status = domainException switch
        {
            NotFoundException => StatusCodes.Status404NotFound,
            ConflictException => StatusCodes.Status409Conflict,
            UnauthorizedException => StatusCodes.Status401Unauthorized,
            ForbiddenException => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status500InternalServerError
        };

        var problemDetails = new ProblemDetails
        {
            Status = status,
            Title = ReasonPhrases.GetReasonPhrase(status),
            Detail = domainException.Message
        };
        problemDetails.Extensions["errorCode"] = domainException.ErrorCode;

        if (domainException is ArticleNumberConflictException numberConflict)
        {
            problemDetails.Extensions["nextNumber"] = numberConflict.NextNumber;
        }

        httpContext.Response.StatusCode = status;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, options: null, contentType: "application/problem+json", cancellationToken);
        return true;
    }
}

file static class ReasonPhrases
{
    public static string GetReasonPhrase(int statusCode) => statusCode switch
    {
        404 => "Not Found",
        409 => "Conflict",
        401 => "Unauthorized",
        403 => "Forbidden",
        _ => "Error"
    };
}
