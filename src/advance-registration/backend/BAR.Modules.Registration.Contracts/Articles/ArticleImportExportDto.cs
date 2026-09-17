namespace BAR.Modules.Registration.Contracts.Articles;

public sealed record ImportArticlesCommand(string SellerId, bool IsAdmin, byte[] FileContent, string FileName);

public sealed record ImportRowErrorDto(int Row, string ErrorCode, string Detail);

public sealed record ImportArticlesResultDto(bool Success, int Created, int Updated, int Deleted, IReadOnlyList<ImportRowErrorDto> Errors);
