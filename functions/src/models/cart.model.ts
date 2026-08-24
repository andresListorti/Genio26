export interface CartItem {
  shoeId: string;
  brand: string;
  model: string;
  size: number;
  color: string;
  unitPrice: number;
  quantity: number;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddCartItemInput {
  shoeId: string;
  size: number;
  color: string;
  quantity: number;
}
