using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Registration.Contracts;

/// <summary>
/// Survives the Contracts boundary because BAR.Host needs the <c>nextNumber</c>
/// field in the error response (DomainExceptionHandler) - unlike
/// <c>NumberBlockOverlapException</c>, which is handled entirely within the
/// module.
/// </summary>
public sealed class ArticleNumberConflictException(string detail, int nextNumber)
    : ConflictException("article.number_taken", detail)
{
    public int NextNumber { get; } = nextNumber;
}
