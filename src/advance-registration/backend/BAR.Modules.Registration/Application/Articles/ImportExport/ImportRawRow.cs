namespace BAR.Modules.Registration.Application.Articles.ImportExport;

public sealed record ImportRawRow(
    int LineNumber, string? NumberRaw, string? Name, string? Category, string? Brand, string? Size, string? PriceRaw);
