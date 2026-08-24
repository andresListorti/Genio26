export interface ShoeStockVariant {
  size: number;
  color: string;
  stock: number;
  reserved?: number; // units held pending payment confirmation
  sku?: string;
}

/** Genaro collection a shoe belongs to. Drives /collections/men & /collections/women. */
export type ShoeGender = 'men' | 'women';

export interface Shoe {
  id: string;
  brand: string;
  model: string;
  price: number;
  currency: string;
  description: string;
  imageUrl?: string;
  images?: string[];
  category?: string;
  gender: ShoeGender;
  variants: ShoeStockVariant[];
  createdAt: string;
  updatedAt: string;
}

export type ShoeCreateInput = Omit<Shoe, 'id' | 'createdAt' | 'updatedAt'> & {
  currency?: string;
};

export type ShoeUpdateInput = Partial<Omit<Shoe, 'id' | 'createdAt'>>;
