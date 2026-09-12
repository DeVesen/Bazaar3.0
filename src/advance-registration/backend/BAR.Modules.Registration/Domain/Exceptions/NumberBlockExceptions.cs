using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Registration.Domain.Exceptions;

/// <summary>
/// Two concurrent allocations computed the same free number range; the
/// database rejected the second insert attempt on the EXCLUDE constraint.
/// A dedicated type so the allocation can retry exactly this case once,
/// without catching every other kind of conflict along with it.
/// </summary>
public sealed class NumberBlockOverlapException(string detail)
    : ConflictException("block.overlap", detail);

/// <summary>Emergency path (api/blocks.md section 5, stage 3) - unreachable in normal operation -> 409.</summary>
public sealed class NoFreeRangeException()
    : ConflictException("block.no_free_range", "Kein zusammenhängender freier Nummernbereich verfügbar");
