# Durchgerechnetes Beispiel: BAR (Voranmelde-App)

| Modul | Projekte | Zimmertiefe-Begründung |
|---|---|---|
| `Registration` | `.Contracts` + 1 | Default — dichtes Fachmodell (Nummernvergabe-Kaskade), aber Konsistenz mit den anderen Modulen wog schwerer als der IDE-vs-Testlauf-Vorteil |
| `SellerManagement` | `.Contracts` + 1 | Default — moderates Modell |
| `MasterData` | `.Contracts` + 1 | Default — dünnes CRUD-Modell |
| `Operations` | `.Contracts` + 1 | Default — dünnes CRUD-Modell |
| `Export` | nur 1 | kein zweiter Referenzierer — kein `.Contracts` |
| `Host`, `SharedKernel` | je 1 | — |

**Summe: 11 Projekte.** Vier davon `.Contracts`-Projekte, fünf Module, `Host` und
`SharedKernel`. Keines der Module bekam die volle Vier-Projekte-Tiefe — Konsistenz über alle
Module war der Ausschlag, nicht ein hartes Kriterium.
