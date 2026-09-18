namespace Bazaar.Application.Intake;

public sealed class IntakeResult(IReadOnlyList<string> articleIds, decimal intakeFeePaid)
{
    public IReadOnlyList<string> ArticleIds { get; } = articleIds;

    public decimal IntakeFeePaid { get; } = intakeFeePaid;
}
