import api from '../api';

export interface DashboardSummary {
  totalSales: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  totalOrders: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  totalProductsSold: {
    current: number;
    previous: number;
    percentageChange: number;
  };
  totalCustomers: number;
  newCustomersThisMonth: number;
}

export interface ProductByCategory {
  name: string;
  count: number;
  percentage: number;
  sales: number;
  [key: string]: any; // Index signature for Recharts compatibility
}

export interface MonthlySale {
  month: string;
  year: number;
  sales: number;
  orders: number;
}

export interface RecentOrder {
  order_number: string;
  customer: string;
  total: number;
  status: string;
  payment_status: string;
  date: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  productsByCategory: ProductByCategory[];
  monthlySales: MonthlySale[];
  recentOrders: RecentOrder[];
}

const dashboardService = {
  async getDashboardAnalytics(): Promise<DashboardData> {
    const response = await api.get('/dashboard');
    return response.data;
  },

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  },

  formatNumber(num: number): string {
    return new Intl.NumberFormat('id-ID').format(num);
  },

  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      delivered: '#2E7D32',
      processing: '#F9A825',
      pending: '#FB8C00',
      cancelled: '#D32F2F',
      paid: '#2E7D32',
      unpaid: '#FB8C00',
    };
    return statusColors[status.toLowerCase()] || '#6b7280';
  },
};

export default dashboardService;
