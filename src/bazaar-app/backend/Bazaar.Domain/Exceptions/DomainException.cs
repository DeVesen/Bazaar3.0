namespace Bazaar.Domain.Exceptions;

public abstract class DomainException(string message, string errorCode) : Exception(message)
{
    public string ErrorCode { get; } = errorCode;

    /// <summary>
    /// Optional extra data surfaced in the ProblemDetails JSON body
    /// alongside errorCode (e.g. intake's 409 takenNumbers/nextNumber).
    /// Settable, not init-only, so callers can populate it via
    /// object-initializer syntax after construction:
    /// <c>throw new ConflictException(msg, code) { Extensions = { ["k"] = v } }</c>.
    /// </summary>
    public IDictionary<string, object?> Extensions { get; set; } = new Dictionary<string, object?>();
}

public sealed class NotFoundException(string message, string errorCode = "not_found") : DomainException(message, errorCode);

public sealed class ConflictException(string message, string errorCode = "conflict") : DomainException(message, errorCode);

public sealed class UnauthorizedException(string message, string errorCode = "unauthorized") : DomainException(message, errorCode);

public sealed class ForbiddenException(string message, string errorCode = "forbidden") : DomainException(message, errorCode);

public sealed class BadRequestException(string message, string errorCode = "bad_request") : DomainException(message, errorCode);
