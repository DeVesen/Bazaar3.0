namespace BAR.Modules.Registration.Application.Articles.ImportExport;

public enum ImportActionKind { Create, Update, Delete, NoOp }

public sealed record ImportAction(
    ImportActionKind Kind, int Number, string? Name, string? Category, string? Brand, string? Size, decimal? Price);
