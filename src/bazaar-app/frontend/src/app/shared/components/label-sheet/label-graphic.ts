/** Icon-Liste für Logo und Verkäufer-Symbol; Schlüssel wie im Backend (`^[a-z0-9-]{1,30}$`). */
export const LABEL_ICON_KEYS = ['star', 'heart', 'sun', 'moon', 'flower', 'leaf', 'crown', 'gift', 'cloud'] as const;

export type LabelIconKey = (typeof LABEL_ICON_KEYS)[number];

export const LABEL_ICON_TITLES: Record<LabelIconKey, string> = {
  star: 'Stern',
  heart: 'Herz',
  sun: 'Sonne',
  moon: 'Mond',
  flower: 'Blume',
  leaf: 'Blatt',
  crown: 'Krone',
  gift: 'Geschenk',
  cloud: 'Wolke',
};

/** Logo oder Verkäufer-Symbol: Icon der Liste oder eigenes Bild als Data-URL; JSON wie `LabelGraphic` im Backend. */
export type LabelGraphic = { kind: 'icon'; value: LabelIconKey } | { kind: 'image'; value: string };

/** Was auf jedem Etikett eines Drucks gleich ist. */
export interface LabelContent {
  logo: LabelGraphic | null;
  sellerSymbol: LabelGraphic | null;
  currencySymbol: string;
}

export const EMPTY_LABEL_CONTENT: LabelContent = { logo: null, sellerSymbol: null, currencySymbol: '€' };
