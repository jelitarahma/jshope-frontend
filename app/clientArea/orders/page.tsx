'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { orderService, Order } from '@/lib/services/orderService';
import { midtransService } from '@/lib/services/midtransService';
import { productService } from '@/lib/services/productService';
import Swal from 'sweetalert2';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth?mode=login');
      return;
    }
    fetchOrders();
  }, [router]);

  useEffect(() => {
    // Load Midtrans script for Pay Now functionality
    const loadMidtrans = async () => {
      try {
        const { client_key, is_production } = await midtransService.getClientKey();
        await midtransService.loadSnapScript(client_key, is_production);
      } catch (error) {
        console.error('Error loading Midtrans:', error);
      }
    };
    loadMidtrans();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = (order: Order) => {
    if (!order.snap_token) return;

    midtransService.openSnapPopup(
      order.snap_token,
      () => {
        Swal.fire('Success', 'Payment successful!', 'success');
        fetchOrders();
      },
      () => {
        Swal.fire('Pending', 'Payment pending...', 'info');
        fetchOrders();
      },
      () => {
        Swal.fire('Error', 'Payment failed', 'error');
      },
      () => {
        fetchOrders();
      }
    );
  };

  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Unpaid' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => {
        if (activeTab === 'pending') return order.payment_status === 'unpaid' && order.status !== 'cancelled';
        return order.status === activeTab;
      });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 py-12">
        <div className="max-w-5xl mx-auto px-4">
             <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 w-48 rounded" />
                <div className="h-64 bg-gray-100 rounded-xl" />
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50/50">
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and track your orders</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 scrollbar-hide">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                        px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                        ${activeTab === tab.id 
                            ? 'bg-stone-900 text-white' 
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}
                    `}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
            {filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                    <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet in this category.</p>
                    <Link href="/products" className="text-amber-600 font-medium hover:underline">Start Shopping</Link>
                </div>
            ) : (
                filteredOrders.map((order) => (
                    <div key={order._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-bold text-gray-900 text-lg">Order #{order.order_number}</span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${orderService.getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="text-xl font-bold text-amber-600">{productService.formatPrice(order.total_amount)}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="text-sm text-gray-600">
                                    <span className="inline-block mr-4"><span className="font-semibold">Items:</span> {order.subtotal_products} items</span>
                                    <span className="inline-block"><span className="font-semibold">Payment:</span> {order.payment_method === 'cod' ? 'Cash On Delivery' : order.payment_status}</span>
                                </div>
                                
                                <div className="flex gap-3 w-full sm:w-auto">
                                    {order.payment_status === 'unpaid' && order.payment_method !== 'cod' && order.status !== 'cancelled' && (
                                        <button 
                                            onClick={() => handlePay(order)}
                                            className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
                                        >
                                            Pay Now
                                        </button>
                                    )}
                                    <Link 
                                        href={`/clientArea/orders/${order._id}`}
                                        className="flex-1 sm:flex-none px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}
