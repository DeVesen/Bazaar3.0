namespace Bazaar.Domain.Exceptions;

public abstract class DomainException(string message, string errorCode) : Exception(message)
{
    public string ErrorCode { get; } = errorCode;
}

public sealed class NotFoundException(string message, string errorCode = "not_found") : DomainException(message, errorCode);

public sealed class ConflictException(string message, string errorCode = "conflict") : DomainException(message, errorCode);

public sealed class UnauthorizedException(string message, string errorCode = "unauthorized") : DomainException(message, errorCode);

public sealed class ForbiddenException(string message, string errorCode = "forbidden") : DomainException(message, errorCode);
