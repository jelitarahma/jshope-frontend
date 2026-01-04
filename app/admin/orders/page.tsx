'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { orderService, Order } from '@/lib/services/orderService';
import { productService } from '@/lib/services/productService';
import Swal from 'sweetalert2';

const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  accent: '#F9A825',
  accentLight: '#FDD835',
  lightGreen: '#E8F5E9',
  lighterGreen: '#F1F8E9',
  hoverGreen: '#C8E6C9',
};

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const paymentStatusOptions = ['unpaid', 'paid', 'failed', 'refunded'];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, paymentFilter, searchQuery, sortOrder]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getAllOrders({
        page: currentPage,
        limit: 100,
        status: statusFilter || undefined,
        payment_status: paymentFilter || undefined,
        sort: sortOrder === 'newest' ? '-createdAt' : 'createdAt',
      });
      
      let filteredOrders = data.orders || [];
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredOrders = filteredOrders.filter((order) => {
          const orderNumber = (order.order_number || '').toLowerCase();
          const userName = typeof order.user_id === 'string' 
            ? '' 
            : ((order.user_id?.username || '') + ' ' + (order.user_id?.email || '')).toLowerCase();
          
          return orderNumber.includes(query) || userName.includes(query);
        });
      }
      
      setOrders(filteredOrders);
      setTotalPages(1);
      setTotalOrders(filteredOrders.length);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat data orders',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (order: Order, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(order._id, newStatus);
      Swal.fire({ 
        icon: 'success', 
        title: 'Berhasil!', 
        text: 'Status order berhasil diupdate',
        timer: 1500, 
        showConfirmButton: false 
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({ 
        icon: 'error', 
        title: 'Error', 
        text: 'Gagal mengupdate status order' 
      });
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    setPaymentFilter('');
    setSearchQuery('');
    setSortOrder('newest');
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      pending: { bg: '#FFF3E0', text: '#E65100' },
      processing: { bg: '#E3F2FD', text: '#1565C0' },
      shipped: { bg: '#F3E5F5', text: '#6A1B9A' },
      delivered: { bg: '#E8F5E9', text: '#2E7D32' },
      cancelled: { bg: '#FFEBEE', text: '#C62828' },
    };
    const style = styles[status] || { bg: '#F5F5F5', text: '#616161' };
    
    return (
      <span style={{
        backgroundColor: style.bg,
        color: style.text,
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'capitalize',
      }}>
        {status}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      unpaid: { bg: '#FFF3E0', text: '#E65100' },
      paid: { bg: '#E8F5E9', text: '#2E7D32' },
      failed: { bg: '#FFEBEE', text: '#C62828' },
      refunded: { bg: '#F5F5F5', text: '#616161' },
    };
    const style = styles[status] || { bg: '#F5F5F5', text: '#616161' };
    
    return (
      <span style={{
        backgroundColor: style.bg,
        color: style.text,
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'capitalize',
      }}>
        {status}
      </span>
    );
  };

  const getUserName = (user: any) => {
    if (typeof user === 'string') return 'N/A';
    return user?.username || user?.email || 'N/A';
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
          Orders Management
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7280' }}>
          Total: <span style={{ color: COLORS.primary, fontWeight: '600' }}>{totalOrders} orders</span>
        </p>
      </div>


      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>

          <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
            <svg 
              style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                width: '18px', 
                height: '18px', 
                color: '#9ca3af' 
              }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari order number atau customer..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              style={{
                width: '100%',
                padding: '10px 14px 10px 44px',
                fontSize: '14px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = COLORS.primary;
                e.target.style.boxShadow = `0 0 0 3px ${COLORS.primary}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>


          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '10px 32px 10px 12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              backgroundColor: 'white',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '16px',
            }}
          >
            <option value="">All Status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>


          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '10px 32px 10px 12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              backgroundColor: 'white',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '16px',
            }}
          >
            <option value="">All Payment</option>
            {paymentStatusOptions.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>


          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            style={{
              padding: '10px 32px 10px 12px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              backgroundColor: 'white',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '16px',
            }}
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
          </select>


          {(statusFilter || paymentFilter || searchQuery || sortOrder !== 'newest') && (
            <button
              onClick={clearFilters}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                color: COLORS.primary,
                backgroundColor: `${COLORS.primary}10`,
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${COLORS.primary}20`}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${COLORS.primary}10`}
            >
              Clear All
            </button>
          )}
        </div>
      </div>


      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.primary, color: 'white' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Order Number</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Customer</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Payment</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Total</th>
                <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: `3px solid ${COLORS.primary}`, 
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }} />
                      <span style={{ color: '#6b7280' }}>Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '48px' }}>📦</span>
                      <span style={{ color: '#6b7280', fontSize: '16px' }}>No orders found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr
                    key={order._id}
                    style={{
                      backgroundColor: index % 2 === 0 ? COLORS.lightGreen : COLORS.lighterGreen,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.hoverGreen}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? COLORS.lightGreen : COLORS.lighterGreen}
                    onClick={() => router.push(`/admin/orders/${order._id}`)}
                  >
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>{order.order_number}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div>
                        <p style={{ fontWeight: '500', color: '#374151', marginBottom: '2px' }}>
                          {getUserName(order.user_id)}
                        </p>
                        <p style={{ fontSize: '12px', color: '#6b7280', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.shipping_address}
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }} onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order, e.target.value)}
                        style={{
                          padding: '6px 28px 6px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          border: '1px solid #e5e7eb',
                          borderRadius: '20px',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          outline: 'none',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 6px center',
                          backgroundSize: '14px',
                        }}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {getPaymentBadge(order.payment_status)}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>
                        {productService.formatPrice(order.total_amount)}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => router.push(`/admin/orders/${order._id}`)}
                        style={{
                          padding: '8px 16px',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: 'white',
                          backgroundColor: COLORS.primary,
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.primaryLight}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.primary}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>


        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '20px',
            borderTop: '1px solid #e5e7eb',
          }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                color: currentPage === 1 ? '#9ca3af' : COLORS.primary,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                color: currentPage === totalPages ? '#9ca3af' : COLORS.primary,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
