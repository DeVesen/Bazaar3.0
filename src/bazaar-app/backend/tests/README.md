# Tests

Die Integrationstests in `Bazaar.Api.IntegrationTests` setzen einen laufenden
Docker-Daemon voraus, da `PostgresWebApplicationFactory` per Testcontainers einen
echten PostgreSQL-Container (`postgres:18-alpine`) startet, bevor die App-Endpoints
erreichbar sind. Eine `TestcontainersException` bzw. eine andere
`DotNet.Testcontainers.Exceptions.*`-Ausnahme beim Testlauf deutet auf einen
fehlenden oder nicht erreichbaren Docker-Daemon hin — in dem Fall Docker Desktop
bzw. den Docker-Daemon starten und den Testlauf wiederholen.
