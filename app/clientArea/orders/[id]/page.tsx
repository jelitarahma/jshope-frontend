'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { orderService, Order, OrderItem } from '@/lib/services/orderService';
import { productService } from '@/lib/services/productService';
import { midtransService } from '@/lib/services/midtransService';
import Swal from 'sweetalert2';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (resolvedParams) {
        fetchOrderDetail(resolvedParams.id);
    }
  }, [resolvedParams]);

  const fetchOrderDetail = async (id: string) => {
    try {
      const data = await orderService.getOrderById(id);
      const responseData = data as any;
      
      if (responseData.order) {
        setOrder(responseData.order);
        setItems(responseData.items || []);
      } else {
        setOrder(responseData);
        setItems(responseData.items || responseData.order_items || []);
      }
      
    } catch (error) {
      console.error('Error fetching order detail:', error);
      Swal.fire('Error', 'Failed to load order details.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = () => {
      if (!order || !order.snap_token) return;

      // Ensure midtrans script is loaded (it should be if we are in this flow, otherwise we might need to load it here too)
      // For safety, let's load it if window.snap is undefined? 
      // Or just assume the previous page loaded it? Better to load it.
      // However due to async nature, let's just redirect to list for now as a safe fallback?
      // Or better: load it on mount in this page too.
      midtransService.openSnapPopup(
        order.snap_token,
        () => {
            Swal.fire('Success', 'Payment successful!', 'success').then(() => fetchOrderDetail(order._id));
        },
        () => {
             Swal.fire('Pending', 'Payment pending...', 'info');
        },
        () => {
             Swal.fire('Error', 'Payment failed', 'error');
        },
        () => {}
      );
  };
  
  // Load Link midtrans script
  useEffect(() => {
      const loadScript = async () => {
          try {
             const key = await midtransService.getClientKey();
             await midtransService.loadSnapScript(key.client_key, key.is_production);
          } catch(e) { console.error(e) }
      };
      loadScript();
  }, []);

  if (isLoading || !order) {
    return (
      <div className="min-h-screen bg-stone-50/50 py-10">
        <div className="max-w-6xl mx-auto px-5">
             <div className="animate-pulse space-y-5">
                <div className="h-10 bg-gray-200 w-full rounded-xl" />
                <div className="grid md:grid-cols-3 gap-5">
                    <div className="md:col-span-2 h-96 bg-gray-100 rounded-xl" />
                    <div className="h-96 bg-gray-100 rounded-xl" />
                </div>
             </div>
        </div>
      </div>
    );
  }

  const isPaid = order.payment_status === 'paid';
  const isCancelled = order.status === 'cancelled';
  const isUnpaid = order.payment_status === 'unpaid' && !isCancelled;

  // Banner Config
  let bannerColor = 'bg-blue-50 border-blue-100 text-blue-800';
  let bannerIcon = (
    <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  );
  let bannerTitle = `Order Status: ${order.status}`;
  let bannerDesc = `Your order is currently ${order.status}.`;

  if (isPaid || order.status === 'delivered') {
      bannerColor = 'bg-green-50 border-green-100 text-green-800';
      bannerIcon = <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
      bannerTitle = order.status === 'delivered' ? 'Order Delivered' : 'Payment Confirmed';
      bannerDesc = order.status === 'delivered' ? 'Your package has been delivered successfully.' : 'We have received your payment. Your order will be processed shortly.';
  } else if (isCancelled) {
      bannerColor = 'bg-red-50 border-red-100 text-red-800';
      bannerIcon = <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
      bannerTitle = 'Order Cancelled';
      bannerDesc = 'This order has been cancelled.';
  } else if (isUnpaid) {
      bannerColor = 'bg-amber-50 border-amber-100 text-amber-800';
      bannerIcon = <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      bannerTitle = 'Awaiting Payment';
      bannerDesc = 'Please complete your payment to proceed with the order.';
  }

  return (
    <div className="min-h-screen bg-stone-50/30 font-sans text-stone-900 pb-10">
      
      {/* Top Navigation / Breadcrumb - simplified */}
      <div className="bg-white border-b border-gray-100 py-4 px-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center mb-2">
             <div className="flex items-center gap-2">
                 <button onClick={() => router.push('/clientArea/orders')} className="text-stone-500 hover:text-stone-900 transition-colors font-medium text-sm">
                     My Orders
                 </button>
                 <span className="text-stone-300">/</span>
                 <span className="text-stone-900 font-bold text-sm">Order #{order.order_number}</span>
             </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-3">
        
        {/* Status Banner */}
        <div className={`p-3 rounded-2xl border flex gap-4 items-start mb-8 ${bannerColor}`}>
            <div className="mt-0.5 bg-white bg-opacity-60 p-2 rounded-full">
                {bannerIcon}
            </div>
            <div>
                <h4 className="font-bold text-lg mb-1">{bannerTitle}</h4>
                <p className="text-sm opacity-90 mb-0">{bannerDesc}</p>
            </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mt-3">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-8 h-fit">
                
                {/* Booking Details Card */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-lg text-gray-900 mb-6 pb-4 border-b border-gray-50">Order Details</h3>
                    
                    <div className="grid sm:grid-cols-2 gap-y-8 gap-x-4">
                        {/* Guest / User */}
                        <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">CUSTOMER</p>
                            <p className="font-bold text-stone-900 text-sm">{typeof order.user_id === 'object' ? (order.user_id as any).username : 'Guest'}</p>
                            <p className="text-sm text-gray-500">{typeof order.user_id === 'object' ? (order.user_id as any).email : ''}</p>
                        </div>

                        {/* Order Date */}
                        <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">DATE PLACED</p>
                            <p className="font-bold text-stone-900 text-sm">
                                {new Date(order.createdAt).toLocaleDateString('en-GB', {weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'})}
                            </p>
                            <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})}
                            </p>
                        </div>

                         {/* Booking Number */}
                         <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">ORDER ID</p>
                            <p className="font-bold text-stone-900 text-sm">#{order.order_number}</p>
                        </div>

                        {/* Payment Method */}
                        <div>
                             <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">PAYMENT</p>
                             <p className="font-bold text-stone-900 text-sm capitalize">{order.payment_method === 'midtrans' ? 'Online Payment' : order.payment_method}</p>
                             <p className={`text-xs font-bold capitalize mt-1 inline-flex items-center gap-1 ${isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                                 <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-green-600' : 'bg-amber-600'}`} />
                                 {order.payment_status}
                             </p>
                        </div>

                        {/* Address (Full Width) */}
                        <div className="sm:col-span-2">
                             <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-2">SHIPPING ADDRESS & METHOD</p>
                             <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                                 <p className="font-bold text-stone-900 text-sm mb-1">{order.shipping_method}</p>
                                 <p className="text-sm text-gray-600 leading-relaxed">{order.shipping_address}</p>
                                 {order.note && (
                                     <div className="mt-3 pt-3 border-t border-stone-200">
                                         <p className="text-xs text-gray-500 italic">Note: "{order.note}"</p>
                                     </div>
                                 )}
                             </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Right Column: Summary */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Product Summary Card */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <h5 className="font-bold text-gray-900 mb-6">Reservation summary</h5>
                    
                    <div className="mb-6">
                         <div className="flex justify-between text-xs text-gray-400 uppercase font-bold mb-2">
                             <span>TOTAL ITEMS</span>
                             <span>{items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                         </div>
                         <div className="h-px bg-gray-100 w-full mb-4" />
                         
                         {/* Items List (Simplified) */}
                         <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                             {items.map((item, idx) => (
                                 <div key={idx} className="group">
                                     <p className="text-sm font-bold text-stone-800 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors mb-0">
                                         {item.product_name}
                                     </p>
                                     {item.variant_attributes?.color && (
                                         <p className="text-xs text-stone-400 mt-0.5 mb-0">{item.variant_attributes.color}</p>
                                     )}
                                     <div className="flex justify-between mt-1 text-xs text-stone-500">
                                         <span>Qty: {item.quantity}</span>
                                         <span className="font-medium text-stone-700">{productService.formatPrice(item.subtotal)}</span>
                                     </div>
                                 </div>
                             ))}
                         </div>
                    </div>

                    <div className="h-px bg-gray-100 w-full mb-6" />

                    <h5 className="font-bold text-gray-900 mb-2 mt-3">Your price summary</h5>
                    
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-stone-600">
                            <span>Subtotal</span>
                            <span className="font-medium text-stone-900">{productService.formatPrice(order.subtotal_products)}</span>
                        </div>
                        <div className="flex justify-between text-stone-600">
                            <span>Shipping</span>
                            <span className="font-medium text-stone-900">{productService.formatPrice(order.shipping_cost)}</span>
                        </div>
                         <div className="flex justify-between text-stone-600">
                            <span>Taxes (Included)</span>
                            <span className="font-medium text-stone-900">Rp 0</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                        <div className="flex justify-between items-end mb-6">
                            <span className="font-bold text-green-600 text-lg">Total Price</span>
                            <span className="font-bold text-2xl text-green-600">{productService.formatPrice(order.total_amount)}</span>
                        </div>
                        
                        {isUnpaid && order.snap_token ? (
                             <button 
                                onClick={handlePay}
                                className="w-full py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all transform active:scale-95 rounded mt-2"
                             >
                                 Pay Now
                             </button>
                        ) : (
                             <button 
                                onClick={() => window.print()} 
                                className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors"
                             >
                                 Download Invoice
                             </button>
                        )}
                        
                        <p className="text-center text-[10px] text-gray-400 mt-3">
                            Processed safely by Midtrans
                        </p>
                    </div>

                </div>

            </div>

        </div>

      </div>
    </div>
  );
}
