namespace Bazaar.Application.Settings;

/// <summary>
/// Wird direkt aus dem JSON-Body von PUT /api/settings/print-texts gebunden.
/// Ersetzt alle drei Freitext-Sätze vollständig.
/// </summary>
public sealed class UpdatePrintTextsCommand
{
    public PrintTextsDto AbgabeBeleg { get; set; } = null!;
    public PrintTextsDto VerkaeuferUebersicht { get; set; } = null!;
    public AushangTextsDto ArticleAushang { get; set; } = null!;
}
