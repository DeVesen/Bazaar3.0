using System.IO;
using System.Text.RegularExpressions;

namespace Bazaar.Architecture.Tests;

/// <summary>
/// Sichert die Proxy-Grenzen für den Artikel-Import ab: Der Block <c>location /api/</c> in
/// <c>nginx/nginx.conf.template</c> muss Uploads einer 2-MB-Datei samt multipart-Overhead sowie die gemerkten Etiketten-Druckwerte mit zwei Bildern bis je 1 MB als Base64 (3000k) und
/// Antwortzeiten bis 3 Minuten zulassen (nginx-Standard: 1 MB und 60 Sekunden). Quelltext-Scan der echten Vorlage, ohne nginx-Start.
/// </summary>
public class NginxProxyLimitsTests
{
    private static readonly Regex ApiLocationBlock = new(@"location\s+/api/\s*\{(?<body>[^}]*)\}", RegexOptions.Compiled);

    [Theory]
    [InlineData(@"^\s*client_max_body_size\s+3000k;")]
    [InlineData(@"^\s*proxy_read_timeout\s+180s;")]
    [InlineData(@"^\s*proxy_send_timeout\s+180s;")]
    public void ApiLocation_ArticleImportLimits_ContainsDirective(string directivePattern)
    {
        // Arrange
        var apiBlock = ReadApiLocationBlock();

        // Act
        var found = Regex.IsMatch(apiBlock, directivePattern, RegexOptions.Multiline);

        // Assert
        Assert.True(found, $"Direktive '{directivePattern}' fehlt im Block 'location /api/' von nginx/nginx.conf.template.");
    }

    private static string ReadApiLocationBlock()
    {
        var template = File.ReadAllText(RepoFiles.Find(Path.Combine("nginx", "nginx.conf.template")));
        var match = ApiLocationBlock.Match(template);
        Assert.True(match.Success, "Block 'location /api/' fehlt in nginx/nginx.conf.template.");
        return match.Groups["body"].Value;
    }
}
