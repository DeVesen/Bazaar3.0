namespace BAR.Modules.Registration.Application.Articles.ImportExport;

public sealed record ImportRowError(int Row, string ErrorCode, string Detail);
