# Transaktionen mit Retry

`BazaarDbContext` ist mit `EnableRetryOnFailure` konfiguriert. Jede selbst
geöffnete Transaktion (`BeginTransactionAsync` o. ä.) **muss** deshalb über
`Database.CreateExecutionStrategy().ExecuteAsync(...)` laufen — sonst wirft EF
Core beim ersten Retry-Versuch innerhalb einer offenen Transaktion.

Betrifft die fünf Transaktions-Endpoints, sobald sie in fachlichen Epics
entstehen: `intake`, `release`, `sales`, `settlement`, `import`. Kein Code
dafür in Round-3 — nur die Regel, damit sie nicht neu erfunden werden muss.
