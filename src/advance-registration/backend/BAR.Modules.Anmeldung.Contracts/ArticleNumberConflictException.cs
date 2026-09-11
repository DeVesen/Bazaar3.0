using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Anmeldung.Contracts;

/// <summary>
/// Ueberlebt die Contracts-Grenze, weil BAR.Host das <c>nextNumber</c>-Feld in
/// der Fehlerantwort braucht (DomainExceptionHandler) - anders als
/// <c>NumberBlockOverlapException</c>, die vollstaendig innerhalb des Moduls
/// behandelt wird.
/// </summary>
public sealed class ArticleNumberConflictException(string detail, int nextNumber)
    : ConflictException("article.number_taken", detail)
{
    public int NextNumber { get; } = nextNumber;
}
