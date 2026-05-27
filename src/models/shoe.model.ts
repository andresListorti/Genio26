export interface ShoeStockVariant {
  size: number;
  color: string;
  stock: number;
  sku?: string;
}

export interface Shoe {
  id: string;
  brand: string;
  model: string;
  price: number;
  currency: string;
  description: string;
  imageUrl?: string;
  category?: string;
  variants: ShoeStockVariant[];
  createdAt: string;
  updatedAt: string;
}

export type ShoeCreateInput = Omit<Shoe, 'id' | 'createdAt' | 'updatedAt'> & {
  currency?: string;
};

export type ShoeUpdateInput = Partial<Omit<Shoe, 'id' | 'createdAt'>>;
