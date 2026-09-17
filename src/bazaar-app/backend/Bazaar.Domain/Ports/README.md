# Repository-Konvention

Kein `IRepository<T>`, kein `IQueryable` über die Portgrenze. Stattdessen:

- Ein Interface pro Aggregate in `Bazaar.Domain/Ports/` (z. B. `ISellerRepository`).
- Implementierung in `Bazaar.Infrastructure/Persistence/Repositories/`.
- Read-Models bekommen eigene Query-Ports, keine Wiederverwendung des
  Aggregate-Repositories für Leseabfragen (siehe CLAUDE.md: „eigene Query-Ports
  für Read-Models").

Noch keine Code-Artefakte hier — das erste fachliche Epic legt das erste
Aggregate samt Repository an und folgt dieser Konvention, statt sie neu zu
erfinden.
