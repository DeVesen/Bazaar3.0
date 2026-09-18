using Bazaar.Domain.Ports;

namespace Bazaar.Application.Articles;

public sealed class GetNextArticleNumberHandler(IArticleRepository articleRepository)
{
    public async Task<int> Handle()
    {
        var maxNumber = await articleRepository.GetMaxNumber();
        return (maxNumber ?? 0) + 1;
    }
}
