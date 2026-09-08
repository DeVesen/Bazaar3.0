using System.Reflection;
using NetArchTest.Rules;

namespace BAR.Architecture.Tests;

/// <summary>
/// Schliesst die Luecke, die Projektreferenzen offen lassen: sie verhindern eine
/// falsche Richtung zwischen Projekten, aber nicht, dass eine Domain-Klasse
/// Web- oder Serialisierungs-Annotationen traegt (VPROJ-S05 AC-5).
/// </summary>
public class DependencyDirectionTests
{
    private static readonly Assembly Domain = typeof(Domain.Common.EntityId).Assembly;
    private static readonly Assembly Application = typeof(Application.Abstractions.IClock).Assembly;
    private static readonly Assembly Infrastructure = typeof(Infrastructure.Time.SystemClock).Assembly;

    [Fact]
    public void Domain_Always_HasNoDependencyOnFrameworks()
    {
        // Arrange & Act
        var result = Types.InAssembly(Domain)
            .Should()
            .NotHaveDependencyOnAny(
                "Microsoft.EntityFrameworkCore",
                "Microsoft.AspNetCore",
                "System.Text.Json")
            .GetResult();

        // Assert
        result.IsSuccessful.Should().BeTrue(FailureMessage(result));
    }

    [Fact]
    public void Application_Always_HasNoDependencyOnInfrastructure()
    {
        // Arrange & Act
        var result = Types.InAssembly(Application)
            .Should()
            .NotHaveDependencyOn("BAR.Infrastructure")
            .GetResult();

        // Assert
        result.IsSuccessful.Should().BeTrue(FailureMessage(result));
    }

    [Fact]
    public void Infrastructure_Always_ContainsNoHandlers()
    {
        // Arrange & Act
        var result = Types.InAssembly(Infrastructure)
            .Should()
            .NotHaveNameEndingWith("Handler")
            .GetResult();

        // Assert
        result.IsSuccessful.Should().BeTrue(FailureMessage(result));
    }

    [Fact]
    public void RepositoryPorts_Always_LiveInDomainPorts()
    {
        // Arrange & Act
        var result = Types.InAssembly(Domain)
            .That()
            .HaveNameEndingWith("Repository")
            .And()
            .AreInterfaces()
            .Should()
            .ResideInNamespaceStartingWith("BAR.Domain.Ports")
            .GetResult();

        // Assert — greift erst, sobald die ersten Ports existieren (VPROJ-S04).
        result.IsSuccessful.Should().BeTrue(FailureMessage(result));
    }

    private static string FailureMessage(NetArchTest.Rules.TestResult result) =>
        result.FailingTypeNames is { Count: > 0 }
            ? $"Verletzende Typen: {string.Join(", ", result.FailingTypeNames)}"
            : "Regel verletzt.";
}
