namespace BAR.Domain.Exceptions;

public sealed class ArticleNumberConflictException(string detail, int nextNumber)
    : ConflictException("article.number_taken", detail)
{
    public int NextNumber { get; } = nextNumber;
}
