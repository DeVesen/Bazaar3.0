export type MasterDataResource = 'brands' | 'categories';

export interface MasterDataItem {
  id: string;
  name: string;
  original: boolean;
  articleCount?: number;
}

export interface MasterDataUpdatePayload {
  name: string;
  original: boolean;
}
