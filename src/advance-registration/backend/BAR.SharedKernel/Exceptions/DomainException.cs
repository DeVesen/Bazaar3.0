namespace BAR.SharedKernel.Exceptions;

/// <summary>
/// The base of every domain-level error in every module. The
/// <see cref="ErrorCode"/> hangs off the exception object, not off a switch
/// in the ExceptionHandler - so a new error code never changes a central
/// mapping table (api/cross-cutting.md section 3). Lives in the SharedKernel
/// so BAR.Host can run a single, module-independent ExceptionHandler.
/// </summary>
public abstract class DomainException : Exception
{
    protected DomainException(string errorCode, string detail) : base(detail)
    {
        ErrorCode = errorCode;
    }

    /// <summary>A dot-separated code, e.g. <c>block.overlap</c>.</summary>
    public string ErrorCode { get; }
}

/// <summary>The resource does not exist or belongs to a different seller -> 404.</summary>
public sealed class NotFoundException(string errorCode, string detail)
    : DomainException(errorCode, detail);

/// <summary>A domain invariant was violated -> 409.</summary>
public class ConflictException(string errorCode, string detail)
    : DomainException(errorCode, detail);

/// <summary>Credentials or token are invalid -> 401.</summary>
public sealed class UnauthorizedException(string errorCode, string detail)
    : DomainException(errorCode, detail);

/// <summary>The role is not sufficient for this action -> 403.</summary>
public sealed class ForbiddenException(string errorCode, string detail)
    : DomainException(errorCode, detail);
