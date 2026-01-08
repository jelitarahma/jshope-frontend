
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { orderService, CheckoutReview } from '@/lib/services/orderService';
import { productService } from '@/lib/services/productService';
import { midtransService } from '@/lib/services/midtransService';
import Swal from 'sweetalert2';

const shippingOptions = [
  { id: 'regular', name: 'Regular Shipping', cost: 15000, duration: '3-5 days' },
  { id: 'express', name: 'Express Shipping', cost: 30000, duration: '1-2 days' },
  { id: 'same_day', name: 'Same Day Delivery', cost: 50000, duration: 'Today' },
];

const paymentMethods = [
  { id: 'midtrans', name: 'Online Payment', description: 'Credit Card, Bank Transfer, E-Wallet' },
  { id: 'cod', name: 'Cash on Delivery', description: 'Pay when you receive the order' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [review, setReview] = useState<CheckoutReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);


  const [shippingAddress, setShippingAddress] = useState('');
  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0]);
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'Please login to checkout.',
        confirmButtonColor: '#f59e0b',
      }).then(() => router.push('/auth?mode=login'));
      return;
    }

    fetchCheckoutReview();
  }, [router]);

  useEffect(() => {
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

  const fetchCheckoutReview = async () => {
    try {
      const data = await orderService.getCheckoutReview();
      if (!data.items || data.items.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No Items',
          text: 'Your cart is empty. Please add items first.',
        }).then(() => router.push('/products'));
        return;
      }
      setReview(data);
    } catch (error) {
      console.error('Error fetching checkout review:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load checkout. Please try again.',
      }).then(() => router.push('/cart'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Address',
        text: 'Please enter your shipping address.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const checkoutData = {
        shipping_address: shippingAddress,
        shipping_method: selectedShipping.name,
        shipping_cost: selectedShipping.cost,
        payment_method: selectedPayment.id,
        note: note || undefined,
      };

      const response = await orderService.checkout(checkoutData);

      if (selectedPayment.id === 'midtrans' && response.snap_token) {
        midtransService.openSnapPopup(
          response.snap_token,
          () => {
            Swal.fire({
              icon: 'success',
              title: 'Payment Successful!',
              text: 'Your order has been placed successfully.',
              confirmButtonColor: '#f59e0b',
            }).then(() => router.push('/clientArea/orders'));
          },
          () => {
            Swal.fire({
              icon: 'info',
              title: 'Payment Pending',
              text: 'Please complete your payment.',
              confirmButtonColor: '#f59e0b',
            }).then(() => router.push('/clientArea/orders'));
          },
          () => {
            Swal.fire({
              icon: 'error',
              title: 'Payment Failed',
              text: 'Your payment was not completed. Please try again.',
            });
          },
          () => {
            Swal.fire({
              icon: 'info',
              title: 'Payment Cancelled',
              text: 'You can complete your payment later from your orders page.',
            }).then(() => router.push('/clientArea/orders'));
          }
        );
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Order Placed!',
          text: 'Your COD order has been placed successfully.',
          confirmButtonColor: '#f59e0b',
        }).then(() => router.push('/clientArea/orders'));
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      Swal.fire({
        icon: 'error',
        title: 'Checkout Failed',
        text: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const total = (review?.subtotal || 0) + selectedShipping.cost;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white py-8">
        <div className="container-custom">
          <div className="h-8 skeleton w-48 mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 skeleton rounded-2xl" />
              <div className="h-36 skeleton rounded-2xl" />
            </div>
            <div className="h-64 skeleton rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white">
      <div className="bg-white border-b border-stone-100">
        <div className="container-custom pb-2 pt-4">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Checkout</h1>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl py-3">
              <h4 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Shipping Address
              </h4>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter your complete shipping address..."
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:outline-none focus:border-amber-400 resize-none h-24"
              />
            </div>
            <div className="bg-white rounded-2xl py-3">
              <h4 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                Shipping Method
              </h4>
              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`
                      flex items-center justify-between p-4 mb-2 rounded-xl border-2 cursor-pointer transition-all
                      ${selectedShipping.id === option.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-stone-200 hover:border-amber-300'
                      }
                    `}
                    style={{
                      marginRight: '15px',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center
                          ${selectedShipping.id === option.id ? 'border-amber-500' : 'border-stone-300'}
                        `}
                      >
                        {selectedShipping.id === option.id && (
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-stone-800">{option.name}</span>
                        <span className="text-sm text-stone-500 ml-2">({option.duration})</span>
                      </div>
                    </div>
                    <span className="font-semibold text-amber-600">
                      {productService.formatPrice(option.cost)}
                    </span>
                    <input
                      type="radio"
                      name="shipping"
                      value={option.id}
                      checked={selectedShipping.id === option.id}
                      onChange={() => setSelectedShipping(option)}
                      className="sr-only"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl py-3">
              <h4 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment Method
              </h4>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`
                      flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${selectedPayment.id === method.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-stone-200 hover:border-amber-300'
                      }
                    `}
                    style={{
                      marginRight: '15px',
                    }}
                  >
                    <div
                      className={`
                        w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${selectedPayment.id === method.id ? 'border-amber-500' : 'border-stone-300'}
                      `}
                    >
                      {selectedPayment.id === method.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-stone-800">{method.name}</span>
                      <p className="text-sm text-stone-500">{method.description}</p>
                    </div>
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selectedPayment.id === method.id}
                      onChange={() => setSelectedPayment(method)}
                      className="sr-only"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl py-3">
              <h4 className="text-lg font-bold text-stone-800 mb-4">Order Note (Optional)</h4>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any special instructions for your order..."
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:outline-none focus:border-amber-400 resize-none h-20"
              />
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-4 border border-stone-100 sticky top-24">
              <h4 className="text-lg font-bold text-stone-800 mb-4">Order Summary</h4>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {review?.items.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                      {(item.thumbnail || item.thumbnail_url) ? (() => {
                        let imgUrl = item.thumbnail || item.thumbnail_url || '';
                         // Normalize localhost to 127.0.0.1
                        if (imgUrl.includes('localhost')) {
                            imgUrl = imgUrl.replace('localhost', '127.0.0.1');
                        }
                        
                        // Handle relative paths
                        if (!imgUrl.startsWith('http')) {
                            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jshope-backend-phs3.vercel.app';
                            imgUrl = `${baseUrl}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
                        }

                        return (
                        <Image
                          src={imgUrl}
                          alt={item.product_name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                          unoptimized={imgUrl.includes('127.0.0.1') || imgUrl.includes('localhost')}
                        />
                        );
                      })() : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm mb-0 font-medium text-stone-800 truncate">
                        {item.product_name}
                      </p>
                      <p className="text-xs mb-0 text-stone-500">
                        {item.variant_name} x {item.quantity}
                      </p>
                      <p className="text-sm mb-0 font-semibold text-amber-600">
                        {productService.formatPrice(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-100 pt-4 space-y-3">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{productService.formatPrice(review?.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span>{productService.formatPrice(selectedShipping.cost)}</span>
                </div>
              </div>

              <div className="border-t border-stone-100 pt-4 mt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-stone-800">Total</span>
                  <span className="text-xl font-bold text-amber-600">
                    {productService.formatPrice(total)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-2 mt-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Checkout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
