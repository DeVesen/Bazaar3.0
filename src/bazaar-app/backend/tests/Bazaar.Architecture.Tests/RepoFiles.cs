using System.IO;
using System.Runtime.CompilerServices;

namespace Bazaar.Architecture.Tests;

/// <summary>
/// Findet Quelldateien des Repos für Quelltext-Scans. Ausgangspunkt ist zuerst der Quellpfad dieser
/// Datei (zur Compile-Zeit eingebettet) und danach das Testverzeichnis, so dass die Tests auch mit einem
/// Ausgabeordner außerhalb des Repos (<c>-o</c>, <c>--artifacts-path</c>) laufen.
/// </summary>
internal static class RepoFiles
{
    public static string Find(string relativePathFromAncestor, [CallerFilePath] string sourceFilePath = "")
    {
        var startDirectories = new[] { Path.GetDirectoryName(sourceFilePath), AppContext.BaseDirectory };

        foreach (var start in startDirectories.Where(path => !string.IsNullOrEmpty(path)))
        {
            var directory = new DirectoryInfo(start!);
            while (directory is not null)
            {
                var candidate = Path.Combine(directory.FullName, relativePathFromAncestor);
                if (File.Exists(candidate))
                {
                    return candidate;
                }

                directory = directory.Parent;
            }
        }

        throw new FileNotFoundException($"{relativePathFromAncestor} konnte weder ausgehend vom Quellpfad noch vom Testverzeichnis gefunden werden.");
    }
}
