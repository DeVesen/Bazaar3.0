using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Sellers;

public sealed class DeleteSellerHandler(ISellerRepository sellerRepository, IArticleRepository articleRepository)
{
    public async Task Handle(string id, bool callerIsAdmin)
    {
        var seller = await sellerRepository.GetById(id)
            ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

        var articles = await articleRepository.GetAllBySellerId(id);

        // Nur Admins dürfen einen Verkäufer samt Artikeln löschen; Kassenpersonal darf nur
        // einen leeren Verkäufer löschen (Abbruch der Artikelannahme, Epic_Artikelannahme AC-11).
        if (!callerIsAdmin && articles.Count > 0)
        {
            throw new ConflictException($"Verkäufer hat noch {articles.Count} Artikel", "seller.has_articles");
        }

        foreach (var article in articles)
        {
            await articleRepository.Remove(article);
        }

        await sellerRepository.Remove(seller);
    }
}
