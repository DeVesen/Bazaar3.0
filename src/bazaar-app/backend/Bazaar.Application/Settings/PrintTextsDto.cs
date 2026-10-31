using Bazaar.Domain.Settings;

namespace Bazaar.Application.Settings;

public sealed record PrintTextsDto(string Text1, string Text2, string Text3, string Text4, string Text5)
{
    public static PrintTextsDto From(PrintTexts texts) =>
        new(texts.Text1, texts.Text2, texts.Text3, texts.Text4, texts.Text5);

    public PrintTexts ToDomain() => new(Text1, Text2, Text3, Text4, Text5);
}

public sealed record AushangTextsDto(string Text1, string Text2, string Text3, string Text4)
{
    public static AushangTextsDto From(AushangTexts texts) =>
        new(texts.Text1, texts.Text2, texts.Text3, texts.Text4);

    public AushangTexts ToDomain() => new(Text1, Text2, Text3, Text4);
}

public sealed record PrintTextsResponse(
    PrintTextsDto AbgabeBeleg,
    PrintTextsDto VerkaeuferUebersicht,
    AushangTextsDto ArticleAushang);
