
import api from '../api';

export interface OrderItem {
  _id: string;
  order_id: string;
  variant_id: {
    _id: string;
    product_id: {
      _id: string;
      name: string;
      slug: string;
      thumbnail: string;
    };
    sku: string;
    attributes: Record<string, any>;
    price: number;
    stock: number;
    weight: number;
    is_active: boolean;
  };
  product_name: string;
  product_slug: string;
  thumbnail: string;
  variant_attributes: Record<string, any>;
  quantity: number;
  price: number;
  subtotal: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  order_number: string;
  user_id: {
    _id: string;
    username: string;
    email: string;
  } | string;
  total_amount: number;
  subtotal_products: number;
  shipping_address: string;
  shipping_method: string;
  shipping_cost: number;
  payment_method: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'failed' | 'refunded';
  snap_token?: string;
  snap_redirect_url?: string;
  note?: string;
  va_numbers?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutData {
  shipping_address: string;
  shipping_method: string;
  shipping_cost: number;
  payment_method: string;
  note?: string;
}

export interface CheckoutResponse {
  message: string;
  order: Order;
  snap_token?: string;
  snap_redirect_url?: string;
}

export interface CheckoutReview {
  items: Array<{
    variant_id: string;
    variant_name: string;
    product_name: string;
    price: number;
    quantity: number;
    subtotal: number;
    thumbnail_url?: string;
    thumbnail?: string;
  }>;
  subtotal: number;
}

export interface OrdersAdminResponse {
  orders: Order[];
  currentPage: number;
  totalPages: number;
  totalOrders: number;
}

export interface OrderDetailResponse {
  order: Order;
  items: OrderItem[];
}

export const orderService = {

  async getOrders(): Promise<Order[]> {
    const response = await api.get('/orders');
    return response.data;
  },

  async getCheckoutReview(): Promise<CheckoutReview> {
    const response = await api.get('/orders/review');
    return response.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async checkout(data: CheckoutData): Promise<CheckoutResponse> {
    const response = await api.post('/orders/checkout', data);
    return response.data;
  },

  async payOrder(id: string): Promise<Order> {
    const response = await api.patch(`/orders/${id}/pay`);
    return response.data;
  },

  async cancelOrder(id: string): Promise<Order> {
    const response = await api.patch(`/orders/${id}/cancel`);
    return response.data;
  },


  async getAllOrders(filters?: {
    status?: string;
    payment_status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<OrdersAdminResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.payment_status) params.append('payment_status', filters.payment_status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sort) params.append('sort', filters.sort);

    const response = await api.get(`/orders/admin/all?${params.toString()}`);
    return response.data;
  },

  async getOrderDetailAdmin(id: string): Promise<OrderDetailResponse> {
    const response = await api.get(`/orders/admin/${id}`);
    return response.data;
  },

  async updateOrderStatus(
    id: string,
    status?: string,
    payment_status?: string
  ): Promise<Order> {
    const response = await api.patch(`/orders/admin/${id}/status`, {
      status,
      payment_status,
    });
    return response.data;
  },

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  },

  getPaymentStatusColor(status: string): string {
    const colors: Record<string, string> = {
      unpaid: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  },
};
