using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Anmeldung.Domain.Exceptions;

/// <summary>
/// Zwei gleichzeitige Vergaben haben denselben freien Nummernbereich berechnet;
/// die Datenbank hat den zweiten Einfuegeversuch am EXCLUDE-Constraint
/// abgewiesen. Eigener Typ, damit die Vergabe genau diesen Fall einmal
/// wiederholen kann, ohne jede andere Konflikt-Ursache mitzufangen.
/// </summary>
public sealed class NumberBlockOverlapException(string detail)
    : ConflictException("block.overlap", detail);

/// <summary>Notfall-Pfad (api/blocks.md Abschnitt 5, Stufe 3) - im Normalbetrieb unerreichbar -> 409.</summary>
public sealed class NoFreeRangeException()
    : ConflictException("block.no_free_range", "Kein zusammenhängender freier Nummernbereich verfügbar");
