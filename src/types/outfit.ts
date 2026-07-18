// 경로: src/types/outfit.ts
export type SimilarItem = {
  id: string;
  name: string;
  image: any;
};

export type OutfitItemType = 'closet' | 'recommended';

export type OutfitItem = {
  id: string;
  name: string;
  image: any;
  type: OutfitItemType;
  tags: string[];
  similarItems: SimilarItem[];
};