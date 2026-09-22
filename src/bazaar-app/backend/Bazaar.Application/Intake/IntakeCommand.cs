namespace Bazaar.Application.Intake;

/// <summary>
/// Backs POST /api/intake (api/intake.md). One request books an entire
/// seller's box of articles as a single atomic transaction — "Entweder
/// alles oder nichts."
/// </summary>
public sealed class IntakeCommand
{
    public string SellerId { get; set; } = string.Empty;
    public decimal FeeAmount { get; set; }
    public IReadOnlyList<IntakeArticleLine> Articles { get; set; } = [];
}

public sealed class IntakeArticleLine
{
    public int Number { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Size { get; set; }
    public string? Color { get; set; }
    public string? Description { get; set; }

    /// <summary>
    /// Gesetzt, wenn diese Zeile aus der Artikelannahme-Umnummerierung stammt (neuer
    /// Renumber-Popup-Weg, Epic_Artikelannahme): die Ursprungsnummer des vorregistrierten,
    /// noch nicht freigegebenen Artikels, der beim Buchen gelöscht werden soll, bevor
    /// <see cref="Number"/> als neuer Artikel angelegt wird.
    /// </summary>
    public int? DeleteArticleNumber { get; set; }
}
