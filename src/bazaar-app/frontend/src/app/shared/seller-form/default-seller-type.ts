/** Minimal shape of a seller type needed to pick the pre-selected one. */
export interface DefaultableSellerType {
  id: string;
  sellerCount: number;
}

/**
 * Pre-selected type for a new seller ("Neuer Verkäufer" and the intake wizard): the type configured
 * under Basis-Einstellungen while it still exists, otherwise the type with the highest `sellerCount`
 * (first one encountered wins a tie).
 */
export function pickDefaultSellerType<T extends DefaultableSellerType>(
  types: readonly T[],
  configuredId: string | null,
): T | null {
  if (types.length === 0) return null;
  const configured = configuredId ? types.find((type) => type.id === configuredId) : undefined;
  if (configured) return configured;
  return types.reduce((best, current) => (current.sellerCount > best.sellerCount ? current : best));
}
