using Bazaar.Api.Startup;
using Microsoft.Extensions.Logging;

namespace Bazaar.Api.UnitTests.Startup;

public class OptionalStartupTaskTests
{
    [Fact]
    public async Task RunAsync_TaskThrows_LogsErrorAndDoesNotThrow()
    {
        // Arrange
        var logger = new CapturingLogger();
        var failure = new InvalidOperationException("Import kaputt");

        // Act
        await OptionalStartupTask.RunAsync(() => throw failure, logger, "Bild-Import");

        // Assert
        var entry = Assert.Single(logger.Entries);
        Assert.Equal(LogLevel.Error, entry.Level);
        Assert.Same(failure, entry.Exception);
        Assert.Contains("Bild-Import", entry.Message);
    }

    [Fact]
    public async Task RunAsync_TaskSucceeds_LogsNothing()
    {
        // Arrange
        var logger = new CapturingLogger();
        var ran = false;

        // Act
        await OptionalStartupTask.RunAsync(() => { ran = true; return Task.CompletedTask; }, logger, "Bild-Import");

        // Assert
        Assert.True(ran);
        Assert.Empty(logger.Entries);
    }

    private sealed class CapturingLogger : ILogger
    {
        public List<(LogLevel Level, Exception? Exception, string Message)> Entries { get; } = [];

        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception,
            Func<TState, Exception?, string> formatter) =>
            Entries.Add((logLevel, exception, formatter(state, exception)));
    }
}
