using Bazaar.Domain.BlankLabels;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.BlankLabels;

/// <summary>
/// Übernimmt beim Start Bilder, die schon als Logo oder Verkäufer-Symbol in
/// <see cref="LabelPrintDefaults"/> liegen, in die Bibliothek (Namen "Logo" bzw. "Verkäufer-Symbol"),
/// sofern ihr Hash dort fehlt. Idempotent; höchstens zwei Bilder, daher ohne Höchstzahl-Prüfung.
/// </summary>
public sealed class ImportLabelPrintDefaultImagesHandler(
    ILabelPrintDefaultsRepository defaultsRepository,
    ILabelImageRepository imageRepository,
    IIdGenerator idGenerator,
    TimeProvider timeProvider)
{
    public const string LogoName = "Logo";
    public const string SellerSymbolName = "Verkäufer-Symbol";

    public async Task Handle()
    {
        var defaults = await defaultsRepository.Find();
        if (defaults is null) return;
        await ImportIfImage(defaults.Logo, LogoName);
        await ImportIfImage(defaults.SellerSymbol, SellerSymbolName);
    }

    private async Task ImportIfImage(LabelGraphic? graphic, string name)
    {
        if (graphic is not { Kind: LabelGraphicKind.Image } || !graphic.IsValid()) return;
        if (await imageRepository.FindByHash(LabelImage.ComputeContentHash(graphic.Value)) is not null) return;
        await imageRepository.Add(LabelImage.Create(idGenerator.Generate(), name, graphic.Value, timeProvider.GetUtcNow()));
    }
}
