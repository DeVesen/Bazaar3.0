using BAR.Modules.Anmeldung.Contracts;
using BAR.SharedKernel.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace BAR.Host;

/// <summary>
/// Einziger Ort, der DomainException auf ProblemDetails abbildet
/// (api/cross-cutting.md Abschnitt 3). Handler und Domaene werfen Exceptions,
/// sie bauen keine HTTP-Antworten. Kennt aus den Modulen nur
/// <see cref="ArticleNumberConflictException"/> (Anmeldung.Contracts) fuer
/// das zusaetzliche <c>nextNumber</c>-Feld - alles andere laeuft generisch
/// ueber die SharedKernel-Hierarchie, ohne dass Host ein Modul-internes
/// Detail kennen muesste.
/// </summary>
public sealed class DomainExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
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
