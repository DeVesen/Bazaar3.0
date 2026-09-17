namespace BAR.Modules.Registration.Contracts.Articles;

public sealed record ImportArticlesCommand(string SellerId, bool IsAdmin, byte[] FileContent, string FileName);

public sealed record ImportRowErrorDto(int Row, string ErrorCode, string Detail);

/// <summary>
/// <paramref name="TotalErrorCount"/> is only populated (non-null) when
/// <paramref name="Errors"/> was truncated (see ImportArticlesCommandHandler.MaxReturnedErrors) -
/// it tells the client there were more row errors than were returned.
/// </summary>
public sealed record ImportArticlesResultDto(
    bool Success, int Created, int Updated, int Deleted, IReadOnlyList<ImportRowErrorDto> Errors, int? TotalErrorCount = null);
