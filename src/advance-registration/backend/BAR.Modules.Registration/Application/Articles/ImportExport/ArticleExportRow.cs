namespace BAR.Modules.Registration.Application.Articles.ImportExport;

public sealed record ArticleExportRow(int Number, string? Name, string? Category, string? Brand, string? Size, decimal? Price);
