'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import dashboardService, { DashboardData } from '@/lib/services/dashboardService';

const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  accent: '#F9A825',
  greenBg: '#E8F5E9',
  greenBorder: '#C8E6C9',
  blue: '#2196F3',
  purple: '#9C27B0',
  orange: '#FF9800',
  red: '#F44336',
};

const CHART_COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336'];

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('Admin');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      window.location.href = '/auth?mode=login';
      return;
    }

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUsername(user.username || 'Admin');
      } catch {
        setUsername('Admin');
      }
    }

    const fetchData = async () => {
      try {
        const dashboardData = await dashboardService.getDashboardAnalytics();
        setData(dashboardData);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        
        if (error.response && error.response.status === 401) {
          console.error('Authentication failed - redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth?mode=login';
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPercentageIcon = (percentage: number) => {
    return percentage >= 0 ? '↑' : '↓';
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '4px solid #E8F5E9', 
            borderTop: `4px solid ${COLORS.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          Sales Report
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div style={{ 
            background: '#bbf7d0',
            borderRadius: '12px', 
            padding: '20px',
            border: '1px solid #86efac'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: 'white', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '24px', height: '24px', color: COLORS.primary }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p style={{ fontSize: '18px', color: '#166534', marginBottom: '8px', fontWeight: '600' }}>Total Sales</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#166534', lineHeight: '1' }}>
              {dashboardService.formatCurrency(data.summary.totalSales.current)}
            </p>
          </div>

          <div style={{ 
            background: '#6cc18a',
            borderRadius: '12px', 
            padding: '20px',
            border: '1px solid #4ade80'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: 'white', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '24px', height: '24px', color: COLORS.primary }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <p style={{ fontSize: '18px', color: '#166534', marginBottom: '8px', fontWeight: '600' }}>Total Orders</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#166534', lineHeight: '1' }}>
              {data.summary.totalOrders.current}
            </p>
          </div>

          <div style={{ 
            background: '#6cc18a',
            borderRadius: '12px', 
            padding: '20px',
            border: '1px solid #4ade80'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: 'white', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '24px', height: '24px', color: COLORS.primary }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
            </div>
            <p style={{ fontSize: '18px', color: '#166534', marginBottom: '8px', fontWeight: '600' }}>Products Sold</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#166534', lineHeight: '1' }}>
              {data.summary.totalProductsSold.current}
            </p>
          </div>

          <div style={{ 
            background: '#bbf7d0',
            borderRadius: '12px', 
            padding: '20px',
            border: '1px solid #86efac'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: 'white', 
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '24px', height: '24px', color: COLORS.primary }} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
            <p style={{ fontSize: '18px', color: '#166534', marginBottom: '8px', fontWeight: '600' }}>Total Customers</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#166534', lineHeight: '1' }}>
              {data.summary.totalCustomers}
            </p>
          </div>
        </div>

        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px', 
          padding: '20px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
              Product Statistic
            </h3>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Track your product sales</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data.productsByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="count"
                nameKey="name"
                label={false}
              >
                {data.productsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: '12px' }}>
            {data.productsByCategory.map((category, index) => (
              <div key={category.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                  }} />
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{category.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>{category.count}</span>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: '600',
                    color: COLORS.primary,
                    backgroundColor: COLORS.greenBg,
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    +{category.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px', 
          padding: '20px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '4px' }}>
              Sales Trend
            </h3>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Monthly sales performance</p>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.monthlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '11px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: any) => dashboardService.formatCurrency(value)}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke={COLORS.blue} 
                strokeWidth={2}
                dot={{ fill: COLORS.blue, r: 3 }}
                activeDot={{ r: 5 }}
                name="Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '12px', 
          padding: '20px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>Recent Orders</h3>
            <Link 
              href="/admin/orders"
              style={{ 
                textDecoration: 'none',
                padding: '6px 12px', 
                fontSize: '12px', 
                fontWeight: '600', 
                color: COLORS.primary, 
                backgroundColor: COLORS.greenBg, 
                borderRadius: '6px' 
              }}
            >
              View All
            </Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <th style={{ padding: '10px 6px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>Order</th>
                  <th style={{ padding: '10px 6px', textAlign: 'right', fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>Total</th>
                  <th style={{ padding: '10px 6px', textAlign: 'center', fontSize: '11px', fontWeight: '600', color: '#6b7280' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.slice(0, 6).map((order) => (
                  <tr key={order.order_number} style={{ borderBottom: '1px solid #f9fafb' }}>
                    <td style={{ padding: '10px 6px' }}>
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', fontFamily: 'monospace', marginBottom: '2px' }}>
                          {order.order_number}
                        </p>
                        <p style={{ fontSize: '10px', color: '#9ca3af' }}>
                          {order.customer}
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: '10px 6px', fontSize: '12px', fontWeight: '600', color: '#1f2937', textAlign: 'right' }}>
                      {dashboardService.formatCurrency(order.total)}
                    </td>
                    <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: '600',
                        padding: '3px 6px',
                        borderRadius: '9999px',
                        backgroundColor: `${dashboardService.getStatusColor(order.status)}20`,
                        color: dashboardService.getStatusColor(order.status)
                      }}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
