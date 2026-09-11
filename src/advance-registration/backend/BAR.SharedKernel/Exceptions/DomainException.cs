namespace BAR.SharedKernel.Exceptions;

/// <summary>
/// Basis aller fachlichen Fehler in jedem Modul. Der <see cref="ErrorCode"/>
/// haengt am Exception-Objekt, nicht an einem Switch im ExceptionHandler - ein
/// neuer Fehlercode aendert damit keine zentrale Abbildungstabelle
/// (api/cross-cutting.md Abschnitt 3). Liegt im SharedKernel, damit
/// BAR.Host einen einzigen, modulunabhaengigen ExceptionHandler betreiben kann.
/// </summary>
public abstract class DomainException : Exception
{
    protected DomainException(string errorCode, string detail) : base(detail)
    {
        ErrorCode = errorCode;
    }

    /// <summary>Punktgetrennter Code, z. B. <c>block.overlap</c>.</summary>
    public string ErrorCode { get; }
}

/// <summary>Ressource existiert nicht oder gehoert einem anderen Verkaeufer -> 404.</summary>
public sealed class NotFoundException(string errorCode, string detail)
    : DomainException(errorCode, detail);

/// <summary>Fachliche Invariante verletzt -> 409.</summary>
public class ConflictException(string errorCode, string detail)
    : DomainException(errorCode, detail);

/// <summary>Anmeldedaten oder Token ungueltig -> 401.</summary>
public sealed class UnauthorizedException(string errorCode, string detail)
    : DomainException(errorCode, detail);

/// <summary>Rolle reicht fuer diese Aktion nicht -> 403.</summary>
public sealed class ForbiddenException(string errorCode, string detail)
    : DomainException(errorCode, detail);
