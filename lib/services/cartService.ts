
import api from '../api';

export interface CartItem {
  _id: string;
  variant_id: {
    _id: string;
    name: string;
    price: number;
    stock: number;
    product_id: {
      _id: string;
      name: string;
      thumbnail_url?: string;
    };
    attributes?: {
        color?: string;
        [key: string]: any;
    };
  };
  quantity: number;
  checked: boolean;
}

export interface Cart {
  _id: string;
  user_id: string;
  items: CartItem[];
}

export const cartService = {
  async getCart(): Promise<Cart> {
    const response = await api.get('/cart');
    return response.data;
  },

  async addToCart(variant_id: string, quantity: number = 1): Promise<Cart> {
    const response = await api.post('/cart/add', { variant_id, quantity });
    return response.data;
  },

  async increaseQuantity(itemId: string): Promise<Cart> {
    const response = await api.patch(`/cart/${itemId}/increase`);
    return response.data;
  },

  async decreaseQuantity(itemId: string): Promise<Cart> {
    const response = await api.patch(`/cart/${itemId}/decrease`);
    return response.data;
  },

  async toggleChecked(itemId: string): Promise<Cart> {
    const response = await api.patch(`/cart/${itemId}/toggle-checked`);
    return response.data;
  },

  async removeFromCart(itemId: string): Promise<Cart> {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  },

  getCartTotal(items: CartItem[]): number {
    return items
      .filter(item => item.checked)
      .reduce((sum, item) => sum + item.variant_id.price * item.quantity, 0);
  },

  getCartItemCount(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
};
