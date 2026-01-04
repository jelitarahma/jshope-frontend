// app/admin/orders/[id]/page.tsx - Order Detail Page
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { orderService, OrderDetailResponse } from '@/lib/services/orderService';
import { productService } from '@/lib/services/productService';
import Swal from 'sweetalert2';

// Theme colors
const COLORS = {
  primary: '#1B5E20',
  primaryLight: '#2E7D32',
  accent: '#F9A825',
};

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [orderData, setOrderData] = useState<OrderDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getOrderDetailAdmin(orderId);
      setOrderData(data);
      setSelectedStatus(data.order.status);
    } catch (error) {
      console.error('Error fetching order detail:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat detail order',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!orderData || selectedStatus === orderData.order.status) return;

    try {
      await orderService.updateOrderStatus(orderId, selectedStatus);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Status order berhasil diupdate',
        timer: 1500,
        showConfirmButton: false,
      });
      fetchOrderDetail();
    } catch (error) {
      console.error('Error updating status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal mengupdate status order',
      });
    }
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
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '13px',
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
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        textTransform: 'capitalize',
      }}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: `4px solid ${COLORS.primary}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#6b7280' }}>Loading order details...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Order not found</p>
      </div>
    );
  }

  const { order, items } = orderData;
  const user = typeof order.user_id === 'string' ? null : order.user_id;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => router.push('/admin/orders')}
          style={{
            padding: '10px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
            Order Details
          </h1>
          <p style={{ fontSize: '15px', color: '#6b7280' }}>
            {order.order_number}
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        {/* Left Column - Order Info & Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Order Information */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>
              Order Information
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Order Number</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{order.order_number}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Status</p>
                <div>{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Order Date</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                  {new Date(order.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Last Updated</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                  {new Date(order.updatedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>
              Customer Details
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Name</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                  {user?.username || 'N/A'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Email</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                  {user?.email || 'N/A'}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Shipping Address</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', lineHeight: '1.6' }}>
                  {order.shipping_address}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>
              Order Items ({items.length})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                  }}
                >
                  {/* Product Image */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                    <img
                      src={`http://localhost:5000${item.variant_id?.product_id?.thumbnail || item.thumbnail}`}
                      alt={item.product_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', marginBottom: '6px' }}>
                      {item.product_name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      SKU: {item.variant_id.sku}
                    </p>
                    {item.variant_attributes && Object.keys(item.variant_attributes).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        {Object.entries(item.variant_attributes).map(([key, value]) => (
                          <span
                            key={key}
                            style={{
                              fontSize: '11px',
                              padding: '4px 8px',
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '4px',
                              color: '#6b7280',
                            }}
                          >
                            {key}: {String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quantity & Price */}
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                      {productService.formatPrice(item.price)}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>
                      Qty: {item.quantity}
                    </p>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: COLORS.primary, marginTop: '8px' }}>
                      {productService.formatPrice(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Quantity */}
            <div style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'right',
            }}>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Total Quantity: <span style={{ fontWeight: '600', color: '#1f2937' }}>
                  {items.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              </p>
            </div>
          </div>

          {/* Notes */}
          {order.note && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>
                Order Notes
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                {order.note}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Payment & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Payment Summary */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>
              Payment Summary
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal Products</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                  {productService.formatPrice(order.subtotal_products)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Shipping Cost</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                  {productService.formatPrice(order.shipping_cost)}
                </span>
              </div>
              <div style={{
                paddingTop: '12px',
                marginTop: '12px',
                borderTop: '2px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>Total</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: COLORS.primary }}>
                  {productService.formatPrice(order.total_amount)}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Payment Method</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', textTransform: 'capitalize' }}>
                  {order.payment_method.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Payment Status</p>
                <div>{getPaymentBadge(order.payment_status)}</div>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>
              Shipping Information
            </h2>

            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Shipping Method</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                {order.shipping_method}
              </p>
            </div>
          </div>

          {/* Update Status */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', marginBottom: '20px' }}>
              Update Order Status
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '8px', display: 'block' }}>
                  Order Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={selectedStatus === order.status}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundColor: selectedStatus === order.status ? '#9ca3af' : COLORS.primary,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: selectedStatus === order.status ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (selectedStatus !== order.status) {
                    e.currentTarget.style.backgroundColor = COLORS.primaryLight;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedStatus !== order.status) {
                    e.currentTarget.style.backgroundColor = COLORS.primary;
                  }
                }}
              >
                Update Status
              </button>

              <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
                💡 Payment status is automatically updated by the system
              </p>
            </div>
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
